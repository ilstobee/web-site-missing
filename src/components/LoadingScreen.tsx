import { useEffect, useRef } from 'react'
import lottie from 'lottie-web'
import type { AnimationItem } from 'lottie-web'

type Props = {
  onDone: () => void
}

export function LoadingScreen({ onDone }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    document.getElementById('boot-splash')?.remove()
    const container = containerRef.current
    if (!container) return

    let anim: AnimationItem | null = null
    let finished = false
    let fallbackTimer = 0
    let minTimer = 0

    const spinner = container.parentElement?.querySelector(
      '[data-boot-spinner]',
    ) as HTMLElement | null

    const finish = () => {
      if (finished) return
      finished = true
      window.clearTimeout(fallbackTimer)
      window.clearTimeout(minTimer)
      if (anim) {
        try {
          anim.destroy()
        } catch {
          /* noop */
        }
        anim = null
      }
      doneRef.current()
    }

    try {
      anim = lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: `${import.meta.env.BASE_URL}loading.json?v=4`,
      })
      if (anim) {
        anim.addEventListener('DOMLoaded', () => {
          if (spinner) spinner.style.display = 'none'
        })
      }
    } catch {
      finish()
    }

    minTimer = window.setTimeout(finish, 5400)
    fallbackTimer = window.setTimeout(finish, 8000)

    return () => {
      window.clearTimeout(fallbackTimer)
      window.clearTimeout(minTimer)
      if (anim) {
        try {
          anim.destroy()
        } catch {
          /* noop */
        }
        anim = null
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black">
      <div
        data-boot-spinner
        className="absolute h-16 w-16 rounded-full border-[5px] border-[rgba(247,86,109,0.25)] border-t-[#f7566d]"
        style={{ animation: 'boot-spin 0.9s linear infinite' }}
      />
      <div ref={containerRef} className="relative w-full max-w-xl" />
    </div>
  )
}