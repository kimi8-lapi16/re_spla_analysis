import type { ThemeConfig } from "antd";
import { semantic } from "./semantic";

/**
 * Ant Design theme configuration.
 *
 * Every value here is derived from semantic.ts. Nothing in this file may be a
 * raw hex literal, and no component may re-declare a color that this theme
 * already owns - inline styles win over Ant Design's own hover/active/disabled
 * CSS, which silently removes those states.
 */
export const antdTheme: ThemeConfig = {
  token: {
    // Brand
    colorPrimary: semantic.action.primary,
    colorPrimaryHover: semantic.action.primaryHover,
    colorPrimaryActive: semantic.action.primaryActive,
    colorPrimaryBg: semantic.action.primaryTint,
    colorPrimaryBgHover: semantic.selected.background,
    colorPrimaryBorder: semantic.action.primaryBorder,

    // Status - Tag / Alert / Badge / icons. Not button fills.
    colorSuccess: semantic.status.success,
    colorWarning: semantic.status.warning,
    colorInfo: semantic.status.info,
    colorError: semantic.action.danger,
    colorErrorHover: semantic.action.dangerHover,
    colorErrorActive: semantic.action.dangerActive,

    // Text
    colorText: semantic.text.primary,
    colorTextSecondary: semantic.text.secondary,
    colorTextTertiary: semantic.text.tertiary,
    colorTextPlaceholder: semantic.text.tertiary,

    // Surfaces
    colorBgContainer: semantic.surface.base,
    colorBgElevated: semantic.surface.base,
    colorBgLayout: semantic.surface.page,

    // Borders
    colorBorder: semantic.border.default,
    colorBorderSecondary: semantic.border.subtle,

    // Typography
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,

    // Shape
    borderRadius: semantic.radius.md,
    borderRadiusLG: semantic.radius.lg,
    borderRadiusSM: semantic.radius.sm,

    // Control sizing
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
  },

  components: {
    Button: {
      fontWeight: 500,
      primaryShadow: "none",
      defaultShadow: "none",
      dangerShadow: "none",
    },

    Card: {
      headerBg: semantic.surface.base,
      boxShadowTertiary: semantic.shadow.card,
    },

    Layout: {
      headerBg: semantic.surface.brand,
      headerColor: semantic.text.inverse,
      headerHeight: 64,
      headerPadding: "0 24px",
      siderBg: semantic.surface.base,
      footerBg: semantic.surface.sunken,
      footerPadding: "12px 24px",
    },

    Menu: {
      itemSelectedBg: semantic.selected.background,
      itemSelectedColor: semantic.selected.foreground,
      itemHoverBg: semantic.selected.background,
      itemHoverColor: semantic.selected.foreground,
    },

    Notification: {
      width: 384,
    },
  },
};
