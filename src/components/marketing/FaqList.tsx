import { ChevronDown } from "lucide-react";

export default function FaqList({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-card shadow-card">
      {faqs.map((faq) => (
        <details key={faq.question} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left">
            <h3 className="font-semibold leading-snug">{faq.question}</h3>
            <ChevronDown
              className="mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
