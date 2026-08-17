import { asset, createSteps } from '../data'

const stepIcons: Record<string, string> = {
  target:
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-5.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21',
  idea:
    'M8 7.5A4 4 0 0 1 16 8c0 2-1.2 3.1-2.2 4.1-.6.6-1 1.4-1 2.2v.2H11.2v-.2c0-.8-.4-1.6-1-2.2C9.2 11.1 8 10 8 8Zm2.2 8.8h3.6M10.6 19h2.8',
  roles:
    'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 .5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM4.2 19c.9-2.4 2.8-3.7 4.8-3.7s3.9 1.3 4.8 3.7M13.4 15.6c1.6-.4 3.3.3 4.4 2.4',
  send:
    'M4 11.5 20 4 12.8 20 11 13.2 4 11.5Z',
}

export function CreateBanner() {
  return (
    <section id="create" className="py-4">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="rounded-[28px] bg-blush px-6 py-8 shadow-[0_8px_24px_rgba(80,40,40,0.04)] sm:px-8 lg:px-10">
          <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex items-center gap-5">
              <img
                src={asset('images/create-flag.png')}
                alt=""
                className="hidden h-[150px] w-[150px] object-contain sm:block"
              />
              <div>
                <h2 className="text-[1.55rem] font-extrabold leading-tight text-ink">
                  Не нашёл подходящую команду?
                </h2>
                <p className="mt-1 text-[1.7rem] font-extrabold leading-tight text-brand">
                  Создай свою!
                </p>
                <p className="mt-2 text-sm text-muted">
                  Всего 4 шага и твоя команда начнёт собираться.
                </p>
                <a
                  href="#create"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  Создать команду →
                </a>
              </div>
            </div>

            <div className="relative grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
              <div className="step-line pointer-events-none absolute left-[12%] right-[12%] top-5 hidden h-px sm:block" />
              {createSteps.map((step) => (
                <div key={step.n} className="relative z-10 text-center">
                  <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white text-brand shadow-sm">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                      <path
                        d={stepIcons[step.icon]}
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="mt-3 text-[13px] font-extrabold text-ink">
                    {step.n}. {step.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-muted">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
