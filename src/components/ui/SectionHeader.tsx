interface SectionHeaderProps {
  num: string
  title: string
  className?: string
}

export function SectionHeader({ num, title, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-5 mb-20 reveal ${className}`}>
      <span className="font-mono text-[11px] tracking-[0.15em]" style={{ color: 'var(--green)' }}>
        {num}
      </span>
      <h2
        className="font-bold tracking-tight shrink-0"
        style={{ fontSize: 'clamp(28px,4vw,48px)', color: 'var(--text)' }}
      >
        {title}
      </h2>
      <div className="section-line" />
    </div>
  )
}
