import Link from "next/link";
import { SOLUTIONS } from "@/content/solutions";
import BrandMark from "./BrandMark";

const FILE_TOOLS = ["ai-csv-analyzer", "ai-excel-analyzer", "ai-pdf-analyzer", "ai-text-file-analyzer"];
const DATABASE_TOOLS = ["postgresql-ai-analyzer", "mongodb-ai-analyzer", "ai-dashboard-generator"];

function toolLinks(slugs: string[]) {
  return SOLUTIONS.filter((solution) => slugs.includes(solution.slug)).map((solution) => (
    <li key={solution.slug}>
      <Link href={`/${solution.slug}`} className="transition-colors hover:text-text">
        {solution.label}
      </Link>
    </li>
  ));
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <BrandMark />
              <span className="font-semibold tracking-tight">Agentlytics</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              AI data analyzer for CSV, Excel, PDF and text files and PostgreSQL and MongoDB databases - with
              answers traced back to the source.
            </p>
          </div>

          <nav aria-label="File analysis tools">
            <h2 className="text-sm font-semibold">Analyze files</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">{toolLinks(FILE_TOOLS)}</ul>
          </nav>

          <nav aria-label="Database and dashboard tools">
            <h2 className="text-sm font-semibold">Databases &amp; dashboards</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">{toolLinks(DATABASE_TOOLS)}</ul>
          </nav>

          <nav aria-label="Company">
            <h2 className="text-sm font-semibold">Product</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <Link href="/get-started" className="transition-colors hover:text-text">
                  Get started
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-text">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/chat" className="transition-colors hover:text-text">
                  Workspace
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="transition-colors hover:text-text">
                  Feedback
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row">
          <span>&copy; {new Date().getFullYear()} Agentlytics</span>
          <span>No answer without evidence traced to a real file.</span>
        </div>
      </div>
    </footer>
  );
}
