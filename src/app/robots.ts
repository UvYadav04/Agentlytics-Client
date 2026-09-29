import type { MetadataRoute } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://agentlytics.duckdns.org").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/chat", "/profile", "/dashboard/", "/chart/", "/report/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
