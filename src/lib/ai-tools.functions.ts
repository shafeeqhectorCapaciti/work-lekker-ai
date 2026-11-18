import { createServerFn } from "@tanstack/react-start";

import { runAiTask } from "./ai/gateway.server";
import {
  EMAIL_INSTRUCTIONS,
  MEETING_INSTRUCTIONS,
  PLANNER_INSTRUCTIONS,
  buildEmailPrompt,
  buildMeetingPrompt,
  buildPlannerPrompt,
  emailInputSchema,
  meetingInputSchema,
  plannerInputSchema,
} from "./tool-rules";

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailInputSchema.parse(data))
  .handler(async ({ data }) => runAiTask(EMAIL_INSTRUCTIONS, buildEmailPrompt(data)));

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => meetingInputSchema.parse(data))
  .handler(async ({ data }) => runAiTask(MEETING_INSTRUCTIONS, buildMeetingPrompt(data)));

export const planDay = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => plannerInputSchema.parse(data))
  .handler(async ({ data }) => runAiTask(PLANNER_INSTRUCTIONS, buildPlannerPrompt(data)));
