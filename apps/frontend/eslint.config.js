import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

/**
 * Design system guardrails.
 *
 * These two rules exist because of a concrete bug: the old custom Button wrote
 * `backgroundColor` inline, which beat Ant Design's hover/active/disabled CSS
 * and silently discarded the caller's own `style`. Colors belong in
 * src/theme/semantic.ts and reach components through antdTheme or the
 * `--app-*` CSS custom properties - never as a literal in a component.
 */
const COLOR_LITERAL_MESSAGE =
  "色を直接書かないでください。src/theme/semantic.ts のトークンか、--app-* の CSS 変数を使ってください。";

const noColorLiterals = [
  {
    selector: "Literal[value=/#[0-9a-fA-F]{3,8}(\\b|$)/]",
    message: COLOR_LITERAL_MESSAGE,
  },
  {
    selector: "TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}(\\b|$)/]",
    message: COLOR_LITERAL_MESSAGE,
  },
  {
    selector: "Literal[value=/\\b(rgba?|hsla?)\\(/]",
    message: COLOR_LITERAL_MESSAGE,
  },
  {
    selector: "TemplateElement[value.raw=/\\b(rgba?|hsla?)\\(/]",
    message: COLOR_LITERAL_MESSAGE,
  },
];

const restrictedAntdImports = {
  paths: [
    {
      name: "antd",
      importNames: ["Button", "Card", "Input"],
      message:
        "src/components/base の Button / Card / Input を使ってください（intent・tone のプリセットが適用されます）。",
    },
  ],
};

export default defineConfig([
  // Generated from the backend OpenAPI schema - not hand-edited, not linted.
  globalIgnores(["dist", "src/api"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "no-restricted-syntax": ["error", ...noColorLiterals],
      "no-restricted-imports": ["error", restrictedAntdImports],
    },
  },
  {
    // The palette and the semantic token map are where colors are defined.
    files: ["src/theme/colors.ts", "src/theme/semantic.ts"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  {
    // The base components are the wrappers everyone else must import.
    files: ["src/components/base/*.tsx", "src/components/base/*.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
]);
