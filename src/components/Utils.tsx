import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, useScroll } from 'framer-motion'
import { ArrowUp, Cookie, Megaphone } from 'lucide-react'
export function ScrollManager() {
  const loc = useLocation(), nav = useNavigate()
  useEffect(() => { // scroll to hash or top on every navigation
    const t = setTimeout(() => { const el = loc.hash && document.getElementById(loc.hash.slice(1)); el ? el.scrollIntoView({ behavior: 'smooth' }) : window.scrollTo(0, 0) }, 60); return () => clearTimeout(t)
  }, [loc.key])
  useEffect(() => { // turn every internal <a href> into SPA navigation
    const f = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a'), h = a?.getAttribute('href')
      if (e.defaultPrevented || !a || !h || a.target === '_blank' || e.metaKey || e.ctrlKey || !(h.startsWith('/') || h.startsWith('#'))) return
      e.preventDefault(); nav(h.startsWith('#') ? '/' + h : h)
    }
    document.addEventListener('click', f); return () => document.removeEventListener('click', f)
  }, [nav])
  return null
}
export function ScrollUI() {
  const { scrollYProgress } = useScroll(), [show, setShow] = useState(false)
  useEffect(() => { const f = () => setShow(scrollY > 700); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f) }, [])
  return (<>
    <motion.div style={{ scaleX: scrollYProgress }} className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-ac to-ac2" />
    {show && <button aria-label="Back to top" onClick={() => scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-20 right-4 z-40 grid h-11 w-11 place-items-center border-2 border-ac bg-black text-ac md:bottom-6"><ArrowUp size={18} /></button>}
  </>)
}

export function usePage(title: string, desc: string) {
  useEffect(() => { const t = document.title; document.title = `${title} | ShopiKa`; document.querySelector('meta[name=description]')?.setAttribute('content', desc); return () => { document.title = t } }, [title, desc])
}
export function CookieBanner() {
  const [ok, setOk] = useState(() => localStorage.getItem('sk-cookies') === '1')
  if (ok) return null
  return (
    <div role="dialog" aria-label="Cookie preferences" className="fixed inset-x-3 bottom-20 z-50 mx-auto flex max-w-xl flex-col gap-3 border-2 border-ac bg-black p-4 sm:flex-row sm:items-center md:bottom-4">
      <Cookie className="shrink-0 text-ac" /><p className="flex-1 text-sm text-white/80">We use essential cookies to keep your cart and preferences. Read our <a href="/privacy" className="text-ac underline">Privacy Policy</a>.</p>
      <button onClick={() => { localStorage.setItem('sk-cookies', '1'); setOk(true) }} className="h-11 bg-ac px-5 text-sm font-bold uppercase text-black">Got it</button>
    </div>
  )
}
export const AnnounceBar = () => <div className="flex items-center justify-center gap-2 bg-ac px-3 py-2 text-center text-xs font-bold uppercase text-black"><Megaphone size={14} className="shrink-0" />Free shipping over $150. Use code SHOPI20 for 20% off</div>
