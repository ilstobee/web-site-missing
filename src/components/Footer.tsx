import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="pb-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm font-medium text-muted sm:flex-row lg:px-8">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <span>© {new Date().getFullYear()}</span>
        </div>
        <nav className="flex gap-5">
          <a href="#spheres" className="hover:text-brand">
            Сферы
          </a>
          <a href="#teams" className="hover:text-brand">
            Команды
          </a>
          <a href="#create" className="hover:text-brand">
            Создать
          </a>
        </nav>
      </div>
    </footer>
  )
}
