import { db } from '@/lib/db'

export interface OfficeLocation {
  latitude: number | null
  longitude: number | null
}

export async function getOfficeLocation(): Promise<OfficeLocation> {
  try {
    const [latSetting, lngSetting] = await Promise.all([
      db.setting.findUnique({ where: { key: 'officeLatitude' } }),
      db.setting.findUnique({ where: { key: 'officeLongitude' } }),
    ])
    const lat = latSetting && !latSetting.isDeleted ? parseFloat(latSetting.value) : NaN
    const lng = lngSetting && !lngSetting.isDeleted ? parseFloat(lngSetting.value) : NaN
    return {
      latitude: Number.isFinite(lat) ? lat : null,
      longitude: Number.isFinite(lng) ? lng : null,
    }
  } catch {
    return { latitude: null, longitude: null }
  }
}
