import { db } from '@/lib/db'

// 0 = Sunday ... 6 = Saturday, matching Date#getUTCDay().
export const DEFAULT_WEEKLY_HOLIDAY_DAYS = [0]

export async function getWeeklyHolidayDays(): Promise<number[]> {
  try {
    const setting = await db.setting.findUnique({ where: { key: 'weeklyHolidayDays' } })
    if (!setting || setting.isDeleted || setting.value === '') return DEFAULT_WEEKLY_HOLIDAY_DAYS
    const days = setting.value.split(',').map((d: string) => parseInt(d, 10)).filter((d: number) => Number.isInteger(d) && d >= 0 && d <= 6)
    return days
  } catch {
    return DEFAULT_WEEKLY_HOLIDAY_DAYS
  }
}

export function isWeeklyHoliday(date: Date, weeklyHolidayDays: number[]): boolean {
  return weeklyHolidayDays.includes(date.getUTCDay())
}

export async function getHolidaysInRange(start: Date, end: Date) {
  return db.holiday.findMany({
    where: { isDeleted: false, date: { gte: start, lt: end } },
    select: { date: true, name: true },
    orderBy: { date: 'asc' },
  })
}
