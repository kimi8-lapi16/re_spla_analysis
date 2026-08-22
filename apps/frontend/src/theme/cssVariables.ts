import { semantic } from "./semantic";

/**
 * CSS custom properties derived from the semantic tokens.
 *
 * Plain CSS (index.css, base.css) cannot import TypeScript, so without this
 * the palette would have to be transcribed into `:root` by hand - which is
 * exactly how the two copies drift apart. Generating them keeps semantic.ts
 * the only place a color is written down.
 *
 * Call `applyThemeCssVariables()` synchronously at app startup, before render.
 */
const cssVariables: Record<string, string> = {
  "--app-surface-page": semantic.surface.page,
  "--app-surface-base": semantic.surface.base,
  "--app-surface-sunken": semantic.surface.sunken,
  "--app-surface-brand": semantic.surface.brand,
  "--app-surface-brand-gradient-end": semantic.surface.brandGradientEnd,

  "--app-border-subtle": semantic.border.subtle,
  "--app-border-default": semantic.border.default,
  "--app-border-strong": semantic.border.strong,

  "--app-text-primary": semantic.text.primary,
  "--app-text-secondary": semantic.text.secondary,
  "--app-text-tertiary": semantic.text.tertiary,
  "--app-text-inverse": semantic.text.inverse,

  "--app-action-primary": semantic.action.primary,
  "--app-action-primary-hover": semantic.action.primaryHover,
  "--app-action-primary-active": semantic.action.primaryActive,
  "--app-action-primary-tint": semantic.action.primaryTint,
  "--app-action-primary-border": semantic.action.primaryBorder,

  "--app-shadow-card": semantic.shadow.card,
  "--app-shadow-raised": semantic.shadow.raised,
  "--app-shadow-header": semantic.shadow.header,

  "--app-radius-sm": `${semantic.radius.sm}px`,
  "--app-radius-md": `${semantic.radius.md}px`,
  "--app-radius-lg": `${semantic.radius.lg}px`,
};

export function applyThemeCssVariables(root: HTMLElement = document.documentElement): void {
  for (const [name, value] of Object.entries(cssVariables)) {
    root.style.setProperty(name, value);
  }
}
