import { getCloudflareContext } from '@opennextjs/cloudflare'

export const R2_BUCKET = process.env.R2_BUCKET || 'car-images'
const R2_PUBLIC_BASE_URL = (process.env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '')

// The R2 bucket is exposed to the Worker as a binding (see wrangler.toml).
// Using the binding avoids pulling the AWS S3 SDK (and its Node fs/http
// dependencies) into the Worker runtime, which Cloudflare doesn't support.
export function getR2Bucket(): R2BucketLike | null {
  try {
    const { env } = getCloudflareContext()
    return ((env as Record<string, unknown>).CAR_IMAGES as R2BucketLike | undefined) ?? null
  } catch {
    return null
  }
}

export function hasR2Env() {
  return Boolean(R2_PUBLIC_BASE_URL) && Boolean(getR2Bucket())
}

export function r2PublicUrl(key: string) {
  return `${R2_PUBLIC_BASE_URL}/${key}`
}

// Minimal shape of the Cloudflare R2 binding we use, to avoid a hard
// dependency on @cloudflare/workers-types in app code.
type R2BucketLike = {
  put: (
    key: string,
    value: ArrayBuffer | ArrayBufferView | ReadableStream | string | Blob,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } }
  ) => Promise<unknown>
  delete: (keys: string | string[]) => Promise<void>
}
