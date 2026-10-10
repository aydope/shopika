import { useId } from 'react'
import { Link } from 'react-router-dom'

/** Hexagon badge with an "S" stroke, drawn with SVG only so it scales and follows the theme colors. */
export function LogoMark({ size = 36 }: { size?: number }) {
  const gradientId = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c6ff00" />
          <stop offset="1" stopColor="#ff2bd6" />
        </linearGradient>
      </defs>
      <path d="M24 3 43 14v20L24 45 5 34V14L24 3Z" fill="#050505" stroke={`url(#${gradientId})`} strokeWidth="3" />
      <path
        d="M31 17c-3-4-14-4-14 3 0 7 14 4 14 11 0 6-10 7-14 2"
        stroke={`url(#${gradientId})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="35" cy="13" r="2.2" fill="#ff2bd6" />
    </svg>
  )
}

export function Logo() {
  return (
    <Link to="/#top" className="flex items-center gap-2" aria-label="ShopiKa home">
      <LogoMark />
      <span className="display text-xl font-black sm:text-2xl">
        SHOPI<span className="grad">KA</span>
      </span>
    </Link>
  )
}
