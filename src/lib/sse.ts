import { API_BASE_URL } from "@/lib/config";

// SSE is a push channel, not request/response - it isn't modeled as an RTK
// Query endpoint. See useInvestigationStream.ts for the consumer side.
export function investigationStreamUrl(investigationId: string) {
  return `${API_BASE_URL}/investigations/${investigationId}/stream`;
}
