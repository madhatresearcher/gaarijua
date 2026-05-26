import { S3Client } from '@aws-sdk/client-s3'

const accountId = process.env.R2_ACCOUNT_ID || ''
const accessKeyId = process.env.R2_ACCESS_KEY_ID || ''
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || ''

export const R2_BUCKET = process.env.R2_BUCKET || 'car-images'
const R2_PUBLIC_BASE_URL = (process.env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '')

export function hasR2Env() {
  return Boolean(accountId && accessKeyId && secretAccessKey && R2_BUCKET && R2_PUBLIC_BASE_URL)
}

let cached: S3Client | null = null

export function getR2Client() {
  if (!hasR2Env()) {
    throw new Error('Missing Cloudflare R2 environment variables.')
  }
  if (!cached) {
    cached = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    })
  }
  return cached
}

export function r2PublicUrl(key: string) {
  return `${R2_PUBLIC_BASE_URL}/${key}`
}
