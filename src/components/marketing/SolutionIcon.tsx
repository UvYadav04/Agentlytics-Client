import { BarChart3, Database, FileSpreadsheet, FileText, FileType2, Leaf, Table2, type LucideIcon } from "lucide-react";
import type { SolutionIcon as SolutionIconName, SolutionTone } from "@/content/solutions";

export const SOLUTION_ICONS: Record<SolutionIconName, LucideIcon> = {
  csv: Table2,
  excel: FileSpreadsheet,
  pdf: FileText,
  text: FileType2,
  postgresql: Database,
  mongodb: Leaf,
  dashboard: BarChart3,
};

export const TONE_CLASSES: Record<SolutionTone, { bg: string; text: string; soft: string; border: string }> = {
  teal: { bg: "bg-teal", text: "text-teal", soft: "bg-teal/10", border: "border-teal/30" },
  accent: { bg: "bg-accent", text: "text-accent-dark", soft: "bg-accent-soft", border: "border-accent/30" },
  plum: { bg: "bg-plum", text: "text-plum", soft: "bg-plum/10", border: "border-plum/30" },
  gold: { bg: "bg-gold", text: "text-clay", soft: "bg-gold/15", border: "border-gold/40" },
  clay: { bg: "bg-clay", text: "text-clay", soft: "bg-clay/10", border: "border-clay/30" },
  rust: { bg: "bg-rust", text: "text-rust", soft: "bg-rust/10", border: "border-rust/30" },
};

export default function SolutionIcon({
  name,
  className = "h-4 w-4",
}: {
  name: SolutionIconName;
  className?: string;
}) {
  const Icon = SOLUTION_ICONS[name];
  return <Icon className={className} aria-hidden="true" />;
}
