import { asset, heroTags, socialAvatars } from '../data'

function Sparkle({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`sparkle h-4 w-4 ${className}`} aria-hidden>
      <path
        d="M10 1.2 11.4 8.6 18.8 10 11.4 11.4 10 18.8 8.6 11.4 1.2 10 8.6 8.6Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function Hero() {
  return (
    <section className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 pb-10 pt-2 lg:grid-cols-[0.95fr_1.05fr] lg:gap-6 lg:px-8 lg:pb-12">
      <Sparkle className="left-[42%] top-[18%]" />
      <Sparkle className="right-[46%] top-[8%] h-3 w-3" />
      <Sparkle className="bottom-[22%] left-[38%] h-3.5 w-3.5" />

      <div className="relative z-10 max-w-xl">
        <h1 className="text-[2.6rem] font-black leading-[1.08] tracking-[-0.04em] text-ink sm:text-[3.4rem]">
          Найди <span className="text-brand">себя</span> —<br />
          найди <span className="text-brand">команду</span>
        </h1>
        <p className="mt-5 max-w-[28rem] text-[15px] leading-relaxed text-muted">
          Здесь люди находят друг друга для совместных дел, проектов,
          путешествий и всего, что делает жизнь ярче и интереснее.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a
            href="#teams"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(247,86,109,0.3)] transition hover:bg-brand-dark"
          >
            Найти команду
            <span aria-hidden>→</span>
          </a>
          <a
            href="#create"
            className="inline-flex items-center gap-2 rounded-full border border-brand bg-white px-6 py-3 text-sm font-semibold text-brand transition hover:bg-brand-soft"
          >
            Создать команду
            <span aria-hidden>+</span>
          </a>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <div className="flex -space-x-2.5">
            {socialAvatars.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
              />
            ))}
          </div>
          <p className="text-sm font-medium text-ink">
            Присоединяйся к сообществу и найди свою команду ❤️
          </p>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[560px]">
        <img
          src={asset('images/hero.png')}
          alt="Компания друзей на пуфах"
          className="relative z-10 w-full object-contain"
        />

        {heroTags.map((tag) => (
          <span
            key={tag.label}
            className={`absolute z-20 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-ink shadow-[0_8px_20px_rgba(80,40,40,0.12)] ${tag.className}`}
          >
            <img src={tag.icon} alt="" className="h-5 w-5 object-contain" />
            {tag.label}
          </span>
        ))}
      </div>
    </section>
  )
}
