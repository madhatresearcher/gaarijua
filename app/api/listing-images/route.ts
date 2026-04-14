import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabase-admin'

const CAR_IMAGE_BUCKET = 'car_images'
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

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get('authorization') || ''
  if (!authorization.startsWith('Bearer ')) {
    return null
  }
  return authorization.slice('Bearer '.length).trim() || null
}

async function getAuthenticatedUser(request: NextRequest) {
  const token = getBearerToken(request)
  if (!token) {
    return { user: null, error: 'Missing authorization token.' }
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token)

  if (error || !user) {
    return { user: null, error: 'Your session is no longer valid. Sign in again and retry.' }
  }

  return { user, error: null }
}

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

export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: authError }, { status: 401 })
  }

  const formData = await request.formData()
  const files = formData
    .getAll('files')
    .filter((entry): entry is File => entry instanceof File)

  if (!files.length) {
    return NextResponse.json({ error: 'Select at least one image to upload.' }, { status: 400 })
  }

  if (files.length > MAX_UPLOAD_FILES) {
    return NextResponse.json({ error: `You can upload up to ${MAX_UPLOAD_FILES} images per listing.` }, { status: 400 })
  }

  const uploadedPaths: string[] = []

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

        const filePath = `cars/${user.id}/${crypto.randomUUID()}.${extension}`
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        const { data, error } = await supabaseAdmin.storage
          .from(CAR_IMAGE_BUCKET)
          .upload(filePath, fileBuffer, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type || `image/${extension}`,
          })

        if (error) {
          throw new Error(error.message)
        }

        uploadedPaths.push(data.path)
        const { data: urlData } = supabaseAdmin.storage.from(CAR_IMAGE_BUCKET).getPublicUrl(data.path)
        return { path: data.path, publicUrl: urlData.publicUrl }
      })
    )

    return NextResponse.json({ images: uploads })
  } catch (error) {
    if (uploadedPaths.length) {
      await supabaseAdmin.storage.from(CAR_IMAGE_BUCKET).remove(uploadedPaths)
    }

    return NextResponse.json(
      { error: (error as Error).message || 'Failed to upload photos.' },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: authError }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const paths = Array.isArray(body?.paths) ? body.paths.filter((path: unknown): path is string => typeof path === 'string') : []

  if (!paths.length) {
    return NextResponse.json({ error: 'No image paths provided.' }, { status: 400 })
  }

  const invalidPath = paths.find((path: string) => !path.startsWith(`cars/${user.id}/`))
  if (invalidPath) {
    return NextResponse.json({ error: 'You can only remove your own uploaded images.' }, { status: 403 })
  }

  const { error } = await supabaseAdmin.storage.from(CAR_IMAGE_BUCKET).remove(paths)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
