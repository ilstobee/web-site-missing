import { useApp } from '../store'
import type { Stats } from '../firebase'

type ItemKey = keyof Stats

const items: { key: ItemKey; label: string; icon: string }[] = [
  { key: 'users', label: 'активных пользователей', icon: 'users' },
  { key: 'teams', label: 'команд создано', icon: 'teams' },
  { key: 'unions', label: 'успешных объединений', icon: 'star' },
  { key: 'directions', label: 'направлений', icon: 'globe' },
]

const icons: Record<string, string> = {
  users:
    'M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM5 19.2C6.4 16.6 9 15 12 15s5.6 1.6 7 4.2',
  teams:
    'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 19c.9-2.2 2.8-3.5 5-3.5 1.4 0 2.6.5 3.5 1.3M12.8 16.8c.9-.5 2-.8 3.2-.8 2.2 0 4.1 1.3 5 3.5',
  star: 'M12 3.5 14.2 9l5.8.5-4.4 3.7 1.4 5.8L12 16.2 6.99 19l1.4-5.8L4 9.5 9.8 9 12 3.5Z',
  globe:
    'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-6.5-8h13M12 4c2.2 2.3 3.3 5 3.3 8S14.2 17.7 12 20c-2.2-2.3-3.3-5-3.3-8S9.8 6.3 12 4Z',
}

export function StatsBar() {
  const { db } = useApp()
  const stats = db.stats
  return (
    <section className="pb-12 pt-2">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="grid grid-cols-2 gap-4 rounded-[24px] bg-blush px-6 py-7 shadow-[0_12px_30px_rgba(80,40,40,0.08)] sm:grid-cols-4">
          {items.map((item) => (
            <div key={item.key} className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" className="h-8 w-8 shrink-0 text-brand" fill="none" aria-hidden>
                <path
                  d={icons[item.icon]}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <p className="text-[20px] font-black leading-none text-ink">{stats[item.key]}</p>
                <p className="mt-1 text-[13px] font-semibold leading-tight text-muted">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
