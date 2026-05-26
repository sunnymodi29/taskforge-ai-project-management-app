"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const CHART_FONT = "var(--font-sans), system-ui, sans-serif";

export interface LineSeries<T> {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
  getValue: (point: T, index: number) => number | null;
}

interface LineChartProps<T extends object> {
  data: T[];
  xKey: keyof T & string;
  series: LineSeries<T>[];
  height?: number;
  yLabel?: string;
  emptyMessage?: string;
}

export function LineChart<T extends object>({
  data,
  xKey,
  series,
  height = 256,
  yLabel,
  emptyMessage = "No data",
}: LineChartProps<T>) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { paths, maxY, labels, padding } = useMemo(() => {
    const pad = { top: 16, right: 12, bottom: 36, left: 44 };
    const innerH = height - pad.top - pad.bottom;

    const allValues: number[] = [];
    data.forEach((row, rowIndex) => {
      series.forEach((s) => {
        const v = s.getValue(row, rowIndex);
        if (v != null && !Number.isNaN(v)) allValues.push(v);
      });
    });
    const max = Math.max(...allValues, 1);

    const labels = data.map((d) => String((d as Record<string, unknown>)[xKey] ?? ""));

    const paths = series.map((s) => {
      const points: { x: number; y: number | null }[] = data.map((row, i) => {
        const v = s.getValue(row, i);
        const x =
          pad.left +
          (data.length <= 1 ? 0 : (i / (data.length - 1)) * (100 - pad.left - pad.right));
        const y =
          v == null
            ? null
            : pad.top + innerH - (v / max) * innerH;
        return { x, y };
      });

      let d = "";
      points.forEach((p, i) => {
        if (p.y == null) return;
        const cmd = d === "" ? "M" : "L";
        d += `${cmd} ${p.x} ${p.y} `;
      });

      return { ...s, d: d.trim(), points, max };
    });

    return { paths, maxY: max, labels, padding: pad };
  }, [data, series, height, xKey]);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  const hover = hoverIndex != null ? data[hoverIndex] : null;

  return (
    <div className="relative w-full" style={{ height }}>
      {yLabel && (
        <span className="absolute left-0 top-0 text-[10px] text-muted-foreground -rotate-90 origin-left translate-y-20">
          {yLabel}
        </span>
      )}
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
        onMouseLeave={() => setHoverIndex(null)}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padding.top + (height - padding.top - padding.bottom) * t;
          return (
            <line
              key={t}
              x1={padding.left}
              x2={100 - padding.right}
              y1={y}
              y2={y}
              stroke="var(--color-border)"
              strokeWidth={0.5}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
        {paths.map((p) =>
          p.d ? (
            <path
              key={p.key}
              d={p.d}
              fill="none"
              stroke={p.color}
              strokeWidth={2}
              strokeDasharray={p.dashed ? "4 3" : undefined}
              vectorEffect="non-scaling-stroke"
            />
          ) : null
        )}
        {data.map((_, i) => {
          const x =
            padding.left +
            (data.length <= 1 ? 0 : (i / (data.length - 1)) * (100 - padding.left - padding.right));
          return (
            <rect
              key={i}
              x={x - 2}
              y={padding.top}
              width={4}
              height={height - padding.top - padding.bottom}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
            />
          );
        })}
      </svg>
      <div
        className="absolute bottom-0 left-0 right-0 flex justify-between px-2"
        style={{ fontFamily: CHART_FONT }}
      >
        {labels.map((label, i) => (
          <span
            key={i}
            className={cn(
              "text-[9px] text-muted-foreground truncate max-w-[14%]",
              hoverIndex === i && "text-foreground font-medium"
            )}
          >
            {label}
          </span>
        ))}
      </div>
      {hover && hoverIndex != null && (
        <div className="absolute top-2 right-2 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs shadow-lg z-10 min-w-[120px]">
          <div className="font-semibold mb-1">
            {String((hover as Record<string, unknown>)[xKey])}
          </div>
          {series.map((s) => {
            const v = s.getValue(hover, hoverIndex);
            if (v == null) return null;
            return (
              <div key={s.key} className="flex justify-between gap-3">
                <span style={{ color: s.color }}>{s.label}</span>
                <span className="font-mono font-medium">{v}</span>
              </div>
            );
          })}
        </div>
      )}
      <div
        className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col justify-between text-[9px] text-muted-foreground font-mono h-[calc(100%-48px)]"
        style={{ fontFamily: CHART_FONT }}
      >
        <span>{maxY}</span>
        <span>0</span>
      </div>
    </div>
  );
}

export interface BarGroup<T> {
  key: string;
  label: string;
  color: string;
  getValue: (row: T) => number;
}

