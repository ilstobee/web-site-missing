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
    const container = containerRef.current
    if (!container) return

    let anim: AnimationItem | null = null
    let finished = false
    let fallbackTimer = 0
    let minTimer = 0

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
        path: `${import.meta.env.BASE_URL}loading.json?v=3`,
      })
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
    <div className="fixed inset-0 z-[100] grid place-items-center bg-white">
      <div ref={containerRef} className="w-full max-w-xl" />
    </div>
  )
}