import type { Metadata, Viewport } from "next";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import Navbar from "@/components/Navbar";
import CanvasCursor from "@/components/cursor/CanvasCursor";
import JsonLd from "@/components/marketing/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/structuredData";
import {
  BACKGROUND_COLOR,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  THEME_COLOR,
} from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "Xgxg9B9QJwE4dxfDf9xFqf6ie7tQetaLg0M2robno4k",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BACKGROUND_COLOR },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-bg text-text font-sans antialiased">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <ReduxProvider>
          <CanvasCursor />
          <Navbar />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
