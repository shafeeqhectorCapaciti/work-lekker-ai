import { z } from "zod";

export const TONES = ["Formal", "Friendly", "Persuasive"] as const;
export type Tone = (typeof TONES)[number];

export const emailInputSchema = z.object({
  recipient: z.string().trim().min(1, "Add a recipient").max(200),
  context: z.string().trim().min(1, "Add a subject or context").max(2000),
  keyPoints: z.string().trim().max(4000).default(""),
  tone: z.enum(TONES),
});
export type EmailInput = z.infer<typeof emailInputSchema>;

export const meetingInputSchema = z.object({
  notes: z.string().trim().min(20, "Paste at least a few lines of notes").max(20000),
});
export type MeetingInput = z.infer<typeof meetingInputSchema>;

const timeString = z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM");

export const plannerTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  urgent: z.boolean(),
  important: z.boolean(),
  minutes: z.number().int().min(5).max(600),
});
export type PlannerTask = z.infer<typeof plannerTaskSchema>;

export const plannerInputSchema = z.object({
  tasks: z.array(plannerTaskSchema).min(1, "Add at least one task").max(30),
  dayStart: timeString,
  dayEnd: timeString,
});
export type PlannerInput = z.infer<typeof plannerInputSchema>;

export type Quadrant = "Do first" | "Schedule" | "Delegate" | "Later";

/** Eisenhower matrix: urgency × importance decides the bucket. */
export function quadrantFor(task: Pick<PlannerTask, "urgent" | "important">): Quadrant {
  if (task.urgent && task.important) return "Do first";
  if (task.important) return "Schedule";
  if (task.urgent) return "Delegate";
  return "Later";
}

const QUADRANT_RANK: Record<Quadrant, number> = {
  "Do first": 0,
  Schedule: 1,
  Delegate: 2,
  Later: 3,
};

/** Stable sort of tasks by Eisenhower priority. */
export function sortByPriority<T extends Pick<PlannerTask, "urgent" | "important">>(tasks: T[]): T[] {
  return tasks
    .map((task, index) => ({ task, index }))
    .sort(
      (a, b) =>
        QUADRANT_RANK[quadrantFor(a.task)] - QUADRANT_RANK[quadrantFor(b.task)] ||
        a.index - b.index,
    )
    .map(({ task }) => task);
}

/* ---------- Prompts ---------- */

const TONE_GUIDE: Record<Tone, string> = {
  Formal: "professional, polished and courteous; no slang or emojis",
  Friendly: "warm, approachable and conversational while still professional",
  Persuasive: "confident and compelling, with clear benefits and a strong call to action",
};

export const EMAIL_INSTRUCTIONS = `You are an expert workplace communication writer.
Write one complete, ready-to-send email.
Output format (plain text, no markdown, no asterisks):
Subject: <concise subject line>

<greeting>

<body paragraphs>

<sign-off>
[Your Name]
Never invent facts, figures, names or commitments that were not provided.`;

export function buildEmailPrompt(input: EmailInput): string {
  return [
    `Recipient: ${input.recipient}`,
    `Subject / context: ${input.context}`,
    `Key points to cover:\n${input.keyPoints || "(none given — keep it brief and relevant to the context)"}`,
    `Tone: ${input.tone} — ${TONE_GUIDE[input.tone]}`,
  ].join("\n\n");
}

export const MEETING_INSTRUCTIONS = `You turn raw meeting notes into a clear, structured summary.
Output exactly these three sections, in this order, as plain text (no markdown symbols like # or **):

DECISIONS
- <one decision per line>

ACTION ITEMS
- <Owner>: <task>

DEADLINES
- <date or timeframe> — <what is due> (<owner if known>)

Rules: use only information in the notes; write "Unassigned" when no owner is mentioned;
write "- None identified" when a section has nothing. Keep each bullet short.`;

export function buildMeetingPrompt(input: MeetingInput): string {
  return `Raw meeting notes:\n"""\n${input.notes}\n"""`;
}

export const PLANNER_INSTRUCTIONS = `You are a productivity coach who builds realistic daily schedules using the Eisenhower matrix.
Output plain text (no markdown symbols like # or **) with exactly these sections:

PRIORITY ORDER
1. <task> — <bucket> (<minutes> min)

DAILY SCHEDULE
HH:MM – HH:MM  <task or break>

NOTES
- <short, practical tips: what to delegate, defer, or batch>

Rules: "Do first" tasks go early in the day, "Schedule" tasks get focused blocks next,
"Delegate" tasks get short slots or a note to hand off, "Later" tasks only if time remains.
Add short breaks roughly every 90 minutes and a lunch break if the day spans midday.
Stay within the working hours given. If tasks don't fit, say which ones move to tomorrow.`;

export function buildPlannerPrompt(input: PlannerInput): string {
  const lines = sortByPriority(input.tasks).map(
    (t, i) =>
      `${i + 1}. ${t.title} | bucket: ${quadrantFor(t)} | urgent: ${t.urgent ? "yes" : "no"} | important: ${t.important ? "yes" : "no"} | ${t.minutes} min`,
  );
  return `Working hours: ${input.dayStart} to ${input.dayEnd}\n\nTasks:\n${lines.join("\n")}`;
}
