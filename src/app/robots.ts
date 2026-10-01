import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/chat",
        "/profile",
        "/dashboard/",
        "/dashboards/",
        "/chart/",
        "/report/",
        "/verify-email",
        "/forgot-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
