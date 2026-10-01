import Link from "next/link";
import { CheckCircle2, ChevronRight, MessageSquare, Sparkles } from "lucide-react";
import { SOLUTIONS, type Solution } from "@/content/solutions";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbSchema, faqSchema, softwareApplicationSchema } from "@/lib/structuredData";
import FaqList from "./FaqList";
import JsonLd from "./JsonLd";
import PrimaryCTA from "./PrimaryCTA";
import SiteFooter from "./SiteFooter";
import SolutionIcon, { TONE_CLASSES } from "./SolutionIcon";
import SolutionsGrid from "./SolutionsGrid";

export default function SolutionPage({ solution }: { solution: Solution }) {
  const tone = TONE_CLASSES[solution.tone];
  const path = `/${solution.slug}`;
  const related = solution.related
    .map((slug) => SOLUTIONS.find((item) => item.slug === slug))
    .filter((item): item is Solution => Boolean(item));

  return (
    <>
      <JsonLd
        data={[
          softwareApplicationSchema({
            name: `${solution.label} - Agentlytics`,
            description: solution.metaDescription,
            url: absoluteUrl(path),
            featureList: solution.highlights.map((item) => item.title),
          }),
          faqSchema(solution.faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: solution.label, path },
          ]),
        ]}
      />
      <main>
        <section className="relative overflow-hidden px-6 pb-16 pt-10 sm:pt-14">
          <div className="glow-blob animate-float-a -left-24 -top-24 h-80 w-80 bg-accent opacity-25" />
          <div className="glow-blob animate-float-b -right-16 top-24 h-72 w-72 bg-gold opacity-20" />

          <div className="relative mx-auto max-w-6xl">
            <nav aria-label="Breadcrumb" className="mb-8 text-xs text-muted">
              <ol className="flex items-center gap-1.5">
                <li>
                  <Link href="/" className="transition-colors hover:text-text">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-3 w-3" />
                </li>
                <li aria-current="page" className="text-text">
                  {solution.label}
                </li>
              </ol>
            </nav>

            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white ${tone.bg}`}
                >
                  <SolutionIcon name={solution.icon} className="h-3.5 w-3.5" />
                  {solution.eyebrow}
                </span>
                <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl xl:text-5xl">
                  {solution.heading}{" "}
                  <span className="bg-gradient-to-r from-accent to-rust bg-clip-text text-transparent">
                    {solution.headingAccent}
                  </span>
                </h1>
                <p className="mt-5 max-w-xl leading-relaxed text-muted">{solution.intro}</p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <PrimaryCTA />
                  <Link
                    href="/about"
                    className="inline-flex items-center rounded-full border border-border bg-card px-6 py-3 font-medium text-text shadow-card transition-all hover:border-accent hover:text-accent-dark"
                  >
                    See how it works
                  </Link>
                </div>
              </div>

              <figure className="overflow-hidden rounded-card border border-accent/15 bg-card shadow-[0_20px_60px_-20px_rgba(204,120,92,0.35)]">
                <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                  <SolutionIcon name={solution.icon} className={`h-4 w-4 ${tone.text}`} />
                  <span className="text-xs font-medium text-muted">{solution.sampleFile}</span>
                  <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                    Example
                  </span>
                </div>
                <div className="space-y-4 p-6">
                  <p className="ml-auto max-w-sm rounded-2xl rounded-tr-sm bg-accent px-4 py-2.5 text-sm text-white">
                    {solution.sampleQuestion}
                  </p>
                  <div className="max-w-md rounded-2xl rounded-tl-sm border border-border bg-bg px-4 py-3 text-sm leading-relaxed">
                    {solution.sampleAnswer}
                    <div className="mt-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tone.soft} ${tone.text}`}>
                        {solution.sampleSource}
                      </span>
                    </div>
                  </div>
                </div>
                <figcaption className="sr-only">
                  Example question and answer for the {solution.label}
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-card/60" aria-labelledby="features-heading">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="features-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
                What the {solution.label} does
              </h2>
              <p className="mt-3 text-muted">
                Purpose-built AI agents and deterministic tools, so answers about your data are computed and
                cited - not guessed.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {solution.highlights.map((item) => (
                <div key={item.title} className="relative h-full overflow-hidden rounded-card border border-border bg-card p-6 shadow-card">
                  <span className={`absolute inset-x-0 top-0 h-1 ${tone.bg}`} />
                  <CheckCircle2 className={`h-5 w-5 ${tone.text}`} aria-hidden="true" />
                  <h3 className="mt-3 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border" aria-labelledby="steps-heading">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 id="steps-heading" className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              How it works
            </h2>
            <ol className="mt-12 grid gap-5 md:grid-cols-3">
              {solution.steps.map((step, index) => (
                <li key={step.title} className="h-full rounded-card border border-border bg-card p-6 shadow-card">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-card ${tone.bg}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-border bg-card/60" aria-labelledby="questions-heading">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2">
            <div>
              <h2 id="questions-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
                Questions you can ask
              </h2>
              <p className="mt-3 text-muted">Type them exactly like this - no formulas, SQL or setup.</p>
              <ul className="mt-6 space-y-3">
                {solution.questions.map((question) => (
                  <li
                    key={question}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-card"
                  >
                    <MessageSquare className={`mt-0.5 h-4 w-4 shrink-0 ${tone.text}`} aria-hidden="true" />
                    {question}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Popular use cases</h2>
              <p className="mt-3 text-muted">Teams use the {solution.label} for work like this.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {solution.useCases.map((useCase) => (
                  <div key={useCase.title} className="rounded-card border border-border bg-card p-5 shadow-card">
                    <Sparkles className={`h-4 w-4 ${tone.text}`} aria-hidden="true" />
                    <h3 className="mt-2 font-semibold">{useCase.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{useCase.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border" aria-labelledby="faq-heading">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <h2 id="faq-heading" className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              {solution.label} FAQ
            </h2>
            <div className="mt-10">
              <FaqList faqs={solution.faqs} />
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="border-t border-border bg-card/60" aria-labelledby="related-heading">
            <div className="mx-auto max-w-6xl px-6 py-20">
              <h2 id="related-heading" className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
                Related tools
              </h2>
              <div className="mt-10">
                <SolutionsGrid solutions={related} />
              </div>
            </div>
          </section>
        )}

        <section className="relative overflow-hidden border-t border-border">
          <div className="glow-blob animate-float-b right-1/4 top-0 h-80 w-80 bg-accent opacity-30" />
          <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Try the {solution.label} free
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Create a workspace, add your data and ask your first question in under a minute.
            </p>
            <div className="mt-8 flex justify-center">
              <PrimaryCTA />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
