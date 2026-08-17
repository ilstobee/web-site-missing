type Props = {
  title: string
  href?: string
  linkLabel?: string
  subtitle?: string
}

export function SectionHeader({ title, href, linkLabel, subtitle }: Props) {
  return (
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="text-[1.65rem] font-extrabold tracking-tight text-ink">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm font-medium text-muted">{subtitle}</p>
        ) : null}
      </div>
      {href && linkLabel ? (
        <a href={href} className="text-sm font-semibold text-brand hover:text-brand-dark">
          {linkLabel} →
        </a>
      ) : null}
    </div>
  )
}
