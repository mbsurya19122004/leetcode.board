export default function Avatar({ name, url, size = 32 }: { name: string; url?: string | null; size?: number }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
  return url
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={url} alt="" className="avatar" style={{ width: size, height: size }} />
    : <span className="avatar ph" style={{ width: size, height: size, fontSize: size * 0.38 }}>{initials}</span>
}
