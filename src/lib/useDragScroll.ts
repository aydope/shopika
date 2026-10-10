import { useEffect, useRef } from 'react'

const DRAG_THRESHOLD = 5
const FRICTION = 0.94
const MIN_VELOCITY = 0.4

/**
 * Lets a horizontally scrollable element be dragged with a mouse or pen and glide to a stop on release.
 * Touch screens already scroll natively with a finger, so touch input is left alone. A drag never triggers
 * the click on whatever is under the pointer. Add the returned ref to an element with `overflow-x-auto`.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let startX = 0
    let startScroll = 0
    let lastX = 0
    let velocity = 0
    let dragging = false
    let frame = 0

    const updateScrollable = () => element.classList.toggle('is-scrollable', element.scrollWidth > element.clientWidth)
    const resizeObserver = new ResizeObserver(updateScrollable)
    resizeObserver.observe(element)
    Array.from(element.children).forEach((child) => resizeObserver.observe(child))
    updateScrollable()

    const swallowClick = (event: Event) => {
      event.stopPropagation()
      event.preventDefault()
    }
    const glide = () => {
      element.scrollLeft -= velocity
      velocity *= FRICTION
      if (Math.abs(velocity) > MIN_VELOCITY) frame = requestAnimationFrame(glide)
      else element.classList.remove('is-dragging')
    }
    const onMove = (event: PointerEvent) => {
      const delta = event.clientX - startX
      if (!dragging && Math.abs(delta) > DRAG_THRESHOLD) {
        dragging = true
        element.classList.add('is-dragging')
      }
      if (!dragging) return
      velocity = event.clientX - lastX
      lastX = event.clientX
      element.scrollLeft = startScroll - delta
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      if (!dragging) return
      // The click that follows a drag must not open a link or press a button. If the pointer was released
      // outside the element no click arrives, so the guard is removed again right after this event.
      element.addEventListener('click', swallowClick, { capture: true, once: true })
      window.setTimeout(() => element.removeEventListener('click', swallowClick, true), 0)
      frame = requestAnimationFrame(glide)
    }
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || event.button !== 0) return
      if (event.target instanceof Element && event.target.closest('input, select, textarea')) return
      if (element.scrollWidth <= element.clientWidth) return
      cancelAnimationFrame(frame)
      element.classList.remove('is-dragging')
      startX = lastX = event.clientX
      startScroll = element.scrollLeft
      velocity = 0
      dragging = false
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
    }
    // Stops the browser from starting its own drag of links and photos, which would fight the scrolling.
    const blockNativeDrag = (event: Event) => event.preventDefault()

    element.addEventListener('pointerdown', onDown)
    element.addEventListener('dragstart', blockNativeDrag)
    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      element.removeEventListener('pointerdown', onDown)
      element.removeEventListener('dragstart', blockNativeDrag)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])

  return ref
}
