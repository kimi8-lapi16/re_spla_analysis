import { Dayjs } from "dayjs";

/**
 * Convert a Dayjs object to an ISO string with JST timezone (+09:00)
 * Returns empty string if date is null/undefined
 */
export function formatDateTimeAsJstIso(date: Dayjs | null): string {
  if (!date) {
    return "";
  }
  const year = date.year();
  const month = String(date.month() + 1).padStart(2, "0");
  const day = String(date.date()).padStart(2, "0");
  const hour = String(date.hour()).padStart(2, "0");
  const minute = String(date.minute()).padStart(2, "0");
  const second = String(date.second()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+09:00`;
}
