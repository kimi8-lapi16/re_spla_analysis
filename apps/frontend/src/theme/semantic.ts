import { colors } from "./colors";

/**
 * Semantic tokens - the single source of truth for "which color means what".
 *
 * colors.ts holds the raw palette (what colors exist).
 * semantic.ts holds the intent (where each color is allowed to be used).
 *
 * Components must never read from `colors` directly. They consume either
 * these tokens, the Ant Design theme derived from them (antd-theme.ts),
 * or the CSS custom properties derived from them (cssVariables.ts).
 *
 * Contrast policy (WCAG 2.1 AA, 4.5:1 for body text on a filled surface):
 *   fill = 600 / hover = 700 / active = 800 / border = 300 / tint = 50
 * Shade 500 is intentionally unused for filled surfaces that carry white
 * text - primary[500] only reaches 4.22:1 and error[500] only 3.76:1.
 */
export const semantic = {
  /** Surfaces, from the page backdrop up to the brand bar. */
  surface: {
    /** App backdrop behind every page. */
    page: colors.background.gray,
    /** Cards, tables, modals, popovers. */
    base: colors.background.light,
    /** Inset areas: table headers, filled inputs, collapse headers. */
    sunken: colors.neutral[50],
    /** Global header. */
    brand: colors.primary[700],
    /** Global header gradient end (kept as a single named pair). */
    brandGradientEnd: colors.primary[600],
  },

  /** Hairlines and dividers. */
  border: {
    subtle: colors.neutral[100],
    default: colors.neutral[200],
    strong: colors.neutral[300],
  },

  /** Text on light surfaces. `inverse` is for text on a filled brand surface. */
  text: {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    /** Placeholders and de-emphasized labels. 4.74:1 - do not lighten. */
    tertiary: colors.neutral[500],
    inverse: colors.text.inverse,
  },

  /**
   * Interactive fills. Only these two tones are allowed on a button.
   * Status colors below are for Tag / Alert / icons - never for buttons.
   */
  action: {
    primary: colors.primary[600],
    primaryHover: colors.primary[700],
    primaryActive: colors.primary[800],
    primaryTint: colors.primary[50],
    primaryBorder: colors.primary[300],

    danger: colors.error[600],
    dangerHover: colors.error[700],
    dangerActive: colors.error[800],
  },

  /** Non-interactive state colors: Tag, Alert, Badge, result icons. */
  status: {
    success: colors.success[600],
    /** Text-on-white variant of success. */
    successText: colors.success[700],
    warning: colors.secondary[600],
    warningText: colors.secondary[700],
    error: colors.error[600],
    info: colors.info[600],
  },

  /**
   * Meter (a ratio against a limit). One hue: length carries the ratio, so
   * lightness is free to carry confidence - `fillMuted` marks a value computed
   * from too few samples to trust.
   */
  meter: {
    track: colors.primary[100],
    fill: colors.primary[600],
    fillMuted: colors.primary[300],
    reference: colors.neutral[400],
  },

  /** Chart.js does not read the Ant Design theme, so it needs its own tokens. */
  chart: {
    line: colors.primary[600],
    /** Same hue as `line` at 12% alpha - keep it derived, not re-typed. */
    fill: `${colors.primary[600]}1F`,
    point: colors.primary[700],
    grid: colors.neutral[200],
  },

  /** Selected / active navigation items. */
  selected: {
    background: colors.primary[50],
    foreground: colors.primary[700],
  },

  /** Elevation. Keep the set small so cards stay on one scale. */
  shadow: {
    card: "0 1px 2px 0 rgba(23, 20, 31, 0.04), 0 1px 6px -1px rgba(23, 20, 31, 0.03)",
    raised: "0 4px 6px -1px rgba(23, 20, 31, 0.10), 0 2px 4px -2px rgba(23, 20, 31, 0.06)",
    header: "0 2px 8px rgba(23, 20, 31, 0.15)",
  },

  /** Corner radii, mirrored into the Ant Design theme. */
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
  },
} as const;
