import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BarSeries } from "../src/bar-series";

/**
 * Regression: a BarSeries whose labels repeat (any window spanning more than
 * one week repeats weekday names) keyed its bars by `label`, so React saw two
 * children with the same key. Duplicate keys let React drop or duplicate
 * children during reconciliation, so a bar can silently render wrong.
 *
 * Observed in Polaris as: "Encountered two children with the same key, `Tue`".
 * Note this only surfaces in a real client render — React validates child keys
 * while reconciling, so renderToStaticMarkup does NOT catch it.
 */
const TWO_WEEKS = [
  { label: "Sun", value: 12 },
  { label: "Tue", value: 10 },
  { label: "Thu", value: 10 },
  { label: "Sat", value: 10 },
  { label: "Mon", value: 8 },
  { label: "Tue", value: 7 },
  { label: "Thu", value: 7 },
];

function render(ui: ReactNode) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  act(() => {
    createRoot(host).render(ui);
  });
  return host;
}

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("BarSeries", () => {
  it("does not warn about duplicate keys when weekday labels repeat", () => {
    const errors: string[] = [];
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      errors.push(args.map(String).join(" "));
    });

    render(<BarSeries data={TWO_WEEKS} unit=" sets" />);

    expect(
      errors.filter((e) => e.includes("same key")),
      `React reported duplicate keys:\n${errors.join("\n")}`,
    ).toEqual([]);
  });

  it("renders every bar and every axis label, including the repeats", () => {
    const host = render(<BarSeries data={TWO_WEEKS} unit=" sets" />);

    // One titled wrapper per bar, so a dropped bar is a missing tooltip.
    expect(host.querySelectorAll("[title]")).toHaveLength(TWO_WEEKS.length);
    const axis = [...host.querySelectorAll("span")]
      .map((s) => s.textContent)
      .filter((t) => t === "Tue" || t === "Thu");
    expect(axis).toHaveLength(4);
  });
});
