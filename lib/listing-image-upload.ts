export type UploadedListingImage = {
  path: string
  publicUrl: string
}

type PreparedListingImage = UploadedListingImage & {
  uploadUrl: string
  contentType: string
}

const MAX_CONCURRENT_UPLOADS = 2

async function prepareListingImage(file: File): Promise<PreparedListingImage> {
  const response = await fetch('/api/listing-images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: file.name, type: file.type, size: file.size }),
  })
  const body = (await response.json().catch(() => null)) as { image?: PreparedListingImage; error?: string } | null
  if (!response.ok || !body?.image) {
    throw new Error(typeof body?.error === 'string' ? body.error : 'Failed to prepare upload for ' + file.name + '.')
  }
  return body.image
}

function uploadToR2(
  file: File,
  image: PreparedListingImage,
  onProgress: (loaded: number) => void
): Promise<UploadedListingImage> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('PUT', image.uploadUrl)
    request.setRequestHeader('Content-Type', image.contentType)
    request.upload.addEventListener('progress', (event) => {
      onProgress(event.lengthComputable ? event.loaded : Math.min(file.size, event.loaded))
    })
    request.addEventListener('error', () => reject(new Error('Failed to upload ' + file.name + '.')))
    request.addEventListener('load', () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error('Failed to upload ' + file.name + '.'))
        return
      }
      onProgress(file.size)
      resolve({ path: image.path, publicUrl: image.publicUrl })
    })
    request.send(file)
  })
}

async function uploadSingleImage(
  file: File,
  onProgress: (loaded: number) => void
): Promise<UploadedListingImage> {
  const image = await prepareListingImage(file)
  return uploadToR2(file, image, onProgress)
}

export async function uploadListingImages(
  files: File[],
  onProgress?: (loaded: number, total: number) => void
): Promise<UploadedListingImage[]> {
  if (!files.length) return []

  const total = files.reduce((sum, file) => sum + file.size, 0)
  const progress = files.map(() => 0)
  const uploads: UploadedListingImage[] = new Array(files.length)
  let nextIndex = 0

  const updateProgress = (index: number, loaded: number) => {
    progress[index] = Math.min(files[index].size, loaded)
    onProgress?.(progress.reduce((sum, value) => sum + value, 0), total)
  }

  const worker = async () => {
    while (true) {
      const index = nextIndex++
      if (index >= files.length) return
      uploads[index] = await uploadSingleImage(files[index], (loaded) => updateProgress(index, loaded))
    }
  }

  await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENT_UPLOADS, files.length) }, worker))
  return uploads
}
