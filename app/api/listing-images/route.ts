import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../auth'
import { getR2Bucket, hasR2Env, r2PublicUrl } from '../../../lib/r2'

export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024
const ALLOWED_IMAGE_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/heic': 'heic',
  'image/heif': 'heif',
}
const ALLOWED_IMAGE_EXTENSIONS = new Set(Object.values(ALLOWED_IMAGE_MIME))

type UploadMetadata = { name: string; type: string }

function getSupportedImageExtension(file: UploadMetadata) {
  const mimeExtension = ALLOWED_IMAGE_MIME[file.type.toLowerCase()]
  if (mimeExtension) return mimeExtension

  const filenameExtension = file.name.split('.').pop()?.toLowerCase()
  if (filenameExtension && ALLOWED_IMAGE_EXTENSIONS.has(filenameExtension)) return filenameExtension
  return null
}

function getUploadMetadata(request: NextRequest): UploadMetadata | null {
  const encodedName = request.headers.get('x-listing-image-name')
  if (!encodedName) return null

  try {
    const name = decodeURIComponent(encodedName)
    if (!name || name.length > 255) return null
    return { name, type: request.headers.get('content-type')?.split(';', 1)[0].toLowerCase() || '' }
  } catch {
    return null
  }
}

function limitUploadStream(stream: ReadableStream<Uint8Array>) {
  let uploadedBytes = 0
  return stream.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        uploadedBytes += chunk.byteLength
        if (uploadedBytes > MAX_FILE_SIZE_BYTES) {
          controller.error(new Error('Photo exceeds the 15MB size limit.'))
          return
        }
        controller.enqueue(chunk)
      },
    })
  )
}

async function requireUser() {
  if (!hasR2Env()) {
    return { userId: null, error: 'Image uploads are not configured on this deployment yet.', status: 500 as const }
  }
  const session = await auth()
  if (!session?.user?.id) {
    return { userId: null, error: 'Your session is no longer valid. Sign in again and retry.', status: 401 as const }
  }
  return { userId: session.user.id, error: null, status: 200 as const }
}

export async function POST(request: NextRequest) {
  const { userId, error: authError, status } = await requireUser()
  if (!userId) return NextResponse.json({ error: authError }, { status })

  const metadata = getUploadMetadata(request)
  if (!metadata || !request.body) {
    return NextResponse.json({ error: 'Select one image to upload.' }, { status: 400 })
  }

  const extension = getSupportedImageExtension(metadata)
  if (!extension) {
    return NextResponse.json({ error: metadata.name + ': unsupported format. Use JPG, PNG, WEBP, AVIF, HEIC, or HEIF.' }, { status: 400 })
  }

  const declaredSize = Number(request.headers.get('content-length'))
  if (Number.isFinite(declaredSize) && declaredSize > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: metadata.name + ': exceeds 15MB size limit.' }, { status: 400 })
  }

  const bucket = getR2Bucket()
  if (!bucket) {
    return NextResponse.json({ error: 'Image uploads are not configured on this deployment yet.' }, { status: 500 })
  }

  const key = 'cars/' + userId + '/' + crypto.randomUUID() + '.' + extension
  try {
    await bucket.put(key, limitUploadStream(request.body), {
      httpMetadata: {
        contentType: metadata.type || 'image/' + extension,
        cacheControl: 'public, max-age=31536000, immutable',
      },
    })
    return NextResponse.json({ image: { path: key, publicUrl: r2PublicUrl(key) } })
  } catch (error) {
    await bucket.delete(key).catch(() => undefined)
    return NextResponse.json({ error: (error as Error).message || 'Failed to upload photo.' }, { status: 400 })
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
