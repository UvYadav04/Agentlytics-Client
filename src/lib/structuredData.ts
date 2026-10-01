import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL, absoluteUrl } from "@/lib/site";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type Schema = Record<string, Json>;

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const APPLICATION_ID = `${SITE_URL}/#application`;

export function organizationSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icon.svg"),
    description: SITE_DESCRIPTION,
  };
}

export function websiteSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    alternateName: `${SITE_NAME} AI Data Analyzer`,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function softwareApplicationSchema({
  name = `${SITE_NAME} - ${SITE_TAGLINE}`,
  description = SITE_DESCRIPTION,
  url = SITE_URL,
  featureList,
}: {
  name?: string;
  description?: string;
  url?: string;
  featureList: string[];
}): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": url === SITE_URL ? APPLICATION_ID : `${url}#application`,
    name,
    description,
    url,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Data analysis",
    operatingSystem: "Web browser",
    browserRequirements: "Requires a modern web browser with JavaScript enabled",
    featureList,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free to start",
    },
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
