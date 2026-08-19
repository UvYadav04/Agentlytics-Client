import type { MetadataRoute } from "next";

// Falls back to the production domain so `next build` still produces a valid sitemap even if
// NEXT_PUBLIC_SITE_URL isn't set (e.g. a local build) - see .env.example for how to override it.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://agentlytics.duckdns.org").replace(/\/$/, "");

// Only public, content-bearing marketing/auth-entry pages belong here. Anything that renders a
// specific user's data (chat, profile, dashboard/[id], chart/[id], report/[id]) is excluded - it
// isn't indexable content and is already blocked in robots.ts.
const routes: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/architecture", changeFrequency: "monthly", priority: 0.6 },
  { path: "/get-started", changeFrequency: "monthly", priority: 0.9 },
  { path: "/login", changeFrequency: "yearly", priority: 0.3 },
  { path: "/signup", changeFrequency: "yearly", priority: 0.5 },
  { path: "/feedback", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
