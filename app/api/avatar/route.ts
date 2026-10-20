import { NextResponse } from 'next/server'
import { admin, serverClient } from '@/lib/supabase'
import { isLimited } from '@/lib/ratelimit'

async function me() {
  const { data: { user } } = await (await serverClient()).auth.getUser()
  return user
}

// Upload / replace own avatar (client sends a 256x256 JPEG)
export async function POST(req: Request) {
  const user = await me()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (await isLimited(`avatar:${user.id}`, 10, 60)) return NextResponse.json({ error: 'Too many uploads — slow down' }, { status: 429 })
  const file = (await req.formData()).get('file')
  if (!(file instanceof File) || file.type !== 'image/jpeg' || file.size > 512_000)
    return NextResponse.json({ error: 'Invalid image (JPEG, max 500 KB)' }, { status: 400 })

  const buf = Buffer.from(await file.arrayBuffer())
  if (buf[0] !== 0xff || buf[1] !== 0xd8 || buf[2] !== 0xff) return NextResponse.json({ error: 'Not a valid JPEG' }, { status: 400 })
  const db = admin()
  const path = `${user.id}.jpg`
  const { error } = await db.storage.from('avatars').upload(path, buf, {
    upsert: true, contentType: 'image/jpeg', cacheControl: '3600',
  })
  if (error) return NextResponse.json({ error: 'Upload failed' }, { status: 500 })

  const { data } = db.storage.from('avatars').getPublicUrl(path)
  await db.from('profiles').update({ avatar_url: `${data.publicUrl}?v=${Date.now()}` }).eq('id', user.id)
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const user = await me()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = admin()
  await db.storage.from('avatars').remove([`${user.id}.jpg`])
  await db.from('profiles').update({ avatar_url: null }).eq('id', user.id)
  return NextResponse.json({ ok: true })
}
