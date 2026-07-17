import { AwsClient } from 'aws4fetch'
import { R2_BUCKET } from './r2'

const UPLOAD_URL_TTL_SECONDS = 5 * 60

function required(name: 'R2_ACCOUNT_ID' | 'R2_ACCESS_KEY_ID' | 'R2_SECRET_ACCESS_KEY') {
  return process.env[name]?.trim() || null
}

function encodeR2Key(key: string) {
  return key.split('/').map(encodeURIComponent).join('/')
}

export function hasR2UploadCredentials() {
  return Boolean(
    process.env.R2_PUBLIC_BASE_URL &&
      required('R2_ACCOUNT_ID') &&
      required('R2_ACCESS_KEY_ID') &&
      required('R2_SECRET_ACCESS_KEY')
  )
}

export async function createR2UploadUrl({ key, contentType }: { key: string; contentType: string }) {
  const accountId = required('R2_ACCOUNT_ID')
  const accessKeyId = required('R2_ACCESS_KEY_ID')
  const secretAccessKey = required('R2_SECRET_ACCESS_KEY')
  if (!accountId || !accessKeyId || !secretAccessKey) throw new Error('R2 upload credentials are missing.')

  const client = new AwsClient({ accessKeyId, secretAccessKey, service: 's3', region: 'auto' })
  const url = `https://${R2_BUCKET}.${accountId}.r2.cloudflarestorage.com/${encodeR2Key(key)}?X-Amz-Expires=${UPLOAD_URL_TTL_SECONDS}`
  const signed = await client.sign(url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    aws: { signQuery: true, allHeaders: true },
  })
  return signed.url
}
