import { renderOgImage } from "@/lib/ogImage";

export const alt = "Agentlytics - AI data analyzer for CSV, Excel, PDF, text files and databases";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    title: "Talk to your data. Get answers with evidence.",
    subtitle: "AI data analyzer for spreadsheets, documents and live databases - charts, reports and dashboards from plain-English questions.",
  });
}
