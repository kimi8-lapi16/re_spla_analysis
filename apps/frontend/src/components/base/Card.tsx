import { Card as AntCard, type CardProps as AntCardProps } from "antd";
import { forwardRef } from "react";

/**
 * Visual weight of a card.
 *
 * Named `tone` rather than `variant` so Ant Design v6's own
 * `variant="outlined" | "borderless"` stays available to callers. Shadowing a
 * library prop with a different meaning makes the library's API unreachable.
 */
export type CardTone = "plain" | "highlight" | "raised";

const TONE_CLASS_NAMES: Record<CardTone, string> = {
  plain: "app-card app-card--plain",
  highlight: "app-card app-card--highlight",
  raised: "app-card app-card--raised",
};

export interface CardProps extends AntCardProps {
  tone?: CardTone;
}

/**
 * Ant Design Card with the project's tone presets applied.
 *
 * Tone styling lives in base.css so it stays overridable by the cascade;
 * inline styles here would beat every later rule, including the caller's own.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ tone = "plain", className, variant, ...props }, ref) => {
    const toneClassName = TONE_CLASS_NAMES[tone];

    return (
      <AntCard
        ref={ref}
        variant={variant ?? (tone === "raised" ? "borderless" : "outlined")}
        className={className ? `${toneClassName} ${className}` : toneClassName}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
