import type { MetadataRoute } from "next";
import { SOLUTIONS, SOLUTIONS_UPDATED_AT } from "@/content/solutions";
import { absoluteUrl } from "@/lib/site";

type Entry = MetadataRoute.Sitemap[number];

const PAGES_UPDATED_AT = "2026-10-01";

const STATIC_PAGES: { path: string; changeFrequency: Entry["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/get-started", changeFrequency: "monthly", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/signup", changeFrequency: "yearly", priority: 0.4 },
  { path: "/feedback", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = STATIC_PAGES.map(({ path, changeFrequency, priority }) => ({
    url: absoluteUrl(path),
    lastModified: new Date(PAGES_UPDATED_AT),
    changeFrequency,
    priority,
  }));
  const solutions: MetadataRoute.Sitemap = SOLUTIONS.map((solution) => ({
    url: absoluteUrl(`/${solution.slug}`),
    lastModified: new Date(SOLUTIONS_UPDATED_AT),
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  return [...pages, ...solutions];
}
