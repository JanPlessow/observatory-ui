import { cn } from "./utils";

interface Bar {
  label: string;
  value: number;
}

interface BarSeriesProps {
  data: Bar[];
  unit?: string;
  /** Optional reference line (e.g. a target or trailing average). */
  target?: number;
  className?: string;
}

export function BarSeries({ data, unit, target, className }: BarSeriesProps) {
  const max = Math.max(...data.map((d) => d.value), target ?? 0) * 1.12 || 1;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="relative flex h-36 items-stretch gap-2">
        {target != null && (
          <div
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-star-gold/60"
            style={{ bottom: `${(target / max) * 100}%` }}
          >
            <span className="absolute -top-4 right-0 font-mono text-[0.65rem] text-gold-ink">
              target {target}
              {unit}
            </span>
          </div>
        )}
        {data.map((d, i) => {
          const h = (d.value / max) * 100;
          const isLast = i === data.length - 1;
          return (
            <div
              key={d.label}
              className="group/bar flex flex-1 flex-col items-center justify-end gap-2"
              title={`${d.label}: ${d.value}${unit ?? ""}`}
            >
              <span className="tnum font-mono text-[0.65rem] text-muted-foreground opacity-0 transition-opacity group-hover/bar:opacity-100">
                {d.value}
              </span>
              <div
                className={cn(
                  "w-full rounded-t-sm bg-gradient-to-t transition-all",
                  isLast
                    ? "from-chart-1/70 to-chart-1"
                    : "from-chart-1/55 to-chart-1/80",
                  "group-hover/bar:from-chart-1 group-hover/bar:to-chart-1",
                )}
                style={{
                  height: `${h}%`,
                  minHeight: "4px",
                  ...(isLast
                    ? { filter: "drop-shadow(0 0 6px var(--glow))" }
                    : {}),
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        {data.map((d) => (
          <span
            key={d.label}
            className="flex-1 text-center text-[0.65rem] uppercase tracking-wide text-muted-foreground"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
