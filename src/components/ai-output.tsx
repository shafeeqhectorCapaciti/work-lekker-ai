import { Check, Copy, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: string;
  onChange: (value: string) => void;
  loading: boolean;
  error: string | null;
  emptyHint: string;
  label?: string;
};

export function AiOutput({ value, onChange, loading, error, emptyHint, label = "AI output" }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy — select the text and copy it manually.");
    }
  }

  return (
    <section className="surface-card flex h-full flex-col rounded-2xl p-5" aria-live="polite">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="size-4 text-primary" />
          {label}
        </h2>
        <Button variant="outline" size="sm" onClick={copy} disabled={!value || loading}>
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      {error && (
        <p role="alert" className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="relative flex-1">
        <Textarea
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={loading ? "" : emptyHint}
          className="h-full min-h-[420px] resize-y rounded-xl border-border bg-background/60 p-4 font-sans text-sm leading-relaxed"
          disabled={loading}
        />
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/70 text-sm text-muted-foreground backdrop-blur-sm">
            <Loader2 className="size-6 animate-spin text-primary" />
            Lovable AI is working on it…
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        You can edit the result above before copying it.
      </p>
    </section>
  );
}
