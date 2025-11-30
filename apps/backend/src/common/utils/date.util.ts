/**
 * Parse ISO 8601 date string and extract local date/time components,
 * ignoring the timezone offset.
 *
 * This is useful when storing dates in MySQL DATETIME columns, which don't
 * preserve timezone information. By extracting the local time components,
 * we can store the exact time the user selected.
 *
 * @param isoString - ISO 8601 formatted date string (e.g., "2024-11-30T15:30:00+09:00")
 * @returns Date object with the local time components (timezone offset ignored)
 *
 * @example
 * // Input: "2024-11-30T15:30:00+09:00"
 * // Output: Date object representing 2024-11-30 15:30:00 (local time)
 * const date = parseIsoStringAsLocalTime("2024-11-30T15:30:00+09:00");
 */
export function parseIsoStringAsLocalTime(isoString: string): Date {
  // Extract date/time components using regex
  const match = isoString.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/,
  );

  if (!match) {
    // Fallback to standard Date parsing if regex doesn't match
    return new Date(isoString);
  }

  // Create Date object from extracted components
  return new Date(
    parseInt(match[1]), // year
    parseInt(match[2]) - 1, // month (0-indexed)
    parseInt(match[3]), // day
    parseInt(match[4]), // hour
    parseInt(match[5]), // minute
    parseInt(match[6]), // second
  );
}
