import { NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { nodeTitle, nodeDescription, topic, userLevel, userFocus } = await req.json();

    const prompt = `
You are a world-class educator and textbook author. Your task is to write an EXTREMELY detailed, 
self-contained lesson that a student can read and fully understand WITHOUT a teacher.

## Context
- **Subject**: ${topic}
- **Lesson Title**: ${nodeTitle}
- **Lesson Goal**: ${nodeDescription}
- **Student's Experience Level**: ${userLevel}
- **Student's Specific Focus**: ${userFocus}

## Your Mission
Write a rich, deeply engaging lesson using the LearnIT Learning Framework. The student should 
finish reading this and feel like they truly "get it" — not just know the facts, but understand 
the *why* and *how* at an intuitive level.

## MANDATORY LESSON STRUCTURE
You MUST follow this exact 8-section structure. Use the exact headings shown.

---

# ${nodeTitle}

## 🎯 The Hook — Why Does This Even Matter?
Write 2–3 compelling paragraphs explaining the real-world problem this concept solves.
Make the student feel the *need* for this knowledge before you explain it.
Use a relatable scenario or story. Answer the question: "Why should I care?"

## 🧒 ELI5 — Explain It Like I'm 12
Give the simplest possible explanation using plain, everyday language.
No jargon. No technical terms. Just the core idea in its purest form.
Use a simple analogy from daily life (food, sports, games, etc.).

## 🔬 The Deep Dive — First Principles Breakdown
This is the main technical body. Break the concept down from first principles.
- Start from the most fundamental building block
- Layer complexity gradually
- Use **bold** for key terms when first introduced
- Use bullet points and numbered lists extensively for clarity
- Break into sub-sections with ### headings if the topic has multiple facets
- Aim for thoroughness — do NOT skip over "obvious" things, beginners need them explained

## 💡 The Analogy — Make It Click
Provide ONE powerful, detailed real-world analogy that maps directly to the technical concept.
Walk through the analogy step by step, explicitly connecting each part of the analogy to the 
corresponding technical element. Make it memorable.

## 🛠️ Worked Example — Step by Step
Provide a concrete, detailed worked example.
- If it's a technical/coding topic: write actual code with line-by-line explanation
- If it's a conceptual topic: walk through a scenario step by step
- Show the PROCESS, not just the result
- Use code blocks for any code examples

## ⚠️ Common Mistakes — What Beginners Always Get Wrong
List 3–5 specific mistakes beginners make with this concept.
For each mistake:
- Describe what the beginner does wrong
- Explain WHY it's wrong
- Show what to do correctly instead
Format as a list.

## 🗺️ Visual Diagram
Create a Mermaid.js diagram that visually represents the core concept.
Use ONLY valid Mermaid syntax. Preferred diagram types: graph TD, graph LR, flowchart TD, sequenceDiagram.
Rules for valid syntax:
- Node labels with special characters MUST be quoted: A["Label (with parens)"]
- Use --> for arrows, -- text --> for labeled arrows
- Do NOT use parentheses in unquoted labels

\`\`\`mermaid
[Your diagram here]
\`\`\`

## ✅ Key Takeaways — Cement Your Understanding
Summarize the 5–7 most important things the student should remember.
Write each as a complete sentence starting with an action verb.
These should be memorable and scannable for quick review.

---

IMPORTANT RULES:
- Write in a warm, encouraging, conversational tone — like a brilliant friend explaining something
- Use **bold** liberally for important terms and concepts
- The lesson should be at least 800 words in the body sections
- Adapt the complexity and vocabulary to the student's level: "${userLevel}"
- Tailor examples and focus areas toward: "${userFocus}"
- Every section is MANDATORY — do not skip any
`;

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const content = result.response.text();

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Lesson generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate lesson. Make sure GEMINI_API_KEY is set.' },
      { status: 500 }
    );
  }
}
