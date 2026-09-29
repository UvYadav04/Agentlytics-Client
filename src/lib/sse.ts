import { API_BASE_URL } from "@/lib/config";

export function investigationStreamUrl(investigationId: string) {
  return `${API_BASE_URL}/investigations/${investigationId}/stream`;
}
