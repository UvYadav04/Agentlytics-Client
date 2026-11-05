export const runtime = "edge";

import { SOLUTIONS, getSolution } from "@/content/solutions";
import { renderOgImage } from "@/lib/ogImage";

export const alt = "Quarry AI data analyzer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return SOLUTIONS.map((solution) => ({ slug: solution.slug }));
}

export default function Image({ params }: { params: { slug: string } }) {
  const solution = getSolution(params.slug);
  return renderOgImage({
    title: solution ? solution.label : "AI Data Analyzer",
    subtitle: solution ? `${solution.heading} ${solution.headingAccent}` : "Talk to your data.",
  });
}
