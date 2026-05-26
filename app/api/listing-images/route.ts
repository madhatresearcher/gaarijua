import { NextRequest, NextResponse } from 'next/server'
import { DeleteObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { auth } from '../../../auth'
import { getR2Client, hasR2Env, r2PublicUrl, R2_BUCKET } from '../../../lib/r2'

export const dynamic = 'force-dynamic'

const MAX_UPLOAD_FILES = 8
const MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024
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

function getSupportedImageExtension(file: File) {
  const mimeExtension = ALLOWED_IMAGE_MIME[file.type.toLowerCase()]
  if (mimeExtension) {
    return mimeExtension
  }
  const filenameExtension = file.name.split('.').pop()?.toLowerCase()
  if (filenameExtension && ALLOWED_IMAGE_EXTENSIONS.has(filenameExtension)) {
    return filenameExtension
  }
  return null
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
  if (!userId) {
    return NextResponse.json({ error: authError }, { status })
  }

  const formData = await request.formData()
  const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File)

  if (!files.length) {
    return NextResponse.json({ error: 'Select at least one image to upload.' }, { status: 400 })
  }
  if (files.length > MAX_UPLOAD_FILES) {
    return NextResponse.json({ error: `You can upload up to ${MAX_UPLOAD_FILES} images per listing.` }, { status: 400 })
  }

  const client = getR2Client()
  const uploadedKeys: string[] = []

  try {
    const uploads = await Promise.all(
      files.map(async (file) => {
        const extension = getSupportedImageExtension(file)
        if (!extension) {
          throw new Error(`${file.name}: unsupported format. Use JPG, PNG, WEBP, AVIF, HEIC, or HEIF.`)
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          throw new Error(`${file.name}: exceeds 12MB size limit.`)
        }

        const key = `cars/${userId}/${crypto.randomUUID()}.${extension}`
        const buffer = Buffer.from(await file.arrayBuffer())
        await client.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: file.type || `image/${extension}`,
            CacheControl: 'public, max-age=31536000, immutable',
          })
        )
        uploadedKeys.push(key)
        return { path: key, publicUrl: r2PublicUrl(key) }
      })
    )

    return NextResponse.json({ images: uploads })
  } catch (error) {
    if (uploadedKeys.length) {
      await client
        .send(
          new DeleteObjectsCommand({
            Bucket: R2_BUCKET,
            Delete: { Objects: uploadedKeys.map((Key) => ({ Key })) },
          })
        )
        .catch(() => undefined)
    }
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to upload photos.' },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const { userId, error: authError, status } = await requireUser()
  if (!userId) {
    return NextResponse.json({ error: authError }, { status })
  }

  const body = await request.json().catch(() => null)
  const paths = Array.isArray(body?.paths)
    ? body.paths.filter((path: unknown): path is string => typeof path === 'string')
    : []

  if (!paths.length) {
    return NextResponse.json({ error: 'No image paths provided.' }, { status: 400 })
  }

  const invalidPath = paths.find((path: string) => !path.startsWith(`cars/${userId}/`))
  if (invalidPath) {
    return NextResponse.json({ error: 'You can only remove your own uploaded images.' }, { status: 403 })
  }

  try {
    await getR2Client().send(
      new DeleteObjectsCommand({
        Bucket: R2_BUCKET,
        Delete: { Objects: paths.map((Key: string) => ({ Key })) },
      })
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Failed to remove images.' }, { status: 400 })
  }
}
