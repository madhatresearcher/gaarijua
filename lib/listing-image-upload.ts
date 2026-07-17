export type UploadedListingImage = {
  path: string
  publicUrl: string
}

const MAX_CONCURRENT_UPLOADS = 2

function uploadSingleImage(
  file: File,
  onProgress: (loaded: number) => void
): Promise<UploadedListingImage> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', '/api/listing-images')
    request.responseType = 'json'
    request.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    request.setRequestHeader('X-Listing-Image-Name', encodeURIComponent(file.name))
    request.upload.addEventListener('progress', (event) => {
      onProgress(event.lengthComputable ? event.loaded : Math.min(file.size, event.loaded))
    })
    request.addEventListener('error', () => reject(new Error('Failed to upload ' + file.name + '.')))
    request.addEventListener('load', () => {
      const body = request.response as { image?: UploadedListingImage; error?: string } | null
      if (request.status < 200 || request.status >= 300 || !body?.image) {
        reject(new Error(typeof body?.error === 'string' ? body.error : 'Failed to upload ' + file.name + '.'))
        return
      }
      onProgress(file.size)
      resolve(body.image)
    })
    request.send(file)
  })
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
