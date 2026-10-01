import type { Metadata } from "next";
import HomeView from "@/components/home/HomeView";
import JsonLd from "@/components/marketing/JsonLd";
import { HOME_FAQS } from "@/content/homeFaqs";
import { SITE_DESCRIPTION, SITE_TITLE, pageMetadata } from "@/lib/site";
import { faqSchema, softwareApplicationSchema } from "@/lib/structuredData";

export const metadata: Metadata = pageMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

const FEATURES = [
  "Chat with CSV files",
  "Analyze multi-sheet Excel workbooks",
  "Chat with PDFs with page citations",
  "Summarize and search text files",
  "Query PostgreSQL in plain English",
  "Query MongoDB in plain English",
  "AI-generated charts and live dashboards",
  "Downloadable reports and CSV exports",
  "Answers traced to the source row or page",
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={[softwareApplicationSchema({ featureList: FEATURES }), faqSchema(HOME_FAQS)]} />
      <HomeView />
    </>
  );
}
