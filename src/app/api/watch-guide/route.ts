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
    | {
        topic?: string;
        reflection?: string;
        userMessage?: string;
        /** Actual video title from YouTube — anchor guide copy to this */
        videoTitle?: string;
      }
    | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { topic, reflection, userMessage, videoTitle } = body;
  const safeTopic = (topic || "").trim();
  const safeReflection = (reflection || "").trim();
  const safeVideoTitle = (videoTitle || "").trim();

  if (!safeTopic && !userMessage?.trim() && !safeVideoTitle) {
    return NextResponse.json(
      { error: "Missing topic, videoTitle, or userMessage" },
      { status: 400 }
    );
  }

  const system = `
You are a calm, reflective guide beside the user while they watch a video in Innernet.

Tone: soft, measured, non-performative; short grounded sentences (1–3). No hype, no clickbait.

Critical — avoid generic openers:
- Do NOT start with "This video explores…", "As you watch…", "Consider how…", or similar template filler.
- Do NOT speak in vague abstractions detached from what they actually searched and what the video is titled.

Instead:
- Tie your words to the user's search query and the video's actual title when provided.
- Say something specific: what they were looking for + what this particular title suggests is in frame.
- If the title is literal (e.g. a person, place, how-to), reflect that directly.
- Help them notice one concrete angle to watch for — not a lecture.

Never mention algorithms or feeds. Say "what you're watching" or refer by substance, not platform.
`;

  const messages: Array<{ role: "system" | "user"; content: string }> = [
    { role: "system", content: system },
  ];

  if (safeTopic || safeReflection || safeVideoTitle) {
    const titleLine = safeVideoTitle
      ? `Video title (use this — be specific): "${safeVideoTitle}"`
      : "Video title: (not provided — infer only from search below)";
    messages.push({
      role: "user",
      content: `User's search / what they asked for: "${safeTopic || "(none)"}".

${titleLine}

On-screen reflection line (context only, do not repeat verbatim):
"${safeReflection || "(none)"}"

Write 2 short sentences max:
1) Acknowledge their search and what this specific video title suggests they're about to see.
2) One concrete suggestion for what to notice — no generic "explore themes" filler.

Forbidden openings: "This video explores", "As you watch", "Consider how", "Reflect on".
Start with substance tied to title or search.`,
    });
  }

  if (userMessage && userMessage.trim()) {
    const contextLine = safeVideoTitle
      ? `They're still watching: "${safeVideoTitle}" (search: "${safeTopic || "n/a"}").`
      : "";
    messages.push({
      role: "user",
      content: `${contextLine}
The user says: "${userMessage.trim()}".
Reply in 1–2 sentences — specific, calm. No generic "this video" filler.`,
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

