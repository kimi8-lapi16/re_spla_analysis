import type { DefaultOptionType } from "antd/es/select";

export type SelectOption = { label: string; value: number };

/**
 * Puts the most recently used entries at the top of a long select.
 *
 * There are 172 weapons and 23 stages in the master data, but one player uses a
 * handful of each. Without this, every entry costs a scroll or a search even
 * when the answer is the same as last time.
 *
 * Returns Ant Design's own option type so that the flat and grouped shapes are
 * one array type - a union of the two makes `Select` unable to infer its value.
 */
export function withRecentFirst(
  options: SelectOption[],
  recentIds: number[],
  labels: { recent: string; all: string }
): DefaultOptionType[] {
  if (recentIds.length === 0 || options.length === 0) {
    return options;
  }

  const byValue = new Map(options.map((option) => [option.value, option]));
  const recent = recentIds
    .map((id) => byValue.get(id))
    .filter((option): option is SelectOption => option !== undefined);

  if (recent.length === 0) {
    return options;
  }

  const recentValues = new Set(recent.map((option) => option.value));

  return [
    { label: labels.recent, options: recent },
    { label: labels.all, options: options.filter((o) => !recentValues.has(o.value)) },
  ];
}
