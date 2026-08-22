import { Input as AntInput } from "antd";

/**
 * Ant Design Input, re-exported under the project's base namespace.
 *
 * There is deliberately no wrapper. The previous one shadowed Ant Design v6's
 * `variant` prop with a custom one and applied colors inline, which made
 * `variant="filled" | "borderless" | "underlined"` unreachable and overrode the
 * themed focus/hover borders. Focus and hover colors now come from
 * `antdTheme.token.colorPrimary`.
 *
 * Import from here (not from "antd") so that if this component ever does need
 * project-specific behaviour, there is one place to add it.
 */
export const Input = AntInput;

export type { InputProps, InputRef } from "antd";
