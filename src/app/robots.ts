import type { MetadataRoute } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://agentlytics.duckdns.org").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Everything under these renders a specific signed-in user's own data (chat threads,
      // uploaded files, generated charts/dashboards/reports, account settings) - no SEO value,
      // and there's nothing generic there for a crawler to usefully index.
      disallow: ["/chat", "/profile", "/dashboard/", "/chart/", "/report/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
