import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SOLUTIONS, type Solution } from "@/content/solutions";
import SolutionIcon, { TONE_CLASSES } from "./SolutionIcon";

export default function SolutionsGrid({
  solutions = SOLUTIONS,
  wide = false,
}: {
  solutions?: Solution[];
  wide?: boolean;
}) {
  return (
    <div className={`grid gap-5 sm:grid-cols-2 ${wide ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
      {solutions.map((solution) => {
        const tone = TONE_CLASSES[solution.tone];
        return (
          <Link
            key={solution.slug}
            href={`/${solution.slug}`}
            className="group flex h-full flex-col rounded-card border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-accent/25 hover:shadow-[0_0_35px_-12px_rgba(204,120,92,0.4)]"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-card ${tone.bg}`}>
              <SolutionIcon name={solution.icon} className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-semibold">{solution.label}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{solution.shortDescription}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent-dark">
              Learn more
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
