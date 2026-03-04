import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_BASE = "https://api.openai.com/v1/chat/completions";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null) as
    | { topic?: string; reflection?: string; userMessage?: string }
    | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { topic, reflection, userMessage } = body;
  const safeTopic = (topic || "").trim();
  const safeReflection = (reflection || "").trim();

  if (!safeTopic && !userMessage) {
    return NextResponse.json(
      { error: "Missing topic or userMessage" },
      { status: 400 }
    );
  }

  const system = `
You are a calm, reflective guide sitting beside the user while they watch a YouTube video inside a contemplative environment called Innernet.

Tone:
- Soft, measured, non-performative.
- You never shout, never hype, never sound like clickbait.
- You speak in short, grounded paragraphs (1–3 sentences).

Your job:
- Frame what the video is exploring at a conceptual level.
- Help the user notice patterns, themes, and what is essential.
- Never mention algorithms, feeds, or YouTube itself unless directly asked.
- You can refer to "this video" or "what you're watching" instead.
`;

  const messages: Array<{ role: "system" | "user"; content: string }> = [
    { role: "system", content: system },
  ];

  if (safeTopic || safeReflection) {
    messages.push({
      role: "user",
      content: `The user is exploring: "${safeTopic || "(no explicit topic)"}".

Reflection shown on screen:
"${safeReflection || "(none yet)"}"

Give me a short guide summary (2 sentences max) that:
- Names what is being explored.
- Suggests how to watch this with more intention.

Do not ask questions. Do not mention YouTube or algorithms.`,
    });
  }

  if (userMessage && userMessage.trim()) {
    messages.push({
      role: "user",
      content: `The user says: "${userMessage.trim()}". Respond briefly (1–2 sentences) in the same calm, reflective tone.

Do not restate the original summary in full; gently extend or clarify it.`,
    });
  }

  try {
    const res = await fetch(OPENAI_API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.6,
        max_tokens: 220,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: "OpenAI API error", details: err },
        { status: res.status }
      );
    }

    const data = await res.json();
    const text =
      data?.choices?.[0]?.message?.content?.trim() ||
      "I’m here beside you. Let’s watch this slowly and see what feels important.";

    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json(
      { error: "Guide generation failed", details: String(error) },
      { status: 500 }
    );
  }
}

