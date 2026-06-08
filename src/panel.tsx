import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "./utils";

/**
 * Semantic status — the single good/watch/alert axis used everywhere in Polaris.
 * Gauge tones and Timeline severities map onto this same vocabulary (see
 * docs/design-system.md § "One semantic axis"). "none" = no judgement to show.
 */
export type Status = "nominal" | "watch" | "alert" | "none";

/** Lifecycle of a panel's data, independent of its status. */
export type PanelState = "ready" | "loading" | "empty" | "error";

const STATUS_STYLES: Record<Exclude<Status, "none">, string> = {
  nominal: "bg-success",
  watch: "bg-warning",
  alert: "bg-danger",
};

const STATUS_LABEL: Record<Exclude<Status, "none">, string> = {
  nominal: "Nominal",
  watch: "Watch",
  alert: "Alert",
};

export function StatusDot({ status }: { status: Exclude<Status, "none"> }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        {status === "alert" && (
          <span
            className={cn(
              // Decorative redundancy only; the text label carries the meaning.
              // Hidden under prefers-reduced-motion.
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:hidden",
              STATUS_STYLES[status],
            )}
            aria-hidden
          />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            STATUS_STYLES[status],
          )}
          aria-hidden
        />
      </span>
      <span className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">
        {STATUS_LABEL[status]}
      </span>
    </span>
  );
}

export function Freshness({
  updatedAt,
  stale = false,
}: {
  updatedAt: string;
  stale?: boolean;
}) {
  return (
    <span
      className={cn(
        "tnum font-mono text-[0.7rem]",
        stale ? "text-stale" : "text-muted-foreground",
      )}
    >
      {stale && (
        <span className="mr-1.5 rounded-sm border border-stale/50 px-1 py-px text-[0.6rem] uppercase tracking-wider text-stale">
          Stale
        </span>
      )}
      {updatedAt}
    </span>
  );
}

export interface PanelProps extends React.ComponentProps<"section"> {
  title: string;
  /** Short source/unit hint shown under the title, e.g. "health-fitness-coach". */
  source?: string;
  status?: Status;
  updatedAt?: string;
  /** Data is older than its freshness SLA: dim the body, badge the footer. */
  stale?: boolean;
  /** Data lifecycle. Drives skeleton / empty / error rendering. */
  state?: PanelState;
  /** Override the default empty/error copy. */
  emptyMessage?: string;
  errorMessage?: string;
  /** Called by the error state's retry affordance, if provided. */
  onRetry?: () => void;
  /** A large headline figure rendered top-right (e.g. the current value). */
  metric?: React.ReactNode;
}

export function Panel({
  title,
  source,
  status = "none",
  updatedAt,
  stale = false,
  state = "ready",
  emptyMessage = "No data yet.",
  errorMessage = "Couldn’t load this panel.",
  onRetry,
  metric,
  className,
  children,
  ...props
}: PanelProps) {
  const showStatus = state === "ready" && status !== "none";
  return (
    <section
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-xl border bg-card p-5",
        "shadow-[var(--elevation-panel)] transition-colors hover:border-ring/30",
        stale && state === "ready" && "is-stale",
        className,
      )}
      aria-busy={state === "loading"}
      {...props}
    >
      {/* hairline star-light along the top edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-star/40 to-transparent opacity-0 transition-opacity duration-[var(--duration-base)] group-hover:opacity-100"
      />
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-card-foreground">
              {title}
            </h3>
            {showStatus && <StatusDot status={status} />}
          </div>
          {source && (
            <span className="font-mono text-[0.7rem] text-muted-foreground">
              {source}
            </span>
          )}
        </div>
        {state === "ready" && metric != null && (
          <div className="shrink-0 text-right leading-none">{metric}</div>
        )}
      </header>

      <div className="panel-body flex-1">
        {state === "ready" && children}
        {state === "loading" && <PanelSkeleton />}
        {state === "empty" && <PanelEmpty message={emptyMessage} />}
        {state === "error" && (
          <PanelError message={errorMessage} onRetry={onRetry} />
        )}
      </div>

      {updatedAt && state !== "error" && (
        <footer className="flex items-center justify-end border-t pt-3">
          <Freshness updatedAt={updatedAt} stale={stale} />
        </footer>
      )}
    </section>
  );
}

/** Loading: a calm shimmer placeholder that holds the panel's height. */
function PanelSkeleton() {
  return (
    <div
      className="flex h-36 flex-col justify-end gap-2"
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading…</span>
      <div className="flex flex-1 items-end gap-2" aria-hidden>
        {[40, 70, 30, 85, 55, 95, 65].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-muted motion-safe:animate-pulse"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Empty: a quiet message, never an error tone. */
function PanelEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-36 flex-col items-center justify-center gap-1 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/** Error / could-not-load: stated plainly, with an optional retry. */
function PanelError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="flex h-36 flex-col items-center justify-center gap-2 text-center"
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 text-danger" aria-hidden />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-accent"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Retry
        </button>
      )}
    </div>
  );
}
