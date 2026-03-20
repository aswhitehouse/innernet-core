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
You are a helpful chat companion while the user watches a video in an app called Innernet.

Initial summary (when no user message yet):
- Matter-of-fact and plain. Say what the video is likely about based on its title and what they searched — like a short TV guide blurb, not a mindfulness script.
- No "journey", "essence", "hold space", "notice how", "evokes", "themes", or similar new-age or therapy-speak.
- Be careful with implied qualifiers from the search (e.g. “vintage”, “classic”, “old”, “restoration”). If the video title (or obvious wording) does *not* support that qualifier, don’t force it. Prefer what the video title actually indicates, and if there’s a mismatch, phrase it plainly (e.g. “This appears to be about X, not clearly vintage/old.”).
- 1–2 short sentences. Direct. You can say "This one’s about…" or "Looks like…" — normal language.

When the user sends a message:
- Answer like a normal chat: genuinely respond to what they asked — facts, opinions, jokes, tangents, whatever fits.
- Do not restate the user's question. Start directly with the answer.
- You don’t have to tie every reply back to "the video" or "intention". If they ask something off-topic, answer normally.
- Keep replies concise (1–4 sentences) unless they ask for more.
- Still avoid shouting, clickbait, or mentioning algorithms/feeds unless they ask.

Safety / topic guardrails:
- Stay within the boundaries of safe, appropriate content. If the user asks for disallowed/unsafe content (e.g. instructions for harm, hate/harassment, explicit sexual content), refuse briefly and suggest a safer alternative.
- If the user repeatedly tries to derail into a clearly unrelated topic, gently redirect back to the user’s thread using the provided context (their search query and/or the video title), e.g. "It’s important we stay on topic for the video they’re watching. What would you like to know about that?"
- Do not invent new unrelated “threads” just to satisfy off-topic prompts.

Never mention YouTube by name unless they ask.
`;

  const messages: Array<{ role: "system" | "user"; content: string }> = [
    { role: "system", content: system },
  ];

  const isReply = !!userMessage?.trim();

  // For follow-ups, do NOT include the “write a brief summary” instruction.
  // Otherwise the model often reprints the initial summary before answering.
  if (!isReply && (safeTopic || safeReflection || safeVideoTitle)) {
    const titleLine = safeVideoTitle
      ? `Video title: "${safeVideoTitle}"`
      : "Video title unknown.";
    messages.push({
      role: "user",
      content: `They searched for: "${safeTopic || "(nothing specific)"}".

${titleLine}

(Optional context from the app — don’t quote it; use only if helpful.)
"${safeReflection || "(none)"}"

Write a brief, plain summary (1–2 sentences): what this video probably is, based on title + search. No fluff.`,
    });
  }

  if (isReply) {
    const context =
      safeVideoTitle || safeTopic
        ? `Context if relevant — title: "${safeVideoTitle || "n/a"}", search: "${safeTopic || "n/a"}".`
        : "";
    messages.push({
      role: "user",
      content: `${context}
User message: "${userMessage!.trim()}"

Answer the user's message.`,
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
        temperature: userMessage?.trim() ? 0.75 : 0.45,
        max_tokens: 280,
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
      "Say what you want to know and I’ll answer.";

    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json(
      { error: "Guide generation failed", details: String(error) },
      { status: 500 }
    );
  }
}