interface GroupedBarChartProps<T extends object> {
  data: T[];
  xKey: keyof T & string;
  groups: BarGroup<T>[];
  height?: number;
  emptyMessage?: string;
}

export function GroupedBarChart<T extends object>({
  data,
  xKey,
  groups,
  height = 256,
  emptyMessage = "No data",
}: GroupedBarChartProps<T>) {
  const [hover, setHover] = useState<number | null>(null);

  const maxVal = useMemo(() => {
    let m = 0;
    for (const row of data) {
      for (const g of groups) {
        m = Math.max(m, g.getValue(row));
      }
    }
    return Math.max(m, 1);
  }, [data, groups]);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-around gap-2 h-[calc(100%-40px)] px-2 pt-4">
        {data.map((row, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 h-full min-w-0"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <div className="flex items-end justify-center gap-0.5 w-full h-full">
              {groups.map((g) => {
                const v = g.getValue(row);
                const pct = (v / maxVal) * 100;
                return (
                  <div
                    key={g.key}
                    className="flex-1 max-w-8 rounded-t-sm transition-all"
                    style={{
                      height: `${pct}%`,
                      backgroundColor: g.color,
                      opacity: hover === i ? 1 : 0.85,
                    }}
                    title={`${g.label}: ${v}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-around gap-1 px-2 mt-2">
        {data.map((row, i) => (
          <div key={i} className="flex-1 text-center min-w-0">
            <div
              className={cn(
                "text-[9px] font-bold truncate",
                hover === i ? "text-primary" : "text-muted-foreground"
              )}
            >
              {String((row as Record<string, unknown>)[xKey])}
            </div>
          </div>
        ))}
      </div>
      {hover != null && (
        <div className="mt-2 mx-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs flex flex-wrap gap-3 justify-center">
          {groups.map((g) => (
            <span key={g.key}>
              <span style={{ color: g.color }} className="font-medium">
                {g.label}
              </span>
              : {g.getValue(data[hover])}
            </span>
          ))}
        </div>
      )}
      <div className="flex justify-center gap-4 mt-2 text-[10px]">
        {groups.map((g) => (
          <span key={g.key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: g.color }} />
            {g.label}
          </span>
        ))}
      </div>
    </div>
  );
}

interface DonutChartProps {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  emptyMessage?: string;
}

export function DonutChart({
  segments,
  size = 180,
  emptyMessage = "No data",
}: DonutChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const total = segments.reduce((s, x) => s + x.value, 0);

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ width: size, height: size }}
      >
        {emptyMessage}
      </div>
    );
  }

  const r = 40;
  const cx = 50;
  const cy = 50;
  let cumulative = 0;

  const arcs = segments.map((seg, i) => {
    const start = (cumulative / total) * 360;
    cumulative += seg.value;
    const end = (cumulative / total) * 360;
    const large = end - start > 180 ? 1 : 0;
    const startRad = ((start - 90) * Math.PI) / 180;
    const endRad = ((end - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return { ...seg, d, pct: Math.round((seg.value / total) * 100), i };
  });

  const activeSeg = active != null ? arcs[active] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="shrink-0"
        onMouseLeave={() => setActive(null)}
      >
        {arcs.map((a) => (
          <path
            key={a.label}
            d={a.d}
            fill={a.color}
            opacity={active === null || active === a.i ? 0.9 : 0.35}
            stroke="var(--color-card)"
            strokeWidth={1}
            className="cursor-pointer transition-opacity"
            onMouseEnter={() => setActive(a.i)}
          />
        ))}
        <circle cx={cx} cy={cy} r={22} fill="var(--color-card)" />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--color-foreground)"
          fontSize={11}
          fontWeight={700}
          fontFamily={CHART_FONT}
        >
          {activeSeg ? `${activeSeg.pct}%` : total}
        </text>
      </svg>
      <div className="flex-1 space-y-2 w-full min-w-0">
        {arcs.map((a) => (
          <div
            key={a.label}
            className={cn(
              "flex items-center justify-between text-xs rounded-lg px-2 py-1.5 transition-colors cursor-default",
              active === a.i && "bg-muted"
            )}
            onMouseEnter={() => setActive(a.i)}
            onMouseLeave={() => setActive(null)}
          >
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: a.color }}
              />
              <span className="truncate font-medium">{a.label}</span>
            </span>
            <span className="text-muted-foreground shrink-0 ml-2">
              {a.value} ({a.pct}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface HorizontalBarChartProps {
  items: { label: string; value: number; color: string }[];
  emptyMessage?: string;
}

export function HorizontalBarChart({
  items,
  emptyMessage = "No data",
}: HorizontalBarChartProps) {
  const max = Math.max(...items.map((i) => i.value), 1);

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">{emptyMessage}</p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-medium">{item.label}</span>
            <span className="text-muted-foreground font-mono">{item.value}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
