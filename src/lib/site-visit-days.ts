import { getWeeklyHolidayDays, isWeeklyHoliday, getHolidaysInRange } from '@/lib/holidays'

// How many calendar days in [start, end] (inclusive, both UTC-midnight) are
// NOT a weekly-off or ad-hoc holiday - i.e. how many site-visit-eligible
// days a project has had so far. Shared between the eligible-projects list
// (coarse progress count) and could be reused anywhere else that needs the
// same holiday-aware day count.
export async function countEligibleDays(start: Date, end: Date): Promise<number> {
  if (start > end) return 0

  const [weeklyHolidayDays, adHocHolidays] = await Promise.all([
    getWeeklyHolidayDays(),
    getHolidaysInRange(start, new Date(end.getTime() + 86400000)),
  ])
  const holidaySet = new Set(adHocHolidays.map((h: any) => h.date.toISOString().slice(0, 10)))

  let count = 0
  for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 86400000)) {
    const key = d.toISOString().slice(0, 10)
    if (holidaySet.has(key) || isWeeklyHoliday(d, weeklyHolidayDays)) continue
    count++
  }
  return count
}
