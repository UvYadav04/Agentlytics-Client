import type { InvestigationEvent, PendingQuestion } from "./types";

const RESOLVED_TYPES = new Set(["question_answered", "question_expired"]);
const TERMINAL_TYPES = new Set(["completed", "cancelled", "error"]);

function questionIdOf(event: InvestigationEvent): string | null {
  const id = event.data?.question_id;
  return typeof id === "string" ? id : null;
}

export function toPendingQuestion(event: InvestigationEvent): PendingQuestion | null {
  const questionId = questionIdOf(event);
  if (!questionId) return null;
  const rawOptions = event.data?.options;
  const options = Array.isArray(rawOptions)
    ? rawOptions.filter((o): o is string => typeof o === "string" && o.trim().length > 0)
    : [];
  const askedBy = event.data?.asked_by;
  return {
    question_id: questionId,
    question: event.message,
    options,
    asked_by: typeof askedBy === "string" ? askedBy : "agent",
  };
}

export function findPendingQuestion(events: InvestigationEvent[]): PendingQuestion | null {
  const resolved = new Set<string>();
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (TERMINAL_TYPES.has(event.type)) return null;
    const questionId = questionIdOf(event);
    if (RESOLVED_TYPES.has(event.type) && questionId) {
      resolved.add(questionId);
      continue;
    }
    if (event.type === "question" && questionId && !resolved.has(questionId)) {
      return toPendingQuestion(event);
    }
  }
  return null;
}
