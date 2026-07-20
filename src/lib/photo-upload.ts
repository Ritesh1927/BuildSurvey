const MAX_PHOTO_BYTES = 8 * 1024 * 1024 // 8MB
const DATA_URL_PATTERN = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/

/**
 * Accepts a base64 data URL (what browser camera capture produces) and
 * returns a URL to store on the Photo record.
 *
 * Prototype-phase behavior: stores the data URL directly (zero external
 * setup — fine for a handful of demo photos, not for production scale).
 * If BLOB_READ_WRITE_TOKEN is ever set, uploads to Vercel Blob instead and
 * returns a real hosted URL — same call site, no other code changes needed
 * when the project settles on a real storage provider.
 */
export async function uploadPhotoDataUrl(dataUrl: string, pathPrefix: string): Promise<string> {
  const match = DATA_URL_PATTERN.exec(dataUrl)
  if (!match) {
    throw new Error('Photo must be a base64 JPEG, PNG, or WebP data URL')
  }
  const [, mimeType, base64] = match
  const buffer = Buffer.from(base64, 'base64')
  if (buffer.byteLength > MAX_PHOTO_BYTES) {
    throw new Error('Photo exceeds the 8MB size limit')
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return dataUrl
  }

  const { put } = await import('@vercel/blob')
  const extension = mimeType.split('/')[1]
  const filename = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`

  const blob = await put(filename, buffer, {
    access: 'public',
    contentType: mimeType,
  })

  return blob.url
}
