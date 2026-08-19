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
    const finish = () => {
      if (finished) return
      finished = true
      window.clearTimeout(fallbackTimer)
      anim?.destroy()
      doneRef.current()
    }

    try {
      anim = lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: `${import.meta.env.BASE_URL}loading.json`,
      })
      anim.addEventListener('complete', finish)
    } catch {
      finish()
    }
    fallbackTimer = window.setTimeout(finish, 7000)

    return () => {
      window.clearTimeout(fallbackTimer)
      anim?.removeEventListener('complete', finish)
      anim?.destroy()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-white">
      <div ref={containerRef} className="w-full max-w-xl" />
    </div>
  )
}