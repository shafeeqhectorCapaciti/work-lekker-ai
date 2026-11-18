import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

import { createLovableAiGatewayRunIdFetch } from "./run-id.server";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

export type AiResult = { ok: true; text: string } | { ok: false; error: string };

function findStatus(error: unknown): number | undefined {
  let current: unknown = error;
  for (let i = 0; i < 5 && current && typeof current === "object"; i++) {
    const obj = current as { statusCode?: unknown; cause?: unknown; lastError?: unknown };
    if (typeof obj.statusCode === "number") return obj.statusCode;
    current = obj.lastError ?? obj.cause;
  }
  return undefined;
}

function friendlyError(error: unknown): string {
  const status = findStatus(error);
  if (status === 402) {
    return "Your workspace has run out of AI credits. Add credits in Lovable to keep generating.";
  }
  if (status === 403) {
    return "AI access is currently blocked for this workspace. A workspace admin needs to check the AI settings.";
  }
  if (status === 429) {
    return "Lots of requests right now — please wait a few seconds and try again.";
  }
  if (status === 401) {
    return "AI isn't configured correctly for this app yet.";
  }
  return "Something went wrong while generating. Please try again in a moment.";
}

/** Runs one AI task server-side and returns the final text. */
export async function runAiTask(instructions: string, prompt: string): Promise<AiResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false, error: "AI isn't configured for this app yet." };

  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  let streamError: unknown;
  try {
    const result = streamText({
      model: provider.responses(MODEL),
      instructions,
      messages: [{ role: "user", content: prompt }],
      maxRetries: 1,
      onError: ({ error }) => {
        streamError = error;
      },
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const text = (await result.text).trim();
    if (streamError) throw streamError;
    if (!text) {
      return { ok: false, error: "The AI couldn't produce a result for this request." };
    }
    return { ok: true, text };
  } catch (error) {
    const cause = streamError ?? error;
    console.error("AI task failed", findStatus(cause), cause);
    return { ok: false, error: friendlyError(cause) };
  }
}
