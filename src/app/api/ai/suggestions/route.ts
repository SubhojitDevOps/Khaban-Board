import { NextResponse } from "next/server";
import type { Task } from "@/types/task";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

type RequestBody = {
  tasks?: Task[];
};

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing GEMINI_API_KEY. Add it in Vercel Environment Variables and redeploy.",
      },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as RequestBody;
    const tasks = Array.isArray(body.tasks) ? body.tasks.slice(0, 30) : [];

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: buildPrompt(tasks),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 700,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: data?.error?.message || "Gemini request failed.",
        },
        { status: response.status },
      );
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({
      ok: true,
      data: {
        suggestion: text || "No suggestion was generated. Try again with more tasks on the board.",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "AI suggestion failed.",
      },
      { status: 500 },
    );
  }
}

function buildPrompt(tasks: Task[]) {
  const taskSummary = tasks.map((task) => ({
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    owner: task.owner || "Unassigned",
    dueDate: task.dueDate || "",
    labels: task.labels || "",
    project: task.project || "",
    sprint: task.sprint || "",
    estimate: task.estimate || "",
    blocked: Boolean(task.blocked),
    blockerReason: task.blockerReason || "",
    parentId: task.parentId || "",
  }));

  return `You are Khaban Board's AI sprint assistant for a small startup team.

Analyze the current Kanban board and return concise, practical guidance.

Rules:
- Keep the answer under 180 words.
- Use short sections: Sprint Focus, Risks, Next Actions.
- Mention urgent/high priority work first.
- Call out blockers and overloaded owners.
- Be specific to the task data.
- Do not invent task names.

Board tasks JSON:
${JSON.stringify(taskSummary, null, 2)}`;
}
