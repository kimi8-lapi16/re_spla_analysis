import type { ThemeConfig } from "antd";
import { colors } from "./colors";

/**
 * Ant Design theme configuration
 * Customizes Ant Design components with brand colors
 */
export const antdTheme: ThemeConfig = {
  token: {
    // Primary brand color (purple)
    colorPrimary: colors.primary[500],
    colorPrimaryHover: colors.primary[600],
    colorPrimaryActive: colors.primary[700],
    colorPrimaryBg: colors.primary[50],
    colorPrimaryBgHover: colors.primary[100],
    colorPrimaryBorder: colors.primary[300],

    // Secondary/Warning color (yellow)
    colorWarning: colors.secondary[500],
    colorWarningHover: colors.secondary[600],
    colorWarningActive: colors.secondary[700],
    colorWarningBg: colors.secondary[50],

    // Semantic colors
    colorSuccess: colors.success[500],
    colorSuccessHover: colors.success[600],
    colorSuccessActive: colors.success[700],

    colorError: colors.error[500],
    colorErrorHover: colors.error[600],
    colorErrorActive: colors.error[700],

    colorInfo: colors.info[500],
    colorInfoHover: colors.info[600],
    colorInfoActive: colors.info[700],

    // Text colors
    colorText: colors.text.primary,
    colorTextSecondary: colors.text.secondary,
    colorTextTertiary: colors.text.tertiary,

    // Background colors
    colorBgContainer: colors.background.light,
    colorBgElevated: colors.background.light,
    colorBgLayout: colors.background.gray,

    // Border colors
    colorBorder: colors.neutral[200],
    colorBorderSecondary: colors.neutral[100],

    // Typography
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,

    // Border radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // Spacing
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
  },

  components: {
    Button: {
      primaryShadow: "0 2px 0 rgba(139, 92, 246, 0.1)",
      defaultShadow: "0 2px 0 rgba(0, 0, 0, 0.02)",
      fontWeight: 500,
    },

    Input: {
      activeBorderColor: colors.primary[500],
      hoverBorderColor: colors.primary[400],
    },

    Card: {
      headerBg: colors.background.light,
      boxShadowTertiary:
        "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
    },

    Layout: {
      headerBg: colors.primary[700],
      headerColor: colors.text.inverse,
      headerHeight: 64,
      headerPadding: "0 24px",
    },

    Menu: {
      itemSelectedBg: colors.primary[50],
      itemSelectedColor: colors.primary[600],
      itemHoverBg: colors.primary[50],
      itemHoverColor: colors.primary[600],
    },

    Notification: {
      width: 384,
    },
  },
};
