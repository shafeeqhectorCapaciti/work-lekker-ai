import { useState } from "react";

type AiResult = { ok: true; text: string } | { ok: false; error: string };

/** Runs an AI server function and keeps the editable output + error state. */
export function useAiTask<TInput>(run: (args: { data: TInput }) => Promise<AiResult>) {
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate(input: TInput) {
    setLoading(true);
    setError(null);
    try {
      const result = await run({ data: input });
      if (result.ok) setOutput(result.text);
      else setError(result.error);
    } catch {
      setError("We couldn't reach the AI service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return { output, setOutput, error, setError, loading, generate };
}
