import { describe, expect, it } from "vitest";

import { emailInputSchema, quadrantFor, sortByPriority } from "@/lib/tool-rules";

describe("Task planner priority", () => {
  it("puts urgent + important tasks in Do first", () => {
    expect(quadrantFor({ urgent: true, important: true })).toBe("Do first");
  });
  it("puts important but not urgent tasks in Schedule", () => {
    expect(quadrantFor({ urgent: false, important: true })).toBe("Schedule");
  });
  it("puts urgent but not important tasks in Delegate", () => {
    expect(quadrantFor({ urgent: true, important: false })).toBe("Delegate");
  });
  it("orders tasks Do first → Schedule → Delegate → Later", () => {
    const sorted = sortByPriority([
      { id: "later", urgent: false, important: false },
      { id: "delegate", urgent: true, important: false },
      { id: "schedule", urgent: false, important: true },
      { id: "do", urgent: true, important: true },
    ]);
    expect(sorted.map((t) => t.id)).toEqual(["do", "schedule", "delegate", "later"]);
  });
});

describe("Email tone", () => {
  it("accepts only Formal, Friendly or Persuasive", () => {
    const base = { recipient: "Sam", context: "Project update", keyPoints: "" };
    expect(emailInputSchema.safeParse({ ...base, tone: "Persuasive" }).success).toBe(true);
    expect(emailInputSchema.safeParse({ ...base, tone: "Casual" }).success).toBe(false);
  });
});
