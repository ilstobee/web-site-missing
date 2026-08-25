import { useRef } from 'react'
import { useApp } from '../store'

type Props = {
  activeId: string
  onSelect(id: string): void
}

export function SphereRibbon({ activeId, onSelect }: Props) {
  const { allCategories } = useApp()
  const scroller = useRef<HTMLDivElement>(null)

  return (
    <section className="py-8">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <h2 className="text-[1.65rem] font-extrabold tracking-tight text-ink">
            Предложения сфер
          </h2>
          <p className="text-sm font-medium text-muted">Листай и выбирай</p>
        </div>

        <div className="relative">
          <div ref={scroller} className="hide-scroll flex gap-2.5 overflow-x-auto pb-2">
            {allCategories.map((category) => {
              const isActive = category.id === activeId
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    onSelect(category.id)
                    document.getElementById('spheres')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  aria-pressed={isActive}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition ${
                    isActive
                      ? 'bg-brand text-white shadow-[0_8px_18px_rgba(247,86,109,0.3)]'
                      : 'bg-white text-ink shadow-[0_4px_12px_rgba(80,40,40,0.06)] hover:ring-1 hover:ring-brand/40'
                  }`}
                >
                  <img src={category.icon} alt="" loading="lazy" decoding="async" className="h-5 w-5 object-contain" />
                  {category.name}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            className="absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-brand shadow-md md:grid"
            onClick={() => scroller.current?.scrollBy({ left: 320, behavior: 'smooth' })}
            aria-label="Дальше"
          >
            →
          </button>
        </div>
      </div>
    </section>
  )
}