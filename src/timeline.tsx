import { cn } from "./utils";

type Severity = "low" | "moderate" | "high";

interface TimelineEvent {
  label: string;
  daysAgo: number;
  severity: Severity;
  note?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  /** Window in days the track represents. */
  windowDays?: number;
  className?: string;
}

const SEV: Record<Severity, { dot: string; text: string; r: string }> = {
  low: { dot: "bg-success", text: "text-success", r: "h-2.5 w-2.5" },
  moderate: { dot: "bg-warning", text: "text-warning", r: "h-3 w-3" },
  high: { dot: "bg-danger", text: "text-danger", r: "h-3.5 w-3.5" },
};

export function Timeline({
  events,
  windowDays = 28,
  className,
}: TimelineProps) {
  const sorted = [...events].sort((a, b) => b.daysAgo - a.daysAgo);

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="relative h-12">
        {/* track */}
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        {/* "now" marker */}
        <div className="absolute right-0 top-1/2 h-3 -translate-y-1/2 border-l border-star/50" />
        <span className="absolute -bottom-1 right-0 font-mono text-[0.6rem] text-star">
          now
        </span>
        <span className="absolute -bottom-1 left-0 font-mono text-[0.6rem] text-muted-foreground">
          −{windowDays}d
        </span>
        {sorted.map((e, i) => {
          const t = Math.max(0, Math.min(1, 1 - e.daysAgo / windowDays));
          const s = SEV[e.severity];
          return (
            <div
              key={`${e.label}-${i}`}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${t * 100}%` }}
              title={`${e.daysAgo}d ago — ${e.label}${e.note ? `: ${e.note}` : ""}`}
            >
              <span
                className={cn(
                  "block rounded-full ring-2 ring-background",
                  s.dot,
                  s.r,
                )}
                style={
                  e.severity === "high"
                    ? { filter: "drop-shadow(0 0 5px var(--glow))" }
                    : undefined
                }
              />
            </div>
          );
        })}
      </div>

      {/* recent events list */}
      <ul className="flex flex-col gap-2">
        {sorted
          .slice(-3)
          .reverse()
          .map((e, i) => {
            const s = SEV[e.severity];
            return (
              <li
                key={`row-${e.label}-${i}`}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <span className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", s.dot)} />
                  <span className="text-card-foreground">{e.label}</span>
                </span>
                <span className="tnum font-mono text-[0.7rem] text-muted-foreground">
                  {e.daysAgo}d ago
                </span>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
