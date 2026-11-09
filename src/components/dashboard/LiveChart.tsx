"use client";

import { useEffect, useId, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  AreaChart as AreaIcon,
  BarChart3,
  Download,
  Hash,
  LineChart as LineIcon,
  Maximize2,
  PieChart as PieIcon,
  Table2,
  X,
} from "lucide-react";
import type { DashboardTheme, LiveChartConfig, LiveChartData } from "@/lib/types";
import { CHART_TOKENS, type ChartTokens } from "./chartTheme";
import { formatValue, humanize, type ValueFormat } from "./format";
import { X_KEY, shapeChart, shapePie } from "./shapeData";

function downloadCsv(title: string, columns: string[], rows: Record<string, unknown>[]) {
  if (!columns.length || !rows.length) return;
  const header = columns.map((c) => `"${c.replace(/"/g, '""')}"`).join(",");
  const body = rows
    .map((r) =>
      columns
        .map((c) => {
          const v = r[c];
          if (v === null || v === undefined) return '""';
          return `"${String(v).replace(/"/g, '""')}"`;
        })
        .join(",")
    )
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${title.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "chart"}_data.csv`);
  link.click();
  URL.revokeObjectURL(url);
}

function getChartTypeMeta(type: string) {
  switch (type) {
    case "line":
      return { icon: LineIcon, label: "Line Chart" };
    case "area":
      return { icon: AreaIcon, label: "Area Chart" };
    case "pie":
      return { icon: PieIcon, label: "Donut Chart" };
    case "stacked_bar":
      return { icon: BarChart3, label: "Stacked Bar" };
    case "bar":
      return { icon: BarChart3, label: "Bar Chart" };
    case "table":
      return { icon: Table2, label: "Data Table" };
    case "metric":
      return { icon: Hash, label: "Metric" };
    default:
      return { icon: BarChart3, label: "Chart" };
  }
}

function TooltipBox({
  active,
  payload,
  label,
  tokens,
  format,
  total,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  tokens: ChartTokens;
  format: ValueFormat;
  total?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const showSum = payload.length > 1;
  const sum = payload.reduce((acc, curr) => acc + (typeof curr.value === "number" ? curr.value : 0), 0);

  return (
    <div
      className="min-w-[170px] rounded-xl px-3.5 py-2.5 text-xs shadow-xl backdrop-blur-md"
      style={{
        background: tokens.surface === "#ffffff" ? "rgba(255, 255, 255, 0.97)" : "rgba(26, 26, 25, 0.97)",
        border: `1px solid ${tokens.border}`,
        color: tokens.textPrimary,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
      }}
    >
      {label !== undefined && label !== "" && (
        <div
          className="mb-2 border-b pb-1.5 font-semibold tracking-tight"
          style={{ borderColor: tokens.grid, color: tokens.textPrimary }}
        >
          {label}
        </div>
      )}
      <ul className="space-y-1.5">
        {payload.map((item) => {
          const pct =
            total && total > 0 && typeof item.value === "number"
              ? ((item.value / total) * 100).toFixed(1)
              : null;
          return (
            <li key={item.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="size-2 shrink-0 rounded-full" style={{ background: item.color }} />
                <span className="truncate" style={{ color: tokens.textSecondary }}>
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 pl-2">
                <span className="font-semibold tabular-nums">{formatValue(item.value, format)}</span>
                {pct && (
                  <span className="text-[10px] font-normal" style={{ color: tokens.textSecondary }}>
                    ({pct}%)
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {showSum && (
        <div
          className="mt-2 flex items-center justify-between border-t pt-1.5 font-medium"
          style={{ borderColor: tokens.grid }}
        >
          <span style={{ color: tokens.textSecondary }}>Total</span>
          <span className="font-bold tabular-nums">{formatValue(sum, format)}</span>
        </div>
      )}
    </div>
  );
}

function DataTable({
  config,
  data,
  tokens,
  maxHeightClass = "max-h-[290px]",
}: {
  config: LiveChartConfig;
  data: LiveChartData;
  tokens: ChartTokens;
  maxHeightClass?: string;
}) {
  const format = (config.axis?.format ?? "number") as ValueFormat;
  const numeric = new Set(config.value_columns);
  return (
    <div className={`overflow-auto rounded-lg ${maxHeightClass}`} style={{ border: `1px solid ${tokens.border}` }}>
      <table className="w-full text-left text-xs" style={{ color: tokens.textPrimary }}>
        <thead className="sticky top-0 z-10" style={{ background: tokens.panel }}>
          <tr>
            {data.columns.map((column) => (
              <th key={column} className="whitespace-nowrap px-3.5 py-2.5 font-semibold" style={{ color: tokens.textSecondary }}>
                {humanize(column, config.labels)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.slice(0, 500).map((row, index) => (
            <tr
              key={index}
              className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ borderTop: `1px solid ${tokens.grid}` }}
            >
              {data.columns.map((column) => (
                <td
                  key={column}
                  className={`whitespace-nowrap px-3.5 py-2 ${numeric.has(column) ? "text-right tabular-nums font-medium" : ""}`}
                >
                  {numeric.has(column) ? formatValue(row[column], format) : formatValue(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Plot({
  config,
  data,
  theme,
  tokens,
  height,
  isSingle,
  uid,
}: {
  config: LiveChartConfig;
  data: LiveChartData;
  theme: DashboardTheme;
  tokens: ChartTokens;
  height: number;
  isSingle: boolean;
  uid: string;
}) {
  const format = (config.axis?.format ?? "number") as ValueFormat;
  const type = config.chart_type;

  if (type === "metric") {
    const column = config.value_columns[0];
    const value = data.rows[0]?.[column];
    return (
      <div className={`flex flex-col justify-center ${isSingle ? "h-[140px]" : "h-[96px]"}`}>
        <p
          className={`font-bold tracking-tight tabular-nums ${
            isSingle ? "text-5xl lg:text-6xl" : "text-4xl"
          }`}
          style={{ color: tokens.textPrimary }}
        >
          {formatValue(value, format, true)}
        </p>
        <p className="mt-2 text-xs font-medium" style={{ color: tokens.textSecondary }}>
          {config.axis?.y_label || humanize(column, config.labels)}
        </p>
      </div>
    );
  }

  if (type === "pie") {
    const slices = shapePie(config, data);
    const totalValue = slices.reduce((acc, s) => acc + s.value, 0);
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            innerRadius="56%"
            outerRadius="82%"
            paddingAngle={2}
            cornerRadius={4}
            stroke={tokens.surface}
            strokeWidth={2}
            isAnimationActive={true}
            animationDuration={600}
          >
            {slices.map((slice, index) => (
              <Cell key={slice.name} fill={tokens.series[index % tokens.series.length]} />
            ))}
          </Pie>
          {totalValue > 0 && (
            <>
              <text
                x="50%"
                y="47%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={tokens.textPrimary}
                style={{ fontSize: height >= 350 ? 24 : 18, fontWeight: 700 }}
              >
                {formatValue(totalValue, format, true)}
              </text>
              <text
                x="50%"
                y="57%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={tokens.textSecondary}
                style={{ fontSize: 11, fontWeight: 500 }}
              >
                Total
              </text>
            </>
          )}
          <Tooltip content={<TooltipBox tokens={tokens} format={format} total={totalValue} />} />
          {theme.show_legend && (
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              formatter={(value: string) => <span style={{ color: tokens.textSecondary }}>{value}</span>}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    );
  }

  const shaped = shapeChart(config, data);
  const showLegend = theme.show_legend && shaped.series.length >= 2;
  const axisProps = {
    stroke: tokens.axis,
    tick: { fill: tokens.textSecondary, fontSize: 11 },
    tickLine: false,
  };
  const common = (
    <>
      {theme.show_grid && (
        <CartesianGrid vertical={false} stroke={tokens.grid} strokeDasharray="3 3" opacity={0.8} />
      )}
      <XAxis
        dataKey={X_KEY}
        {...axisProps}
        interval="preserveStartEnd"
        minTickGap={16}
        tickMargin={8}
        label={
          config.axis?.x_label
            ? { value: config.axis.x_label, position: "insideBottom", offset: -4, fill: tokens.textSecondary, fontSize: 11 }
            : undefined
        }
      />
      <YAxis
        {...axisProps}
        axisLine={false}
        width={56}
        tickMargin={8}
        tickFormatter={(v: number) => formatValue(v, format, true)}
        label={
          config.axis?.y_label
            ? { value: config.axis.y_label, angle: -90, position: "insideLeft", fill: tokens.textSecondary, fontSize: 11 }
            : undefined
        }
      />
      <Tooltip
        content={<TooltipBox tokens={tokens} format={format} />}
        cursor={type === "line" || type === "area" ? { stroke: tokens.axis, strokeWidth: 1 } : { fill: tokens.grid, opacity: 0.6 }}
      />
      {showLegend && (
        <Legend
          verticalAlign="top"
          align="right"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
          formatter={(value: string) => <span style={{ color: tokens.textSecondary }}>{value}</span>}
        />
      )}
    </>
  );
  const margin = { top: 8, right: 12, bottom: config.axis?.x_label ? 18 : 6, left: 0 };

  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={shaped.rows} margin={margin}>
          {common}
          {shaped.series.map((s, index) => {
            const color = tokens.series[index % tokens.series.length];
            return (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={color}
                strokeWidth={2.5}
                dot={shaped.rows.length <= 15 ? { r: 3, fill: color, stroke: tokens.surface, strokeWidth: 1.5 } : false}
                activeDot={{ r: 5, stroke: tokens.surface, strokeWidth: 2, fill: color }}
                isAnimationActive={true}
                animationDuration={600}
                connectNulls
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === "area") {
    const stacked = shaped.series.length > 1;
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={shaped.rows} margin={margin}>
          <defs>
            {shaped.series.map((s, index) => {
              const color = tokens.series[index % tokens.series.length];
              return (
                <linearGradient key={s.key} id={`area-grad-${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              );
            })}
          </defs>
          {common}
          {shaped.series.map((s, index) => {
            const color = tokens.series[index % tokens.series.length];
            return (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stackId={stacked ? "stack" : undefined}
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#area-grad-${uid}-${s.key})`}
                activeDot={{ r: 5, stroke: tokens.surface, strokeWidth: 2, fill: color }}
                isAnimationActive={true}
                animationDuration={600}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  const stacked = type === "stacked_bar";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={shaped.rows} margin={margin} barGap={4} barCategoryGap="24%">
        <defs>
          {shaped.series.map((s, index) => {
            const color = tokens.series[index % tokens.series.length];
            return (
              <linearGradient key={s.key} id={`bar-grad-${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.95} />
                <stop offset="100%" stopColor={color} stopOpacity={0.75} />
              </linearGradient>
            );
          })}
        </defs>
        {common}
        {shaped.series.map((s, index) => {
          const color = tokens.series[index % tokens.series.length];
          const isTopBar = !stacked || index === shaped.series.length - 1;
          return (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stackId={stacked ? "stack" : undefined}
              fill={`url(#bar-grad-${uid}-${s.key})`}
              stroke={stacked ? tokens.surface : undefined}
              strokeWidth={stacked ? 1.5 : 0}
              radius={isTopBar ? [5, 5, 0, 0] : [0, 0, 0, 0]}
              maxBarSize={54}
              isAnimationActive={true}
              animationDuration={600}
            />
          );
        })}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function LiveChart({
  config,
  data,
  theme,
  loading,
  isSingle = false,
}: {
  config: LiveChartConfig;
  data: LiveChartData | undefined;
  theme: DashboardTheme;
  loading: boolean;
  isSingle?: boolean;
}) {
  const [showTable, setShowTable] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const rawId = useId();
  const chartUid = rawId.replace(/[^a-zA-Z0-9_-]/g, "_");

  const tokens = CHART_TOKENS[theme.mode];
  const isTable = config.chart_type === "table";
  const isMetric = config.chart_type === "metric";
  const canToggle = !isTable && !isMetric;
  const hasRows = !!data && !data.error && data.rows.length > 0;
  const typeMeta = getChartTypeMeta(config.chart_type);
  const TypeIcon = typeMeta.icon;

  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsExpanded(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  return (
    <>
      <section
        className={`flex min-w-0 flex-col rounded-card p-5 transition-all hover:border-accent/40 ${
          theme.mode === "light" ? "shadow-card hover:shadow-md" : "hover:shadow-[0_0_20px_rgba(0,0,0,0.3)]"
        }`}
        style={{ background: tokens.surface, border: `1px solid ${tokens.border}` }}
      >
        <header className="mb-3.5 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide"
                style={{
                  background: theme.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  color: tokens.textSecondary,
                  border: `1px solid ${tokens.border}`,
                }}
              >
                <TypeIcon className="size-3 text-accent" />
                {typeMeta.label}
              </span>
              {hasRows && (
                <span className="text-[10px] font-medium" style={{ color: tokens.textSecondary }}>
                  {data.rows.length.toLocaleString()} {data.rows.length === 1 ? "point" : "points"}
                </span>
              )}
            </div>
            <h2 className="truncate text-base font-semibold tracking-tight" style={{ color: tokens.textPrimary }} title={config.title}>
              {config.title}
            </h2>
            {config.description && (
              <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: tokens.textSecondary }}>
                {config.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {canToggle && hasRows && (
              <button
                type="button"
                onClick={() => setShowTable((v) => !v)}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors hover:border-accent"
                style={{ border: `1px solid ${tokens.border}`, color: tokens.textSecondary, background: tokens.surface }}
                aria-label={showTable ? "Show chart" : "Show table"}
                title={showTable ? "Switch to chart view" : "Switch to table view"}
              >
                {showTable ? <BarChart3 className="size-3" /> : <Table2 className="size-3" />}
                <span>{showTable ? "Chart" : "Table"}</span>
              </button>
            )}

            {hasRows && (
              <button
                type="button"
                onClick={() => downloadCsv(config.title, data.columns, data.rows)}
                className="flex size-7 items-center justify-center rounded-full transition-colors hover:border-accent hover:text-accent-dark"
                style={{ border: `1px solid ${tokens.border}`, color: tokens.textSecondary, background: tokens.surface }}
                aria-label="Download CSV"
                title="Download CSV"
              >
                <Download className="size-3" />
              </button>
            )}

            {hasRows && !isMetric && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="flex size-7 items-center justify-center rounded-full transition-colors hover:border-accent hover:text-accent-dark"
                style={{ border: `1px solid ${tokens.border}`, color: tokens.textSecondary, background: tokens.surface }}
                aria-label="Expand chart"
                title="Expand chart"
              >
                <Maximize2 className="size-3" />
              </button>
            )}
          </div>
        </header>

        {loading && !data ? (
          <div className={`animate-pulse rounded-lg ${isSingle ? "h-[300px]" : "h-[220px]"}`} style={{ background: tokens.grid }} />
        ) : data?.error ? (
          <div className="flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-xs" style={{ background: tokens.panel, color: tokens.textSecondary }}>
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-rust" />
            <span>{data.error}</span>
          </div>
        ) : !data ? (
          <div className="flex h-[180px] items-center justify-center text-xs" style={{ color: tokens.textSecondary }}>
            Unable to load data for this chart.
          </div>
        ) : data.rows.length === 0 ? (
          <div className="flex h-[180px] items-center justify-center text-xs" style={{ color: tokens.textSecondary }}>
            No data for this period.
          </div>
        ) : isTable || showTable ? (
          <DataTable
            config={config}
            data={data}
            tokens={tokens}
            maxHeightClass={isSingle ? "max-h-[380px]" : "max-h-[290px]"}
          />
        ) : (
          <Plot
            config={config}
            data={data}
            theme={theme}
            tokens={tokens}
            height={isSingle ? 380 : 290}
            isSingle={isSingle}
            uid={chartUid}
          />
        )}

        {data?.truncated && (
          <p className="mt-2 text-[10px]" style={{ color: tokens.textSecondary }}>
            Showing the first 5,000 rows.
          </p>
        )}
      </section>

      {isExpanded && data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/60 backdrop-blur-sm">
          <div
            className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl p-6 shadow-2xl overflow-hidden"
            style={{ background: tokens.surface, border: `1px solid ${tokens.border}` }}
          >
            <div className="mb-4 flex items-center justify-between border-b pb-3" style={{ borderColor: tokens.border }}>
              <div>
                <div className="flex items-center gap-2">
                  <TypeIcon className="size-4 text-accent" />
                  <h3 className="text-lg font-semibold" style={{ color: tokens.textPrimary }}>
                    {config.title}
                  </h3>
                </div>
                {config.description && (
                  <p className="mt-1 text-xs" style={{ color: tokens.textSecondary }}>
                    {config.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadCsv(config.title, data.columns, data.rows)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                  style={{ border: `1px solid ${tokens.border}`, color: tokens.textSecondary }}
                >
                  <Download className="size-3.5" />
                  <span>Download CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="flex size-8 items-center justify-center rounded-full transition-colors hover:border-accent hover:text-accent-dark"
                  style={{ border: `1px solid ${tokens.border}`, color: tokens.textSecondary }}
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {isTable || showTable ? (
                <DataTable config={config} data={data} tokens={tokens} maxHeightClass="max-h-[500px]" />
              ) : (
                <Plot
                  config={config}
                  data={data}
                  theme={theme}
                  tokens={tokens}
                  height={460}
                  isSingle={true}
                  uid={`${chartUid}-modal`}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}