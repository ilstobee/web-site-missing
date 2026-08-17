import mark from '../assets/logo.png'

type Props = {
  size?: 'sm' | 'md'
}

export function Logo({ size = 'md' }: Props) {
  const icon = size === 'sm' ? 'h-11' : 'h-14 sm:h-16'
  const text = size === 'sm' ? 'text-xl' : 'text-[1.75rem] sm:text-3xl'

  return (
    <a href="#top" className="flex items-center gap-3" aria-label="missing!">
      <img src={mark} alt="" className={`${icon} w-auto`} />
      <span className={`${text} font-black leading-none tracking-tight text-ink`}>
        missing<span className="text-brand">!</span>
      </span>
    </a>
  )
}
