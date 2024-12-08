import { format } from "date-fns";

/**
 * その月の最初の日と最後の日を返す
 * 
 * @param yearMonth 
 * @returns 
 */
export function createStartAndEndDayInYearMonth(yearMonth: string): { startDay: Date, endDay: Date } {
  const year = parseInt(yearMonth.slice(0, 4));
  const month = parseInt(yearMonth.slice(4, 6));
  const startDay = new Date(year, month - 1, 1);
  const endDay = new Date(year, month, 0);
  return { startDay, endDay };
}

/**
 * 引数の文字列が年月として適切か判定する
 * 
 * @param yearMonth 
 * @returns true when yearMonth is invalid, false when yearMonth is valid
 */
export function isInvalidYearMonth(yearMonth: string) {
  if (yearMonth.length != 6) return true;
  const year = parseInt(yearMonth.slice(0, 4));
  const month = parseInt(yearMonth.slice(4, 6));
  if (isNaN(year) || isNaN(month)) return true;
  return isNaN(Date.parse(yearMonth));
}

/**
 * 引数の文字列が日付として適切か判定する
 * 
 * @param selectDate 
 * @returns true when selectDate is invalid, false when selectDate is valid
 */
export function isInvalidDate(selectDate: string) {
  if (selectDate.length != 8) return true;
  const year = parseInt(selectDate.slice(0, 4));
  const month = parseInt(selectDate.slice(4, 6));
  const day = parseInt(selectDate.slice(6, 8));
  if (isNaN(year) || isNaN(month) || isNaN(day)) return true;
  return isNaN(Date.parse(generateLocalizedDate(year, month, day)));
}

/**
 * yyyy-MM-dd形式にフォーマットした日付を返す
 * ※月と日に関しては0パディング
 * @param year 年
 * @param month 月
 * @param day 日
 * @returns
 */
export function generateLocalizedDate(
  year: number,
  month: number,
  day: number
): string {
  // 月と日は2桁に揃えるため、1桁の場合には0を追加
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;

}

/**
 * その月の全ての日を返す
 * @param yearMonth 年月 
 * @returns 
 */
export function createAllDateInYearMonth(yearMonth: string) {
  const dates = [];
  const { startDay, endDay } = createStartAndEndDayInYearMonth(yearMonth);
  for (let day = 1; day <= endDay.getDate(); day++) {
    startDay.setDate(day);
    dates.push(format(new Date(startDay), "yyyy-MM-dd"));
  }
  return dates;
}
