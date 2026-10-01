import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://agentlytics.duckdns.org").replace(/\/$/, "");

export const SITE_NAME = "Agentlytics";

export const SITE_TAGLINE = "AI Data Analyzer for CSV, Excel, PDF, Text Files & Databases";

export const SITE_TITLE = `${SITE_NAME} - ${SITE_TAGLINE}`;

export const SITE_DESCRIPTION =
  "AI data analyzer for CSV, Excel, PDF and TXT files and PostgreSQL or MongoDB. Ask in plain English and get charts, reports and dashboards with cited answers.";

export const SITE_KEYWORDS = [
  "AI data analyzer",
  "AI data analysis tool",
  "AI data analyst",
  "analyze data with AI",
  "AI CSV analyzer",
  "chat with CSV",
  "AI Excel analyzer",
  "analyze Excel with AI",
  "chat with PDF",
  "AI PDF analyzer",
  "AI text file analyzer",
  "PostgreSQL AI analytics",
  "MongoDB AI analytics",
  "natural language database query",
  "AI dashboard generator",
  "AI chart generator",
  "AI report generator",
];

export const THEME_COLOR = "#CC785C";

export const BACKGROUND_COLOR = "#F5F4EE";

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: keywords ?? SITE_KEYWORDS,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

export function privatePageMetadata(title: string, { follow = false }: { follow?: boolean } = {}): Metadata {
  return {
    title,
    robots: { index: false, follow, nocache: true, googleBot: { index: false, follow } },
    alternates: { canonical: null },
  };
}
