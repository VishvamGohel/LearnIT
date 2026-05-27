import { NextResponse } from 'next/server';
import { groqClient, getGroqModelName } from '@/lib/groq';
import { z } from 'zod';

const tutorSchema = z.object({
  message: z.string().min(1, "Message is required"),
  history: z.array(
    z.object({
      id: z.string().optional(),
      role: z.string(),
      content: z.string(),
      timestamp: z.number().optional()
    })
  ),
  nodeTitle: z.string().optional()
});

const SOCRATIC_SYSTEM_PROMPT = `
You are a highly skilled Socratic mentor. Your job is to guide the user to learn the specific topic from first principles.
RULES:
1. NEVER directly state the answer, definitions, or full code solutions.
2. Ask one simple, focused question at a time to lead the user to make the connection.
3. Validate their logic. If they make a mistake, do not say "No, that's wrong." Ask a question that points out the contradiction.
4. Keep answers short, crisp, and high-impact.
5. If the user asks for the answer directly, refuse politely and ask them to break down the immediate sub-problem.
6. CHECKPOINT EVALUATION: If the conversation is currently addressing a "Checkpoint Challenge", you must evaluate the user's answer. 
   - They do not need to say the exact rigid keywords. A strong conceptual understanding combined with related terms is sufficient to pass.
   - If they pass the checkpoint, you MUST include the exact string "[CHECKPOINT_PASSED]" at the very end of your response. This is a hidden trigger the system reads.
   - If they fail the checkpoint, guide them closer to the answer but DO NOT include the trigger.
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = tutorSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }
    const { message, history, nodeTitle } = parseResult.data;

    const conversationLog = history.map((msg: any) => {
      const role = msg.role.toUpperCase();
      return `[${role}]: ${msg.content}`;
    }).join('\n\n');

    const contextualPrompt = `
Topic we are currently focusing on: ${nodeTitle || 'General Topic'}. 
\n${SOCRATIC_SYSTEM_PROMPT}

--- PREVIOUS CONVERSATION HISTORY ---
${conversationLog}
-------------------------------------

Please respond to the following user message according to your Socratic rules:
[USER]: ${message}
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
