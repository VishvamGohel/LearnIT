import { NextResponse } from 'next/server';
import { groqClient, getGroqModelName } from '@/lib/groq';
import { z } from 'zod';

export const maxDuration = 60;

const tutorSchema = z.object({
  message: z.string().optional(),
  history: z.array(
    z.object({
      id: z.string().optional(),
      role: z.string(),
      content: z.string(),
      timestamp: z.number().optional()
    })
  ),
  nodeTitle: z.string().optional(),
  failedContext: z.array(z.any()).optional()
});

const SOCRATIC_SYSTEM_PROMPT = `
You are a highly skilled, emotionally intelligent AI Mentor. Your job is to help the user learn the specific topic.
The user may be talking to you because they failed a checkpoint quiz or because they need general help.

RULES for PROGRESSIVE SCAFFOLDING:
1. When addressing a concept the user missed or asked about, start by asking a simple, leading Socratic question.
2. If the user struggles or answers incorrectly again, provide a strong hint or a relatable analogy, followed by a simpler question.
3. FRUSTRATION CLAUSE (CRITICAL): If the user explicitly says "I don't know", "tell me", "just give me the answer", or expresses frustration, IMMEDIATELY switch to "Teacher Mode".
   - Do NOT ask another question that forces them to guess.
   - Explain the concept clearly, directly, and empathetically.
   - Then, ask a trivial check-for-understanding question (or simply ask "Does that make sense?") and prepare to pass them.

CHECKPOINT EVALUATION:
- If the conversation is addressing missed concepts, you must evaluate if the user now understands them.
- They do not need to use rigid keywords; conceptual understanding is enough.
- Once they understand all missed concepts (or if you invoked the Frustration Clause and explained it to them), you MUST include the exact string "[CHECKPOINT_PASSED]" at the very end of your response.
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = tutorSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }
    const { message, history, nodeTitle, failedContext } = parseResult.data;

    const conversationLog = history.map((msg: any) => {
      const role = msg.role.toUpperCase();
      return `[${role}]: ${msg.content}`;
    }).join('\n\n');

    let failedContextString = '';
    if (failedContext && failedContext.length > 0) {
      failedContextString = '\n--- FAILED QUIZ CONTEXT ---\nThe user recently failed the following questions. Focus on helping them understand these concepts:\n';
      failedContext.forEach((q: any, i: number) => {
        failedContextString += `${i + 1}. Question: "${q.question}"\n   Correct concept: ${q.explanation}\n`;
      });
      failedContextString += '---------------------------\n';
    }

    const contextualPrompt = `
Topic we are currently focusing on: ${nodeTitle || 'General Topic'}. 
\n${SOCRATIC_SYSTEM_PROMPT}
${failedContextString}
--- PREVIOUS CONVERSATION HISTORY ---
${conversationLog}
-------------------------------------

Please respond according to your Socratic rules:
${message ? `[USER]: ${message}` : `Initiate the conversation based on the system prompt instructions.`}
`;

    const result = await groqClient.chat.completions.create({
      messages: [{ role: 'user', content: contextualPrompt }],
      model: getGroqModelName(),
      temperature: 0.7,
    });
    const responseText = result.choices[0]?.message?.content || "";

    return NextResponse.json({ reply: responseText });
  } catch (error) {
    console.error('Error in AI Tutor API:', error);
    return NextResponse.json(
      { error: 'Failed to generate response. Make sure GROQ_API_KEY is set.' },
      { status: 500 }
    );
  }
}
