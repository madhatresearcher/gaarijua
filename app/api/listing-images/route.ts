import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../auth'
import { createR2UploadUrl, hasR2UploadCredentials } from '../../../lib/r2-upload'
import { getR2Bucket, hasR2Env, r2PublicUrl } from '../../../lib/r2'

export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024
const ALLOWED_IMAGE_MIME: Record<string, { extension: string; contentType: string }> = {
  'image/jpeg': { extension: 'jpg', contentType: 'image/jpeg' },
  'image/jpg': { extension: 'jpg', contentType: 'image/jpeg' },
  'image/png': { extension: 'png', contentType: 'image/png' },
  'image/webp': { extension: 'webp', contentType: 'image/webp' },
  'image/avif': { extension: 'avif', contentType: 'image/avif' },
  'image/heic': { extension: 'heic', contentType: 'image/heic' },
  'image/heif': { extension: 'heif', contentType: 'image/heif' },
}
const ALLOWED_IMAGE_EXTENSIONS: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  heic: 'image/heic',
  heif: 'image/heif',
}

type UploadMetadata = { name: string; type: string; size: number }

type SupportedImage = { extension: string; contentType: string }

function getSupportedImage(file: UploadMetadata): SupportedImage | null {
  const byMime = ALLOWED_IMAGE_MIME[file.type.toLowerCase()]
  if (byMime) return byMime

  const extension = file.name.split('.').pop()?.toLowerCase()
  const contentType = extension ? ALLOWED_IMAGE_EXTENSIONS[extension] : undefined
  return extension && contentType ? { extension, contentType } : null
}

async function getUploadMetadata(request: NextRequest): Promise<UploadMetadata | null> {
  const body = await request.json().catch(() => null)
  if (!body || typeof body.name !== 'string' || typeof body.type !== 'string' || typeof body.size !== 'number') return null

  const name = body.name.trim()
  if (!name || name.length > 255 || !Number.isFinite(body.size) || body.size <= 0) return null
  return { name, type: body.type.split(';', 1)[0].toLowerCase(), size: body.size }
}

async function requireUser(needsUploadCredentials = false) {
  if (needsUploadCredentials ? !hasR2UploadCredentials() : !hasR2Env()) {
    return { userId: null, error: 'Image uploads are not configured on this deployment yet.', status: 500 as const }
  }
  const session = await auth()
  if (!session?.user?.id) {
    return { userId: null, error: 'Your session is no longer valid. Sign in again and retry.', status: 401 as const }
  }
  return { userId: session.user.id, error: null, status: 200 as const }
}

export async function POST(request: NextRequest) {
  const { userId, error: authError, status } = await requireUser(true)
  if (!userId) return NextResponse.json({ error: authError }, { status })

  const metadata = await getUploadMetadata(request)
  if (!metadata) return NextResponse.json({ error: 'Select one image to upload.' }, { status: 400 })
  if (metadata.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: metadata.name + ': exceeds 15MB size limit.' }, { status: 400 })
  }

  const image = getSupportedImage(metadata)
  if (!image) {
    return NextResponse.json({ error: metadata.name + ': unsupported format. Use JPG, PNG, WEBP, AVIF, HEIC, or HEIF.' }, { status: 400 })
  }

  const key = 'cars/' + userId + '/' + crypto.randomUUID() + '.' + image.extension
  try {
    const uploadUrl = await createR2UploadUrl({ key, contentType: image.contentType })
    return NextResponse.json({
      image: {
        path: key,
        publicUrl: r2PublicUrl(key),
        uploadUrl,
        contentType: image.contentType,
      },
    })
  } catch (error) {
    console.error('Failed to create listing-image upload URL', error)
    return NextResponse.json({ error: 'Failed to prepare photo upload. Please retry.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { userId, error: authError, status } = await requireUser()
  if (!userId) return NextResponse.json({ error: authError }, { status })

  const body = await request.json().catch(() => null)
  const paths = Array.isArray(body?.paths)
    ? body.paths.filter((path: unknown): path is string => typeof path === 'string')
    : []

  if (!paths.length) return NextResponse.json({ error: 'No image paths provided.' }, { status: 400 })

  const invalidPath = paths.find((path: string) => !path.startsWith('cars/' + userId + '/'))
  if (invalidPath) return NextResponse.json({ error: 'You can only remove your own uploaded images.' }, { status: 403 })

  const bucket = getR2Bucket()
  if (!bucket) {
    return NextResponse.json({ error: 'Image uploads are not configured on this deployment yet.' }, { status: 500 })
  }

  try {
    await bucket.delete(paths)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Failed to remove images.' }, { status: 400 })
  }
}
