export type ListingImageVariant = 'thumb' | 'card' | 'detail'

// Temporary cache version for Workers.dev: old URLs cached full-size originals.
// Revalidate the final-domain transformation path before removing or changing it.
const IMAGE_DELIVERY_VERSION = 'workers-dev-transform-2'

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
    return `/api/images/${variant}${url.pathname}?v=${IMAGE_DELIVERY_VERSION}`
  } catch {
    return source
  }
}
