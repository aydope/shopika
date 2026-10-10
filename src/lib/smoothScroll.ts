import Lenis from 'lenis'

/** Spread onto scrollable overlays (drawers, dialogs, panels) so wheel scrolling inside them stays native. */
export const LENIS_PREVENT = { 'data-lenis-prevent': '' }

/** Space kept above a scroll target so the sticky header does not cover it. */
export const HEADER_OFFSET = 90

let instance: Lenis | null = null

/**
 * Starts inertia scrolling for mouse wheels and trackpads. Touch screens keep their native scrolling, and people who
 * ask for reduced motion keep plain browser scrolling. Scrollable overlays opt out with `data-lenis-prevent`.
 * Returns a cleanup function.
 */
export function startSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const lenis = new Lenis({ lerp: 0.09 })
  instance = lenis
  let frame = 0
  const tick = (time: number) => {
    lenis.raf(time)
    frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(frame)
    lenis.destroy()
    instance = null
  }
}

export function scrollToElement(element: HTMLElement) {
  if (instance) instance.scrollTo(element, { offset: -HEADER_OFFSET })
  else element.scrollIntoView({ behavior: 'smooth' })
}

export function scrollToTop(immediate: boolean) {
  if (instance) instance.scrollTo(0, { immediate })
  else window.scrollTo({ top: 0, behavior: immediate ? 'instant' : 'smooth' })
}
