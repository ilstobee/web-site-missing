import { useEffect } from 'react'

export function ImageLightbox({ src, onClose }: { src: string; onClose(): void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
        aria-label="Закрыть"
      >
        ✕
      </button>
      <img
        src={src}
        alt=""
        className="max-h-[88vh] max-w-[94vw] rounded-lg object-contain shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      />
      <span className="mt-3 text-[12px] text-white/60">Нажми на фото или фон, чтобы закрыть</span>
    </div>
  )
}
