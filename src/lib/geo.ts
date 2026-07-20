const EARTH_RADIUS_METERS = 6371000

// How close a check-in/check-out photo's GPS coordinates must be to the
// project's site coordinates to count as "On Site" rather than "Off Site".
export const SITE_RADIUS_METERS = 100

export function haversineDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** null means "can't tell" — the project has no site coordinates on file. */
export function siteStatus(
  photoLat: number | null | undefined,
  photoLng: number | null | undefined,
  siteLat: number | null | undefined,
  siteLng: number | null | undefined
): { onSite: boolean | null; distanceMeters: number | null } {
  if (photoLat == null || photoLng == null || siteLat == null || siteLng == null) {
    return { onSite: null, distanceMeters: null }
  }
  const distance = haversineDistanceMeters(photoLat, photoLng, siteLat, siteLng)
  return { onSite: distance <= SITE_RADIUS_METERS, distanceMeters: Math.round(distance) }
}
