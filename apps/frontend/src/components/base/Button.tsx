import { Button as AntButton, type ButtonProps as AntButtonProps } from "antd";
import { forwardRef } from "react";

/**
 * Semantic button intents.
 *
 * Two tones (brand / danger) x three emphasis levels. Nothing else is offered
 * on purpose: status colors (success, warning) belong on Tag and Alert, not on
 * a button, and a yellow "cancel" reads as a warning about the cancel itself.
 *
 *              | solid          | outlined       | text
 *   -----------|----------------|----------------|---------------
 *   brand      | primary        | -              | -
 *   neutral    | -              | neutral        | quiet
 *   danger     | danger         | dangerSubtle   | dangerQuiet
 *
 * `primary` is limited to one per screen. Cancel / back / add-row are
 * `neutral`. A delete that opens a confirmation is `dangerSubtle`; the button
 * that actually deletes, inside that confirmation, is `danger`.
 */
export type ButtonIntent =
  | "primary"
  | "neutral"
  | "quiet"
  | "danger"
  | "dangerSubtle"
  | "dangerQuiet";

type IntentPreset = Required<Pick<AntButtonProps, "color" | "variant">>;

const INTENT_PRESETS: Record<ButtonIntent, IntentPreset> = {
  primary: { color: "primary", variant: "solid" },
  neutral: { color: "default", variant: "outlined" },
  quiet: { color: "default", variant: "text" },
  danger: { color: "danger", variant: "solid" },
  dangerSubtle: { color: "danger", variant: "outlined" },
  dangerQuiet: { color: "danger", variant: "text" },
};

export interface ButtonProps extends AntButtonProps {
  /** Defaults to `neutral` so an unlabelled button is never the loudest one. */
  intent?: ButtonIntent;
}

/**
 * Ant Design Button with the project's intent presets applied.
 *
 * Colors are resolved by Ant Design from the theme, never written here. An
 * inline `backgroundColor` would beat Ant Design's hover / active / disabled
 * rules and silently delete those states, so this component only ever chooses
 * `color` and `variant`. Callers may still pass `color` / `variant` directly
 * for a one-off combination; those win over the preset.
 */
export const Button = forwardRef<HTMLAnchorElement | HTMLButtonElement, ButtonProps>(
  ({ intent = "neutral", color, variant, ...props }, ref) => {
    const preset = INTENT_PRESETS[intent];

    return (
      <AntButton
        ref={ref}
        color={color ?? preset.color}
        variant={variant ?? preset.variant}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
