/** Thu nhỏ ảnh dán vào ghi chú: tối đa 1600px cạnh dài, WebP ~0.85. Ảnh nhỏ sẵn thì giữ nguyên. */
export async function compressImage(file: Blob, maxEdge = 1600): Promise<Blob> {
  if (file.size < 300 * 1024 && /^image\/(png|jpeg|webp|gif)$/.test(file.type)) return file
  const bmp = await createImageBitmap(file)
  const k = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height))
  const w = Math.round(bmp.width * k), h = Math.round(bmp.height * k)
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, w, h); bmp.close()
  const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/webp', 0.85))
  return blob ?? file
}

/** Lấy file ảnh từ clipboard / drag-drop, nếu có */
export function imageFiles(dt: DataTransfer | null): File[] {
  if (!dt) return []
  return [...dt.files].filter(f => f.type.startsWith('image/'))
}
