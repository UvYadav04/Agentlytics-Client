import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

export function renderOgImage({
  title,
  subtitle,
  chips = ["CSV", "Excel", "PDF", "TXT", "PostgreSQL", "MongoDB"],
}: {
  title: string;
  subtitle: string;
  chips?: string[];
}) {
  const bars = [38, 62, 48, 86, 70, 96];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F5F4EE",
          padding: "64px 72px",
          fontFamily: "sans-serif",
          color: "#262624",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #CC785C 0%, #B0562B 100%)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 4,
              padding: "0 0 12px",
            }}
          >
            <div style={{ width: 7, height: 14, borderRadius: 2, background: "#F5F4EE" }} />
            <div style={{ width: 7, height: 23, borderRadius: 2, background: "#F5F4EE" }} />
            <div style={{ width: 7, height: 31, borderRadius: 2, background: "rgba(245,244,238,0.92)" }} />
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>{SITE_NAME}</div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
            <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }}>{title}</div>
            <div style={{ marginTop: 22, fontSize: 28, lineHeight: 1.35, color: "#83807A" }}>{subtitle}</div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 12,
              height: 220,
              padding: 24,
              borderRadius: 24,
              background: "#FFFFFF",
              border: "2px solid #E8E4D9",
            }}
          >
            {bars.map((value, index) => (
              <div
                key={index}
                style={{
                  width: 26,
                  height: `${value * 1.7}px`,
                  borderRadius: 6,
                  background: index === bars.length - 1 ? "#B35F45" : index % 2 ? "#D9A566" : "#CC785C",
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {chips.map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 600,
                padding: "10px 22px",
                borderRadius: 999,
                background: "#FFFFFF",
                border: "2px solid #E8E4D9",
                color: "#262624",
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
