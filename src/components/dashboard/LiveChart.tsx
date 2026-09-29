"use client";

import { useState } from "react";
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
import { AlertTriangle, Table2, BarChart3 } from "lucide-react";
import type { DashboardTheme, LiveChartConfig, LiveChartData } from "@/lib/types";
import { CHART_TOKENS, type ChartTokens } from "./chartTheme";
import { formatValue, humanize, type ValueFormat } from "./format";
import { X_KEY, shapeChart, shapePie } from "./shapeData";

const CHART_HEIGHT = 260;

function TooltipBox({
  active,
  payload,
  label,
  tokens,
  format,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  tokens: ChartTokens;
  format: ValueFormat;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-card"
      style={{ background: tokens.surface, border: `1px solid ${tokens.border}`, color: tokens.textPrimary }}
    >
      {label !== undefined && label !== "" && <p className="mb-1 font-semibold">{label}</p>}
      <ul className="space-y-0.5">
        {payload.map((item) => (
          <li key={item.name} className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full" style={{ background: item.color }} />
            <span style={{ color: tokens.textSecondary }}>{item.name}</span>
            <span className="ml-auto pl-3 font-semibold tabular-nums">{formatValue(item.value, format)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DataTable({ config, data, tokens }: { config: LiveChartConfig; data: LiveChartData; tokens: ChartTokens }) {
  const format = (config.axis?.format ?? "number") as ValueFormat;
  const numeric = new Set(config.value_columns);
  return (
    <div className="max-h-[260px] overflow-auto rounded-lg" style={{ border: `1px solid ${tokens.border}` }}>
      <table className="w-full text-left text-xs" style={{ color: tokens.textPrimary }}>
        <thead className="sticky top-0" style={{ background: tokens.panel }}>
          <tr>
            {data.columns.map((column) => (
              <th key={column} className="whitespace-nowrap px-3 py-2 font-semibold" style={{ color: tokens.textSecondary }}>
                {humanize(column, config.labels)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.slice(0, 500).map((row, index) => (
            <tr key={index} style={{ borderTop: `1px solid ${tokens.grid}` }}>
              {data.columns.map((column) => (
                <td
                  key={column}
                  className={`whitespace-nowrap px-3 py-1.5 ${numeric.has(column) ? "text-right tabular-nums" : ""}`}
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
}: {
  config: LiveChartConfig;
  data: LiveChartData;
  theme: DashboardTheme;
  tokens: ChartTokens;
}) {
  const format = (config.axis?.format ?? "number") as ValueFormat;
  const type = config.chart_type;

  if (type === "metric") {
    const column = config.value_columns[0];
    const value = data.rows[0]?.[column];
    return (
      <div className="flex h-[96px] flex-col justify-center">
        <p className="text-4xl font-semibold tabular-nums" style={{ color: tokens.textPrimary }}>
          {formatValue(value, format, true)}
        </p>
        <p className="mt-1 text-xs" style={{ color: tokens.textSecondary }}>
          {config.axis?.y_label || humanize(column, config.labels)}
        </p>
      </div>
    );
  }

  if (type === "pie") {
    const slices = shapePie(config, data);
    return (
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={1}
            stroke={tokens.surface}
            strokeWidth={2}
            isAnimationActive={false}
          >
            {slices.map((slice, index) => (
              <Cell key={slice.name} fill={tokens.series[index % tokens.series.length]} />
            ))}
          </Pie>
          <Tooltip content={<TooltipBox tokens={tokens} format={format} />} />
          {theme.show_legend && (
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11 }}
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
      {theme.show_grid && <CartesianGrid vertical={false} stroke={tokens.grid} />}
      <XAxis
        dataKey={X_KEY}
        {...axisProps}
        interval="preserveStartEnd"
        minTickGap={16}
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
        tickFormatter={(v: number) => formatValue(v, format, true)}
        label={
          config.axis?.y_label
            ? { value: config.axis.y_label, angle: -90, position: "insideLeft", fill: tokens.textSecondary, fontSize: 11 }
            : undefined
        }
      />
      <Tooltip
        content={<TooltipBox tokens={tokens} format={format} />}
        cursor={type === "line" || type === "area" ? { stroke: tokens.axis, strokeWidth: 1 } : { fill: tokens.grid }}
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
  const margin = { top: 4, right: 8, bottom: config.axis?.x_label ? 16 : 4, left: 0 };

  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart data={shaped.rows} margin={margin}>
          {common}
          {shaped.series.map((s, index) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={tokens.series[index]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: tokens.surface, strokeWidth: 2 }}
              isAnimationActive={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === "area") {
    const stacked = shaped.series.length > 1;
    return (
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <AreaChart data={shaped.rows} margin={margin}>
          {common}
          {shaped.series.map((s, index) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stackId={stacked ? "stack" : undefined}
              stroke={tokens.series[index]}
              strokeWidth={2}
              fill={tokens.series[index]}
              fillOpacity={0.18}
              activeDot={{ r: 4, stroke: tokens.surface, strokeWidth: 2 }}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  const stacked = type === "stacked_bar";
  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <BarChart data={shaped.rows} margin={margin} barGap={2} barCategoryGap="22%">
        {common}
        {shaped.series.map((s, index) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            stackId={stacked ? "stack" : undefined}
            fill={tokens.series[index]}
            stroke={stacked ? tokens.surface : undefined}
            strokeWidth={stacked ? 2 : 0}
            radius={stacked ? (index === shaped.series.length - 1 ? [4, 4, 0, 0] : 0) : [4, 4, 0, 0]}
            maxBarSize={56}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function LiveChart({
  config,
  data,
  theme,
  loading,
}: {
  config: LiveChartConfig;
  data: LiveChartData | undefined;
  theme: DashboardTheme;
  loading: boolean;
}) {
  const [showTable, setShowTable] = useState(false);
  const tokens = CHART_TOKENS[theme.mode];
  const isTable = config.chart_type === "table";
  const canToggle = !isTable && config.chart_type !== "metric";

  return (
    <section
      className={`flex min-w-0 flex-col rounded-card p-4 ${theme.mode === "light" ? "shadow-card" : ""}`}
      style={{ background: tokens.surface, border: `1px solid ${tokens.border}` }}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold" style={{ color: tokens.textPrimary }} title={config.title}>
            {config.title}
          </h2>
          {config.description && (
            <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: tokens.textSecondary }}>
              {config.description}
            </p>
          )}
        </div>
        {canToggle && data && !data.error && data.rows.length > 0 && (
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium"
            style={{ border: `1px solid ${tokens.border}`, color: tokens.textSecondary }}
            aria-label={showTable ? "Show chart" : "Show table"}
          >
            {showTable ? <BarChart3 className="size-3" /> : <Table2 className="size-3" />}
            {showTable ? "Chart" : "Table"}
          </button>
        )}
      </header>

      {loading && !data ? (
        <div className="h-[200px] animate-pulse rounded-lg" style={{ background: tokens.grid }} />
      ) : data?.error ? (
        <div className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs" style={{ background: tokens.panel, color: tokens.textSecondary }}>
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-rust" />
          <span>{data.error}</span>
        </div>
      ) : !data || data.rows.length === 0 ? (
        <div className="flex h-[140px] items-center justify-center text-xs" style={{ color: tokens.textSecondary }}>
          No data for this period.
        </div>
      ) : isTable || showTable ? (
        <DataTable config={config} data={data} tokens={tokens} />
      ) : (
        <Plot config={config} data={data} theme={theme} tokens={tokens} />
      )}

      {data?.truncated && (
        <p className="mt-2 text-[10px]" style={{ color: tokens.textSecondary }}>
          Showing the first 5,000 rows.
        </p>
      )}
    </section>
  );
}
