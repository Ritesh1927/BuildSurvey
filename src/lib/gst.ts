import { db } from '@/lib/db'

export const DEFAULT_GST_RATE = 18

export async function getGstRate(): Promise<number> {
  try {
    const setting = await db.setting.findUnique({ where: { key: 'gstRate' } })
    const parsed = setting && !setting.isDeleted ? parseFloat(setting.value) : NaN
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_GST_RATE
  } catch {
    return DEFAULT_GST_RATE
  }
}
