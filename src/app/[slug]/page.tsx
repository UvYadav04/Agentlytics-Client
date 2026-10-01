import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SolutionPage from "@/components/marketing/SolutionPage";
import { SOLUTIONS, getSolution } from "@/content/solutions";
import { pageMetadata } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return SOLUTIONS.map((solution) => ({ slug: solution.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const solution = getSolution(params.slug);
  if (!solution) return {};
  return pageMetadata({
    title: solution.metaTitle,
    description: solution.metaDescription,
    path: `/${solution.slug}`,
    keywords: solution.keywords,
    absoluteTitle: true,
  });
}

export default function SolutionRoute({ params }: { params: { slug: string } }) {
  const solution = getSolution(params.slug);
  if (!solution) notFound();
  return <SolutionPage solution={solution} />;
}
