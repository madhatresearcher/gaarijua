import { NextRequest, NextResponse } from 'next/server'
import { hasR2Env, r2PublicUrl } from '../../../../../lib/r2'

export const dynamic = 'force-dynamic'

const VARIANTS = {
  thumb: { width: 256, height: 256, quality: 70 },
  card: { width: 640, height: 480, quality: 75 },
  detail: { width: 1440, height: 1080, quality: 82 },
} as const

type ImageVariant = keyof typeof VARIANTS
type CloudflareImageRequestInit = RequestInit & {
  cf: { image: { fit: 'cover'; width: number; height: number; quality: number; format: 'avif' | 'webp' | 'jpeg' } }
}

function isImageVariant(value: string): value is ImageVariant {
  return value in VARIANTS
}

function selectFormat(accept: string | null): 'avif' | 'webp' | 'jpeg' {
  if (accept?.includes('image/avif')) return 'avif'
  if (accept?.includes('image/webp')) return 'webp'
  return 'jpeg'
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ variant: string; key: string[] }> }
) {
  const { variant, key: keyParts } = await context.params
  const key = keyParts.join('/')
  if (!isImageVariant(variant) || !key.startsWith('cars/') || key.includes('..')) {
    return NextResponse.json({ error: 'Image not found.' }, { status: 404 })
  }
  if (!hasR2Env()) {
    return NextResponse.json({ error: 'Image delivery is not configured.' }, { status: 503 })
  }

  const preset = VARIANTS[variant]
  const source = r2PublicUrl(key)

  // Temporary Workers.dev delivery path. Re-verify this transform after the
  // final custom domain is attached before treating image delivery as final.
  const sourceRequest = new Request(source, {
    headers: {
      Accept: request.headers.get('accept') || 'image/avif,image/webp,image/*,*/*;q=0.8',
    },
  })
  const response = await fetch(sourceRequest, {
    cf: {
      image: {
        fit: 'cover',
        ...preset,
        format: selectFormat(request.headers.get('accept')),
      },
    },
  } as CloudflareImageRequestInit)

  if (!response.ok && response.status !== 304) {
    return new NextResponse(null, { status: response.status })
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': response.headers.get('content-type') || 'image/jpeg',
      Vary: 'Accept',
    },
  })
}
