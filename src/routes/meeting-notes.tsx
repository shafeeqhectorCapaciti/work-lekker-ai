import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarCheck, CheckCircle2, ListTodo, NotebookPen, Wand2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AiOutput } from "@/components/ai-output";
import { Field } from "@/components/field";
import { ToolPageHeader } from "@/components/tool-page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAiTask } from "@/hooks/use-ai-task";
import { summarizeMeeting } from "@/lib/ai-tools.functions";
import { meetingInputSchema } from "@/lib/tool-rules";

export const Route = createFileRoute("/meeting-notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — WorkLekker AI" },
      {
        name: "description",
        content: "Turn raw meeting notes into clear decisions, action items and deadlines with AI.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — WorkLekker AI" },
      {
        property: "og:description",
        content: "Paste your notes and get decisions, action items and deadlines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeetingSummarizer,
});

const EXAMPLE = `Weekly marketing sync – 12 Nov
Present: Aisha, Johan, Lerato, Mike
- Q4 campaign budget discussed. Agreed to shift R20k from print to LinkedIn ads.
- Johan to draft new landing page copy, needs it before launch on 25 Nov
- website analytics still broken?? Mike will check with IT this week
- Lerato said customer webinar should move to 3 Dec instead of 28 Nov, everyone ok with that
- need someone to update the brand deck... no owner yet
- Aisha will send the final campaign brief to the agency by Friday`;

const SECTIONS = [
  { icon: CheckCircle2, label: "Decisions" },
  { icon: ListTodo, label: "Action Items" },
  { icon: CalendarCheck, label: "Deadlines" },
];

function MeetingSummarizer() {
  const [notes, setNotes] = useState("");
  const task = useAiTask(useServerFn(summarizeMeeting));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = meetingInputSchema.safeParse({ notes });
    if (!parsed.success) {
      task.setError(parsed.error.issues[0]?.message ?? "Please check your notes.");
      return;
    }
    void task.generate(parsed.data);
  }

  return (
    <div>
      <ToolPageHeader
        icon={NotebookPen}
        title="Meeting Notes Summarizer"
        description="Paste your raw notes — however messy — and get a structured summary your team can act on."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="surface-card flex flex-col gap-5 rounded-2xl p-5">
          <Field id="notes" label="Raw meeting notes" hint={`${notes.length.toLocaleString()} / 20,000 characters`}>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste your meeting notes, transcript snippets or bullet points here…"
              rows={16}
              maxLength={20000}
              className="min-h-[320px]"
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/40 px-3 py-1 text-xs text-muted-foreground"
              >
                <s.icon className="size-3.5 text-primary" />
                {s.label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" variant="hero" size="lg" disabled={task.loading}>
              <Wand2 /> {task.loading ? "Summarizing…" : "Summarize notes"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setNotes(EXAMPLE)} disabled={task.loading}>
              Try an example
            </Button>
          </div>
        </form>
        <AiOutput
          label="Structured summary"
          value={task.output}
          onChange={task.setOutput}
          loading={task.loading}
          error={task.error}
          emptyHint={"DECISIONS\n- …\n\nACTION ITEMS\n- …\n\nDEADLINES\n- …"}
        />
      </div>
    </div>
  );
}
