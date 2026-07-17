export type ListingImageVariant = 'thumb' | 'card' | 'detail'

/**
 * Sends R2-hosted vehicle photos through the Worker image route. External
 * images remain untouched so older listings keep working.
 */
export function listingImageUrl(source: string | null | undefined, variant: ListingImageVariant) {
  if (!source) return null

  try {
    const url = new URL(source)
    if (!url.hostname.endsWith('.r2.dev') || !url.pathname.startsWith('/cars/')) {
      return source
    }
    return `/api/images/${variant}${url.pathname}`
  } catch {
    return source
  }
}
