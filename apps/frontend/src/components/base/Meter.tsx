import { clamp } from "../../utils/number";

export interface MeterProps {
  /** The ratio to display, 0-1. Values outside the range are clamped. */
  value: number;
  /**
   * Optional reference tick, 0-1. Draws a hairline at that position - e.g. the
   * 50% break-even line on a win rate, so "above or below even" is readable
   * without doing the arithmetic.
   */
  reference?: number;
  /**
   * `muted` uses a lighter step of the same hue. Length already encodes the
   * ratio, so lightness is free to say "this came from too few samples".
   */
  emphasis?: "strong" | "muted";
  /** Describes the value for screen readers, e.g. "勝率 60.4%". */
  label: string;
}

/**
 * A single ratio against a limit (see theme/README.md).
 *
 * Deliberately not a chart and not `Progress`: this needs a reference tick and a
 * fixed track, and a two-element bar is clearer than configuring one away.
 */
export function Meter({ value, reference, emphasis = "strong", label }: MeterProps) {
  const ratio = clamp(value, 0, 1);

  return (
    <div
      className="app-meter"
      role="meter"
      aria-valuenow={Math.round(ratio * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={`app-meter__fill${emphasis === "muted" ? " app-meter__fill--muted" : ""}`}
        style={{ width: `${ratio * 100}%` }}
      />
      {reference !== undefined && (
        <div
          className="app-meter__reference"
          style={{ left: `${clamp(reference, 0, 1) * 100}%` }}
        />
      )}
    </div>
  );
}
