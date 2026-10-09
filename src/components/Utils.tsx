import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, useScroll } from 'framer-motion'
import { ArrowUp, Cookie, Megaphone } from 'lucide-react'
import { FREE_SHIPPING_THRESHOLD, PROMO_CODE, PROMO_RATE } from '@/lib/pricing'

const BACK_TO_TOP_OFFSET = 700
const COOKIE_CONSENT_KEY = 'sk-cookies'

export const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

/** Scrolls to the URL hash (or the top) after each navigation and turns internal link clicks into SPA navigation. */
export function ScrollManager() {
  const { key, hash } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null
    if (target) target.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo(0, 0)
  }, [key, hash])

  useEffect(() => {
    const interceptInternalLinks = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest('a') : null
      const href = anchor?.getAttribute('href')
      const isInternal = href && (href.startsWith('/') || href.startsWith('#'))
      if (event.defaultPrevented || !anchor || !isInternal || anchor.target === '_blank' || event.metaKey || event.ctrlKey) return
      event.preventDefault()
      navigate(href.startsWith('#') ? `/${href}` : href)
    }
    document.addEventListener('click', interceptInternalLinks)
    return () => document.removeEventListener('click', interceptInternalLinks)
  }, [navigate])

  return null
}

export function ScrollUI() {
  const { scrollYProgress } = useScroll()
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > BACK_TO_TOP_OFFSET)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.div style={{ scaleX: scrollYProgress }} className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-ac to-ac2" />
      {showBackToTop && (
        <button type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-20 right-4 z-40 grid h-11 w-11 place-items-center border-2 border-ac bg-black text-ac md:bottom-6">
          <ArrowUp size={18} />
        </button>
      )}
    </>
  )
}

/** Sets the document title and meta description while the calling page is mounted. Pass `enabled = false` to skip. */
export function usePage(title: string, description: string, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const previousTitle = document.title
    document.title = `${title} | ShopiKa`
    document.querySelector('meta[name=description]')?.setAttribute('content', description)
    return () => {
      document.title = previousTitle
    }
  }, [title, description, enabled])
}

/** Injects a JSON-LD script into the document head while the calling component is mounted. Pass null to skip. */
export function useJsonLd(data: object | null) {
  const json = data ? JSON.stringify(data) : null
  useEffect(() => {
    if (!json) return
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = json
    document.head.appendChild(script)
    return () => script.remove()
  }, [json])
}

/** A boolean that turns on when triggered and switches itself off after `ms`. The timer is cleared on unmount and re-trigger. */
export function useTransientFlag(ms: number) {
  const [active, setActive] = useState(false)
  const timer = useRef<number>()
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const trigger = useCallback(() => {
    window.clearTimeout(timer.current)
    setActive(true)
    timer.current = window.setTimeout(() => setActive(false), ms)
  }, [ms])
  return [active, trigger] as const
}

// Storage can be blocked (private mode, strict browser settings), so both helpers degrade to "not remembered".
function hasCookieConsent() {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === '1'
  } catch {
    return false
  }
}
function rememberCookieConsent() {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, '1')
  } catch {
    // Consent then only lasts for this visit, which is the safe fallback.
  }
}

export function CookieBanner() {
  const [accepted, setAccepted] = useState(hasCookieConsent)
  if (accepted) return null
  const accept = () => {
    rememberCookieConsent()
    setAccepted(true)
  }
  return (
    <div role="dialog" aria-label="Cookie preferences" className="fixed inset-x-3 bottom-20 z-50 mx-auto flex max-w-xl flex-col gap-3 border-2 border-ac bg-black p-4 sm:flex-row sm:items-center md:bottom-4">
      <Cookie className="shrink-0 text-ac" />
      <p className="flex-1 text-sm text-white/80">We use essential cookies to keep your cart and preferences. Read our <a href="/privacy" className="text-ac underline">Privacy Policy</a>.</p>
      <button type="button" onClick={accept} className="h-11 bg-ac px-5 text-sm font-bold uppercase text-black">Got it</button>
    </div>
  )
}

export const AnnounceBar = () => (
  <div className="flex items-center justify-center gap-2 bg-ac px-3 py-2 text-center text-xs font-bold uppercase text-black">
    <Megaphone size={14} className="shrink-0" />
    Free shipping over ${FREE_SHIPPING_THRESHOLD}. Use code {PROMO_CODE} for {PROMO_RATE * 100}% off
  </div>
)
