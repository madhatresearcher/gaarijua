export type UploadedListingImage = {
  path: string
  publicUrl: string
}

function uploadOneListingImage(
  file: File,
  onProgress: (loaded: number) => void
): Promise<UploadedListingImage> {
  const formData = new FormData()
  formData.append('files', file)

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', '/api/listing-images')
    request.responseType = 'json'
    request.upload.addEventListener('progress', (event) => {
      onProgress(event.lengthComputable ? event.loaded : Math.min(file.size, event.loaded))
    })
    request.addEventListener('error', () => reject(new Error('Failed to upload ' + file.name + '.')))
    request.addEventListener('load', () => {
      const body = request.response as { images?: UploadedListingImage[]; error?: string } | null
      if (request.status < 200 || request.status >= 300 || !body?.images?.[0]) {
        reject(new Error(typeof body?.error === 'string' ? body.error : 'Failed to upload ' + file.name + '.'))
        return
      }
      onProgress(file.size)
      resolve(body.images[0])
    })
    request.send(formData)
  })
}

export async function uploadListingImages(
  files: File[],
  onProgress?: (loaded: number, total: number) => void
): Promise<UploadedListingImage[]> {
  const total = files.reduce((sum, file) => sum + file.size, 0)
  const uploaded: UploadedListingImage[] = []
  let completedBytes = 0

  for (const file of files) {
    const image = await uploadOneListingImage(file, (loaded) => onProgress?.(completedBytes + loaded, total))
    uploaded.push(image)
    completedBytes += file.size
    onProgress?.(completedBytes, total)
  }

  return uploaded
}
