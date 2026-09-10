// Direct browser → Cloudinary upload using an unsigned preset.
// No secrets in the bundle: cloud name + unsigned preset are public by design.
// Setup (one time):
//   1. Free account at https://cloudinary.com → Dashboard → copy "Cloud name"
//   2. Settings → Upload → Upload presets → Add → Signing Mode = Unsigned
//      → name it e.g. "styleverse" → Save → copy the preset name
//   3. Put both in admin/.env (see .env.example):
//        VITE_CLOUDINARY_CLOUD_NAME=xxxx
//        VITE_CLOUDINARY_UPLOAD_PRESET=styleverse
// If either is missing, the form falls back to URL-only input.

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''

export const isCloudinaryConfigured = () => !!(CLOUD_NAME && UPLOAD_PRESET)

export async function uploadImage(file, { folder = 'styleverse/products' } = {}) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Image upload is not configured (missing Cloudinary env vars)')
  }
  if (!file?.type?.startsWith('image/')) {
    throw new Error('Please choose an image file')
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image must be under 10 MB')
  }
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', UPLOAD_PRESET)
  form.append('folder', folder)
  let res
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: form
    })
  } catch {
    throw new Error('Upload failed — check your internet connection')
  }
  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.secure_url) {
    throw new Error(data?.error?.message || `Upload failed (${res.status})`)
  }
  return data.secure_url
}
