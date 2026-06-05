import { NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';
import { groqClient, getGroqModelName } from '@/lib/groq';
import { z } from 'zod';

export const maxDuration = 60;

import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini embedding client — uses gemini-embedding-001 (768 dimensions)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function getEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent({
    content: { parts: [{ text }], role: 'user' },
    outputDimensionality: 768, // Match the vector(768) Supabase column
  });
  return result.embedding.values;
}

const generateLessonSchema = z.object({
  roadmapId: z.string().optional(),
  nodeTitle: z.string().min(1, "nodeTitle is required"),
  nodeDescription: z.string().min(1, "nodeDescription is required"),
  topic: z.string().min(1, "topic is required"),
  userLevel: z.string().optional(),
  userGoal: z.string().optional(),
  userPace: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = generateLessonSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }
    const { roadmapId, nodeTitle, nodeDescription, topic, userLevel, userGoal, userPace } = parseResult.data;

    // --- RAG LOGIC: Retrieve PDF chunks if roadmapId is provided ---
    let pdfContext = "";
    if (roadmapId) {
      try {
        const queryText = `${topic}. ${nodeTitle}: ${nodeDescription}`;
        const queryEmbedding = await getEmbedding(queryText);

        // Call the Supabase match function
        const { data: chunks, error: matchError } = await supabase.rpc('match_document_chunks', {
          query_embedding: queryEmbedding,
          match_threshold: 0.2, // Lower threshold to ensure we get some context
          match_count: 5,
          target_roadmap_id: roadmapId
        });

        if (!matchError && chunks && chunks.length > 0) {
          pdfContext = `\n\n## SOURCE MATERIAL (MANDATORY)\nYou MUST base your lesson heavily on the following extracted text from the user's uploaded document. Do not invent contradictory facts. If the source material provides definitions or examples, use them.\n\n--- BEGIN SOURCE MATERIAL ---\n`;
          pdfContext += chunks.map((c: any) => c.content).join('\n\n...\n\n');
          pdfContext += `\n--- END SOURCE MATERIAL ---\n\n`;
        }
      } catch (ragError) {
        console.error("RAG retrieval failed, falling back to general knowledge:", ragError);
        // We gracefully fallback to normal generation if RAG fails
      }
    }

    const prompt = `
You are a world-class educator and textbook author. Your task is to write an EXTREMELY detailed, 
self-contained lesson that a student can read and fully understand WITHOUT a teacher.
${pdfContext}
## Context
- **Subject**: ${topic}
- **Lesson Title**: ${nodeTitle}
- **Lesson Goal**: ${nodeDescription}
- **Student's Experience Level**: ${userLevel}
- **Student's Primary Goal**: ${userGoal}
- **Student's Preferred Pace**: ${userPace}

## Your Mission
Write a rich, deeply engaging lesson using the LearnIT Learning Framework. The student should 
finish reading this and feel like they truly "get it" — not just know the facts, but understand 
the *why* and *how* at an intuitive level.

## MANDATORY LESSON STRUCTURE
You MUST follow this exact 8-section structure. Use the exact headings shown.

---

# ${nodeTitle}

## Why This Matters
Write 1–2 concise but compelling paragraphs explaining the real-world problem this concept solves.
Make the student feel the *need* for this knowledge before you explain it.
Use a relatable scenario or story. Answer the question: "Why should I care?"

## The Core Idea
Give the simplest possible explanation using plain, everyday language.
No jargon. No technical terms. Just the core idea in its purest form.
Use a simple analogy from daily life (food, sports, games, etc.).

## Technical Breakdown
This is the main technical body. Break the concept down from first principles.
- Start from the most fundamental building block
- Layer complexity gradually
- Use **bold** for key terms when first introduced
- Use bullet points and numbered lists extensively for clarity
- Break into sub-sections with ### headings if the topic has multiple facets
- Aim for thoroughness — do NOT skip over "obvious" things, beginners need them explained

## Real-World Analogy
Provide ONE powerful, detailed real-world analogy that maps directly to the technical concept.
Walk through the analogy step by step, explicitly connecting each part of the analogy to the 
corresponding technical element. Make it memorable.

## Step-by-Step Example
Provide a concrete, detailed worked example.
- If it's a technical/coding topic: write actual code with line-by-line explanation
- If it's a conceptual topic: walk through a scenario step by step
- Show the PROCESS, not just the result
- Use code blocks for any code examples

## Common Misconceptions
List 2–3 specific mistakes beginners make with this concept.
For each mistake:
- Describe what the beginner does wrong
- Explain WHY it's wrong
- Show what to do correctly instead
Format as a list.

## Conceptual Diagram
Create a Mermaid.js diagram that visually represents the core concept.
Use ONLY valid Mermaid syntax. Preferred diagram types: graph TD, graph LR, flowchart TD, sequenceDiagram.
Rules for valid syntax:
- Node labels with special characters MUST be quoted: A["Label (with parens)"]
- Use --> for arrows, -- text --> for labeled arrows
- Do NOT use parentheses in unquoted labels

\`\`\`mermaid
[Your diagram here]
\`\`\`

## Key Takeaways
Summarize the 5–7 most important things the student should remember.
Write each as a complete sentence starting with an action verb.
These should be memorable and scannable for quick review.

---

IMPORTANT RULES:
- Write in a warm, encouraging, conversational tone — like a brilliant friend explaining something
- Be concise and respect the user's time. Avoid fluff.
- Use **bold** liberally for important terms and concepts
- The lesson should be around 500-600 words in the body sections (about 20-30% shorter than a typical textbook chapter)
- Adapt the complexity and vocabulary to the student's level: "${userLevel}"
- Tailor examples and content depth toward their goal ("${userGoal}") and pace ("${userPace}")
- Every section is MANDATORY — do not skip any

OUTPUT FORMAT:
Do NOT wrap the entire output in JSON. 
First, output the entire 8-section markdown lesson normally.
Then, at the very end of your response, output a markdown JSON code block containing the quiz.

The JSON block MUST follow this exact format:
\`\`\`json
{
  "quiz": [
    {
      "question": "Question text here...",
      "options": ["A", "B", "C", "D"],
      "correctAnswerIndex": 0,
      "explanation": "Brief explanation of why this is correct."
    }
  ]
}
\`\`\`
`;

    let rawOutput = "";

    try {
      // Primary Engine: Gemini (Preferred for high quality)
      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      rawOutput = result.response.text();
    } catch (geminiError: any) {
      console.warn('Gemini failed (likely 503 High Demand). Silently falling back to Groq...', geminiError.message);
      
      // Fallback Engine: Groq (Llama 3 70B)
      const chatCompletion = await groqClient.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI tutor. Your writing style MUST perfectly mimic Google\'s Gemini models. This means your writing should be extremely warm, deeply engaging, highly structured, and use markdown (like bolding and lists) beautifully to break up text. You MUST end your response with the requested JSON block.'
          },
          { role: 'user', content: prompt }
        ],
        model: getGroqModelName(),
        temperature: 0.7,
      });
      rawOutput = chatCompletion.choices[0]?.message?.content || "";
      
      if (!rawOutput) {
        throw new Error("Both Gemini and Groq failed to generate content.");
      }
    }

    // Parse the hybrid output
    // Find the last ```json block
    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/g;
    let match;
    let lastJsonMatch = null;
    
    while ((match = jsonBlockRegex.exec(rawOutput)) !== null) {
      lastJsonMatch = match;
    }

    if (!lastJsonMatch) {
       console.error("No JSON block found in output:", rawOutput);
       throw new Error("Invalid output format: Missing JSON block");
    }

    const jsonString = lastJsonMatch[1];
    
    // The markdown content is everything before the JSON block
    const markdownContent = rawOutput.substring(0, lastJsonMatch.index).trim();

    let parsedQuiz;
    try {
      parsedQuiz = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw JSON:", jsonString);
      throw parseError;
    }
    
    if (!parsedQuiz.quiz || !Array.isArray(parsedQuiz.quiz)) {
       throw new Error("Invalid JSON structure: Missing quiz array");
    }

    return NextResponse.json({ 
      content: markdownContent,
      quiz: parsedQuiz.quiz 
    });
  } catch (error: any) {
    console.error('Lesson generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate lesson. Make sure GEMINI_API_KEY is set.' },
      { status: 500 }
    );
  }
}
