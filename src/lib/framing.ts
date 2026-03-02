/**
 * Rule-based framing line for Generative Journey.
 * No LLM. Short interpretive sentence from query, under 12 words.
 * Calm, human-readable; not SEO, no metrics.
 */

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "can", "i", "you", "we", "they", "it", "this", "that", "what", "how", "why", "when", "where",
]);

const STARTERS = [
  "Exploring",
  "A look into",
  "A journey through",
  "Reflections on",
  "Spaces for",
  "Ideas around",
];

/** Extract meaningful keywords from query (lowercase, no stop words). */
function extractKeywords(query: string): string[] {
  const words = query
    .toLowerCase()
    .replace(/[^\w\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  return [...new Set(words)];
}

/** Turn keyword list into a short phrase (e.g. "compact living" or "tiny homes"). */
function keywordsToPhrase(keywords: string[]): string {
  if (keywords.length === 0) return "what you asked for";
  if (keywords.length <= 3) return keywords.join(" ");
  return keywords.slice(0, 3).join(" ");
}

/**
 * Generate a calm framing line from the user's prompt.
 * Under 12 words. Rule-based; no LLM.
 */
export function generateFramingLine(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return "Exploring what you had in mind.";

  const keywords = extractKeywords(trimmed);
  const phrase = keywordsToPhrase(keywords);
  const starter = STARTERS[Math.abs(hashCode(trimmed)) % STARTERS.length];
  const line = `${starter} ${phrase}.`;
  const words = line.split(/\s+/);
  if (words.length <= 12) return line;
  return words.slice(0, 12).join(" ") + ".";
}

/** Extract key phrase from query for use in reflection and branch descriptions. */
export function getPhraseFromQuery(query: string): string {
  const keywords = extractKeywords(query.trim());
  return keywordsToPhrase(keywords) || "what you had in mind";
}

const REFLECTION_TEMPLATES: ((phrase: string) => string)[] = [
  (p) => `You're exploring ${p} — how it shapes perception and practice.`,
  (p) => `A look into ${p} and how it influences the way we think.`,
  (p) => `Foundations of ${p}, and how they show up in daily life.`,
  (p) => `You're moving toward ${p} — core ideas and their reach.`,
  (p) => `A quiet pass through ${p} and its implications.`,
];

/** Intent reflection: 1–2 sentences, under 25 words. Calm, interpretive. Above "First stop". */
export function generateIntentReflection(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return "You're exploring what you had in mind.";

  const phrase = getPhraseFromQuery(trimmed);
  const template = REFLECTION_TEMPLATES[Math.abs(hashCode(trimmed)) % REFLECTION_TEMPLATES.length];
  const out = template(phrase);
  const words = out.split(/\s+/);
  if (words.length <= 25) return out;
  return words.slice(0, 25).join(" ") + ".";
}

const BRANCH_TRANSITIONS = [
  "If we take this further, we could…",
  "From here, we can move toward…",
  "A few directions from here…",
];

/** Transitional branch sentence: conversational, under 15 words. */
export function getBranchTransitionSentence(seed?: string): string {
  const i = seed ? Math.abs(hashCode(seed)) % BRANCH_TRANSITIONS.length : 0;
  return BRANCH_TRANSITIONS[i];
}

const INTERLUDE_VERBS = ["Discovering", "Exploring", "Entering", "A look at", "Moving toward"];

/** Primary line for intent interlude: confident title (e.g. "Discovering Scotland"). */
export function getInterludePrimaryFromIntent(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return "Exploring";
  const phrase = getPhraseFromQuery(trimmed);
  const titleCase = phrase.replace(/\b\w/g, (c) => c.toUpperCase());
  const verb = INTERLUDE_VERBS[Math.abs(hashCode(trimmed)) % INTERLUDE_VERBS.length];
  if (verb === "A look at") return `${verb} ${titleCase}`;
  return `${verb} ${titleCase}`;
}

/** Secondary line for intent interlude: same as reflection (quiet pass, foundations). */
export function getInterludeSecondaryFromIntent(query: string): string {
  return generateIntentReflection(query);
}

/** Primary line for branch interlude: cleaned branch title, bold. */
export function getInterludePrimaryFromBranch(branchTitle: string): string {
  const t = branchTitle.trim().replace(/\s+/g, " ");
  if (!t) return "This direction";
  return t.replace(/\b\w/g, (c) => c.toUpperCase());
}

const BRANCH_INTERLUDE_SECONDARY: ((title: string) => string)[] = [
  (t) => `We step into ${t.toLowerCase()} and its layers.`,
  (t) => `A quiet pass through lesser-known angles and overlooked details.`,
  (t) => `In this direction, we explore ${t.toLowerCase()} and how it connects.`,
];

/** Secondary line for branch interlude: short guiding sentence. */
export function getInterludeSecondaryFromBranch(branchTitle: string): string {
  const trimmed = branchTitle.trim();
  if (!trimmed) return "We step into lesser-known stories and overlooked details.";
  const template = BRANCH_INTERLUDE_SECONDARY[Math.abs(hashCode(trimmed)) % BRANCH_INTERLUDE_SECONDARY.length];
  return template(trimmed);
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}
