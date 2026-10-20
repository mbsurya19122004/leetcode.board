'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

// center-crop to a square and shrink to 256px JPEG so uploads stay tiny
async function toSquareJpeg(file: File, size = 256): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const s = Math.min(bmp.width, bmp.height)
  const c = document.createElement('canvas')
  c.width = c.height = size
  c.getContext('2d')!.drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s, 0, 0, size, size)
  return new Promise((res, rej) => c.toBlob(b => (b ? res(b) : rej(new Error('Could not process image'))), 'image/jpeg', 0.85))
}

export default function AvatarUploader({ hasAvatar }: { hasAvatar: boolean }) {
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setBusy(true); setErr('')
    try {
      let blob: Blob
      try { blob = await toSquareJpeg(f) } catch { throw new Error('Could not read this image — try a JPG or PNG') }
      const fd = new FormData()
      fd.append('file', blob, 'avatar.jpg')
      const r = await fetch('/api/avatar', { method: 'POST', body: fd })
      if (!r.ok) throw new Error((await r.json()).error)
      router.refresh()
    } catch (e: any) { setErr(e.message) }
    setBusy(false)
  }

  async function remove() {
    setBusy(true); setErr('')
    await fetch('/api/avatar', { method: 'DELETE' })
    router.refresh()
    setBusy(false)
  }

  return (
    <div className="avatar-actions">
      <input ref={input} type="file" accept="image/*" hidden onChange={pick} />
      <button className="ghost" onClick={() => input.current?.click()} disabled={busy}>
        {busy ? 'Working…' : hasAvatar ? 'Change photo' : 'Add photo'}
      </button>
      {hasAvatar && !busy && <button className="ghost" onClick={remove}>Remove</button>}
      {err && <span className="msg">{err}</span>}
    </div>
  )
}
