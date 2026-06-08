import { cn } from "./utils";

interface Point {
  label: string;
  value: number;
}

/**
 * Which way is "good"? Direction of travel is NOT goodness — a rising HbA1c or a
 * rising email backlog is bad, a rising readiness streak is good. The series must
 * declare its semantics; the component never assumes up = good.
 */
type GoodDirection = "up" | "down" | "none";

interface LineSeriesProps {
  data: Point[];
  /** Unique id so multiple charts' gradients don't collide. */
  seriesId: string;
  /** CSS color var name for the line, e.g. "--chart-2". */
  colorVar?: string;
  unit?: string;
  /** Which direction of change is favourable. Defaults to "none" (neutral). */
  goodDirection?: GoodDirection;
  className?: string;
}

const W = 320;
const H = 130;
const PAD = 10;

export function LineSeries({
  data,
  seriesId,
  colorVar = "--chart-2",
  unit = "",
  goodDirection = "none",
  className,
}: LineSeriesProps) {
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = PAD + (1 - (d.value - min) / range) * (H - PAD * 2);
    return { x, y };
  });

  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const area =
    `M ${coords[0].x} ${H - PAD} ` +
    coords.map((c) => `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ") +
    ` L ${coords[coords.length - 1].x} ${H - PAD} Z`;

  const last = coords[coords.length - 1];
  const first = data[0].value;
  const latest = data[data.length - 1].value;
  const delta = latest - first;
  const rising = delta >= 0;

  // Goodness is derived from direction-of-travel vs the declared good direction.
  const favourable =
    goodDirection === "none"
      ? null
      : (rising && goodDirection === "up") ||
        (!rising && goodDirection === "down");

  const deltaTone =
    favourable === null
      ? "text-muted-foreground"
      : favourable
        ? "text-success"
        : "text-danger";

  // Arrow encodes direction (shape redundancy); colour encodes goodness.
  const arrow = rising ? "▲" : "▼";
  const trendWord = rising ? "up" : "down";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Trend from ${data[0].label} to ${
          data[data.length - 1].label
        }: ${trendWord} ${Math.abs(delta).toFixed(1)}${unit}${
          favourable === null
            ? ""
            : favourable
              ? ", favourable"
              : ", unfavourable"
        }`}
      >
        <defs>
          <linearGradient id={`grad-${seriesId}`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={`var(${colorVar})`}
              stopOpacity="0.28"
            />
            <stop offset="100%" stopColor={`var(${colorVar})`} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#grad-${seriesId})`} />
        <path
          d={line}
          fill="none"
          stroke={`var(${colorVar})`}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={last.x}
          cy={last.y}
          r={3.5}
          fill={`var(${colorVar})`}
          style={{ filter: "drop-shadow(0 0 5px var(--glow))" }}
        />
      </svg>
      <div className="flex items-center justify-between text-[0.65rem] text-muted-foreground">
        <span className="uppercase tracking-wide">{data[0].label}</span>
        <span className={cn("tnum font-mono", deltaTone)} aria-hidden>
          {arrow} {Math.abs(delta).toFixed(1)}
          {unit}
        </span>
        <span className="uppercase tracking-wide">
          {data[data.length - 1].label}
        </span>
      </div>
    </div>
  );
}
