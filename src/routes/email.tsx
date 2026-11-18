import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Wand2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AiOutput } from "@/components/ai-output";
import { Field } from "@/components/field";
import { ToolPageHeader } from "@/components/tool-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAiTask } from "@/hooks/use-ai-task";
import { generateEmail } from "@/lib/ai-tools.functions";
import { TONES, emailInputSchema, type Tone } from "@/lib/tool-rules";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — WorkLekker AI" },
      {
        name: "description",
        content: "Write polished workplace emails in a formal, friendly or persuasive tone with AI.",
      },
      { property: "og:title", content: "Smart Email Generator — WorkLekker AI" },
      {
        property: "og:description",
        content: "Turn key points into a ready-to-send email in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailGenerator,
});

const TONE_HINTS: Record<Tone, string> = {
  Formal: "Polished & professional",
  Friendly: "Warm & approachable",
  Persuasive: "Confident & convincing",
};

function EmailGenerator() {
  const [recipient, setRecipient] = useState("");
  const [context, setContext] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState<Tone>("Formal");
  const task = useAiTask(useServerFn(generateEmail));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = emailInputSchema.safeParse({ recipient, context, keyPoints, tone });
    if (!parsed.success) {
      task.setError(parsed.error.issues[0]?.message ?? "Please check your inputs.");
      return;
    }
    void task.generate(parsed.data);
  }

  function loadExample() {
    setRecipient("Thandi Mokoena, Head of Operations");
    setContext("Request to move the Q3 project review to next week");
    setKeyPoints(
      "- Vendor data arrives Thursday, not Monday\n- Need two extra days to validate numbers\n- Suggest Tuesday 10:00 instead\n- Will share draft slides by Friday",
    );
    setTone("Friendly");
  }

  return (
    <div>
      <ToolPageHeader
        icon={Mail}
        title="Smart Email Generator"
        description="Tell us who it's for and what to say — Lovable AI writes the email in the tone you choose."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="surface-card space-y-5 rounded-2xl p-5">
          <Field id="recipient" label="Recipient">
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. Sam Patel, Client Success Manager"
              maxLength={200}
            />
          </Field>
          <Field id="context" label="Subject / Context">
            <Input
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. Follow-up after yesterday's product demo"
              maxLength={2000}
            />
          </Field>
          <Field id="keypoints" label="Key points" hint="One point per line works best.">
            <Textarea
              id="keypoints"
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder={"- Thank them for their time\n- Share pricing options\n- Propose a call next week"}
              rows={6}
              maxLength={4000}
            />
          </Field>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">Tone</legend>
            <div role="radiogroup" aria-label="Tone" className="grid grid-cols-3 gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={tone === t}
                  onClick={() => setTone(t)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    tone === t
                      ? "border-primary bg-primary/15 shadow-glow"
                      : "border-border bg-background/40 hover:border-primary/40",
                  )}
                >
                  <span className="block text-sm font-semibold text-foreground">{t}</span>
                  <span className="block text-xs text-muted-foreground">{TONE_HINTS[t]}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button type="submit" variant="hero" size="lg" disabled={task.loading}>
              <Wand2 /> {task.loading ? "Writing…" : "Generate email"}
            </Button>
            <Button type="button" variant="ghost" onClick={loadExample} disabled={task.loading}>
              Try an example
            </Button>
          </div>
        </form>
        <AiOutput
          label="Your email"
          value={task.output}
          onChange={task.setOutput}
          loading={task.loading}
          error={task.error}
          emptyHint="Your generated email will appear here. You can edit it before copying."
        />
      </div>
    </div>
  );
}
