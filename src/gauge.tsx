import { cn } from "./utils";

interface GaugeProps {
  /** 0–100 */
  value: number;
  label?: string;
  /** Optional zone thresholds; default tuned for a readiness 0–100 score. */
  zones?: { watch: number; nominal: number };
  className?: string;
}

const SIZE = 180;
const STROKE = 12;
const R = (SIZE - STROKE) / 2 - 6;
const CX = SIZE / 2;
const CY = SIZE / 2;
// 270° sweep, opening at the bottom.
const START = 135;
const SWEEP = 270;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(r: number, startDeg: number, endDeg: number) {
  const start = polar(CX, CY, r, startDeg);
  const end = polar(CX, CY, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

export function Gauge({
  value,
  label = "Readiness",
  zones = { watch: 50, nominal: 75 },
  className,
}: GaugeProps) {
  const v = Math.max(0, Math.min(100, value));
  const endAngle = START + (SWEEP * v) / 100;
  const tip = polar(CX, CY, R, endAngle);

  const tone =
    v >= zones.nominal ? "success" : v >= zones.watch ? "warning" : "danger";
  const stroke =
    tone === "success"
      ? "var(--success)"
      : tone === "warning"
        ? "var(--warning)"
        : "var(--danger)";
  const toneLabel =
    tone === "success" ? "Ready" : tone === "warning" ? "Moderate" : "Low";

  // Zone boundary ticks — make the watch/nominal thresholds visible on the
  // track so the value isn't judged against invisible cutoffs.
  const tickAngles = [zones.watch, zones.nominal].map(
    (z) => START + (SWEEP * z) / 100,
  );

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-44 w-44"
        role="img"
        aria-label={`${label}: ${v} of 100 — ${toneLabel}`}
      >
        {/* track */}
        <path
          d={arcPath(R, START, START + SWEEP)}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
        {/* zone threshold ticks */}
        {tickAngles.map((a, i) => {
          const inner = polar(CX, CY, R - STROKE / 2 - 1, a);
          const outer = polar(CX, CY, R + STROKE / 2 + 1, a);
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--border)"
              strokeWidth={2}
            />
          );
        })}
        {/* value arc */}
        <path
          d={arcPath(R, START, endAngle)}
          fill="none"
          stroke={stroke}
          strokeWidth={STROKE}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 5px var(--glow))" }}
        />
        {/* tip star */}
        <circle cx={tip.x} cy={tip.y} r={4} fill={stroke} />
        <circle cx={tip.x} cy={tip.y} r={8} fill={stroke} opacity={0.18} />

        {/* readout */}
        <text
          x={CX}
          y={CY - 2}
          textAnchor="middle"
          className="tnum font-mono"
          style={{ fontSize: 38, fontWeight: 600, fill: "var(--foreground)" }}
        >
          {v}
        </text>
        <text
          x={CX}
          y={CY + 22}
          textAnchor="middle"
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fill: "var(--muted-foreground)",
          }}
        >
          {toneLabel}
        </text>
      </svg>
    </div>
  );
}
