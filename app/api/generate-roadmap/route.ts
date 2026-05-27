import { NextResponse } from 'next/server';
import { groqClient, getGroqModelName } from '@/lib/groq';
import { RoadmapNode } from '@/types';
import { z } from 'zod';

const generateRoadmapSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(100, "Topic must be 100 characters or less"),
  transcript: z.array(
    z.object({
      id: z.string().optional(),
      role: z.string(),
      content: z.string(),
      timestamp: z.number().optional()
    })
  )
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = generateRoadmapSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }
    const { topic, transcript } = parseResult.data;

    // Extract user context from the assessment transcript
    const userMessages = transcript.filter((t: any) => t.role === 'user');
    const userLevel = userMessages[0]?.content || 'beginner';
    const userGoal = userMessages[1]?.content || 'general understanding';
    const userPace = userMessages[2]?.content || 'standard pace';

    const prompt = `
You are an expert curriculum designer and educator.
The user wants to learn about the topic: "${topic}".
Their experience level: "${userLevel}"
Their primary goal: "${userGoal}"
Their preferred pace/depth: "${userPace}"

Based on their experience, generate a highly structured learning roadmap with exactly 3 to 5 sequential nodes.
For each node, you MUST provide:
1. "title": A short, punchy title.
2. "description": A brief 1-2 sentence description of what the learner will achieve.
3. "checkpointQuestion": A specific, conceptual question to test their understanding of this node.
4. "checkpointAnswer": The conceptual answer key for the checkpoint.

Do NOT include any lesson content — that will be generated separately.

Return the response strictly as a JSON object containing a single key "nodes", which maps to an array of these node objects.

Example format:
{
  "nodes": [
    {
      "title": "Introduction to concepts",
      "description": "Understanding the baseline.",
      "checkpointQuestion": "What is the core idea?",
      "checkpointAnswer": "The core idea is X."
    }
  ]
}
`;

    let nodesData;

    try {
      const chatCompletion = await groqClient.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: getGroqModelName(),
        temperature: 0.7,
        response_format: { type: "json_object" }
      });
      let text = chatCompletion.choices[0]?.message?.content || "{}";

      const parsed = JSON.parse(text);
      nodesData = parsed.nodes || [];
      if (nodesData.length === 0) throw new Error("Nodes array was empty");
    } catch (apiError: any) {
      console.warn("Groq API failed or JSON parse error. Falling back to mock data.", apiError.message);

      nodesData = [
        {
          "title": "Introduction to React State",
          "description": "Understanding how data flows and changes over time in a React component.",
          "checkpointQuestion": "Why should you never mutate state directly in React, and what should you use instead?",
          "checkpointAnswer": "You should not mutate state directly because React won't know it changed and won't re-render. You should use the setter function provided by useState."
        },
        {
          "title": "Advanced Effect Hook",
          "description": "Synchronizing a component with an external system using useEffect.",
          "checkpointQuestion": "What happens if you omit the dependency array entirely in a useEffect hook?",
          "checkpointAnswer": "The effect will run after every single render of the component."
        }
      ];
    }

    // Build the final roadmap nodes (no learningMaterial — generated lazily)
    const nodes: RoadmapNode[] = nodesData.map((n: any, index: number) => ({
      ...n,
      id: `node_${Date.now()}_${index}`,
      order: index,
      status: index === 0 ? 'in-progress' : 'locked',
      learningMaterial: undefined,
      isLoadingLesson: false,
    }));

    return NextResponse.json({ nodes, userLevel, userGoal, userPace });
  } catch (error) {
    console.error("Roadmap generation failed:", error);
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}
