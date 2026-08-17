import { categories } from '../data'
import { SectionHeader } from './SectionHeader'

export function CategoryGrid() {
  return (
    <section id="spheres" className="py-8">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <SectionHeader
          title="Найди свою сферу"
          href="#spheres"
          linkLabel="Смотреть все сферы"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`flex h-[72px] items-center justify-center gap-2.5 rounded-2xl px-3 ${
                category.tint ?? 'bg-cream'
              }`}
            >
              <img src={category.icon} alt="" className="icon-even" />
              <span className="text-left text-[13px] font-semibold leading-tight text-ink">
                {category.name}
              </span>
            </button>
          ))}

          <button
            type="button"
            className="flex h-[72px] items-center justify-center gap-2.5 rounded-2xl bg-[#fde4df] px-3"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center gap-0.5 rounded-full bg-white">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            </span>
            <span className="text-left text-[13px] font-semibold leading-tight text-ink">
              Ещё сотни направлений
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
