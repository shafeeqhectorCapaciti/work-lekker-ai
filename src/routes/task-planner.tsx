import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, Plus, Trash2, Wand2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AiOutput } from "@/components/ai-output";
import { Field } from "@/components/field";
import { ToolPageHeader } from "@/components/tool-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAiTask } from "@/hooks/use-ai-task";
import { planDay } from "@/lib/ai-tools.functions";
import { plannerInputSchema, quadrantFor, type Quadrant } from "@/lib/tool-rules";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/task-planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — WorkLekker AI" },
      {
        name: "description",
        content: "Tag tasks by urgency and importance and get an AI-prioritized daily schedule.",
      },
      { property: "og:title", content: "AI Task Planner — WorkLekker AI" },
      {
        property: "og:description",
        content: "Get a prioritized daily schedule from your task list.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TaskPlanner,
});

type Row = { id: number; title: string; urgent: boolean; important: boolean; minutes: number };

const DURATIONS = [15, 30, 45, 60, 90, 120, 180];

const QUADRANT_STYLE: Record<Quadrant, string> = {
  "Do first": "border-destructive/40 bg-destructive/10 text-destructive",
  Schedule: "border-primary/40 bg-primary/10 text-primary",
  Delegate: "border-warning/40 bg-warning/10 text-warning",
  Later: "border-border bg-muted text-muted-foreground",
};

let nextId = 1;
const newRow = (partial: Partial<Row> = {}): Row => ({
  id: nextId++,
  title: "",
  urgent: false,
  important: false,
  minutes: 30,
  ...partial,
});

function TagToggle({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        pressed
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background/40 text-muted-foreground hover:border-primary/50 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function TaskPlanner() {
  const [rows, setRows] = useState<Row[]>(() => [newRow()]);
  const [dayStart, setDayStart] = useState("08:00");
  const [dayEnd, setDayEnd] = useState("17:00");
  const task = useAiTask(useServerFn(planDay));

  const update = (id: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const tasks = rows
      .filter((r) => r.title.trim())
      .map(({ title, urgent, important, minutes }) => ({ title, urgent, important, minutes }));
    const parsed = plannerInputSchema.safeParse({ tasks, dayStart, dayEnd });
    if (!parsed.success) {
      task.setError(parsed.error.issues[0]?.message ?? "Please check your tasks.");
      return;
    }
    if (dayEnd <= dayStart) {
      task.setError("Your end time needs to be after your start time.");
      return;
    }
    void task.generate(parsed.data);
  }

  function loadExample() {
    setRows([
      newRow({ title: "Finish client proposal for Acme", urgent: true, important: true, minutes: 120 }),
      newRow({ title: "Prepare slides for Friday's strategy session", important: true, minutes: 90 }),
      newRow({ title: "Reply to supplier invoice queries", urgent: true, minutes: 30 }),
      newRow({ title: "1:1 with new team member", important: true, minutes: 30 }),
      newRow({ title: "Clean up shared drive folders", minutes: 45 }),
    ]);
  }

  return (
    <div>
      <ToolPageHeader
        icon={CalendarClock}
        title="AI Task Planner"
        description="List your tasks, tag what's urgent and important, and get a prioritized plan for your day."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="surface-card space-y-5 rounded-2xl p-5">
          <div className="grid grid-cols-2 gap-4">
            <Field id="start" label="Day starts">
              <Input id="start" type="time" value={dayStart} onChange={(e) => setDayStart(e.target.value)} />
            </Field>
            <Field id="end" label="Day ends">
              <Input id="end" type="time" value={dayEnd} onChange={(e) => setDayEnd(e.target.value)} />
            </Field>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Tasks</p>
            <ul className="space-y-3">
              {rows.map((row, index) => {
                const quadrant = quadrantFor(row);
                return (
                  <li key={row.id} className="rounded-xl border border-border bg-background/40 p-3">
                    <div className="flex items-center gap-2">
                      <Input
                        aria-label={`Task ${index + 1}`}
                        value={row.title}
                        onChange={(e) => update(row.id, { title: e.target.value })}
                        placeholder="What needs doing?"
                        maxLength={200}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove task ${index + 1}`}
                        onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== row.id) : [newRow()]))}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <TagToggle pressed={row.urgent} onClick={() => update(row.id, { urgent: !row.urgent })}>
                        Urgent
                      </TagToggle>
                      <TagToggle pressed={row.important} onClick={() => update(row.id, { important: !row.important })}>
                        Important
                      </TagToggle>
                      <select
                        aria-label={`Duration for task ${index + 1}`}
                        value={row.minutes}
                        onChange={(e) => update(row.id, { minutes: Number(e.target.value) })}
                        className="h-7 rounded-full border border-border bg-background px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {DURATIONS.map((d) => (
                          <option key={d} value={d}>
                            {d < 60 ? `${d} min` : `${d / 60} h`}
                          </option>
                        ))}
                      </select>
                      <span className={cn("ml-auto rounded-full border px-2.5 py-0.5 text-xs font-medium", QUADRANT_STYLE[quadrant])}>
                        {quadrant}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRows((rs) => [...rs, newRow()])}
              disabled={rows.length >= 30}
            >
              <Plus /> Add task
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button type="submit" variant="hero" size="lg" disabled={task.loading}>
              <Wand2 /> {task.loading ? "Planning…" : "Generate schedule"}
            </Button>
            <Button type="button" variant="ghost" onClick={loadExample} disabled={task.loading}>
              Try an example
            </Button>
          </div>
        </form>
        <AiOutput
          label="Your daily schedule"
          value={task.output}
          onChange={task.setOutput}
          loading={task.loading}
          error={task.error}
          emptyHint="Your prioritized schedule will appear here. You can edit it before copying."
        />
      </div>
    </div>
  );
}
