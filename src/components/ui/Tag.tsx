type TagColor = 'green' | 'cyan' | 'red' | 'yellow'

interface TagProps {
  label: string
  color?: TagColor
}

const styles: Record<TagColor, string> = {
  green:  'text-green  bg-green-glow  border-[oklch(72%_0.25_160_/_0.3)]',
  cyan:   'text-cyan   bg-cyan-glow   border-[oklch(72%_0.25_220_/_0.3)]',
  red:    'text-red-accent bg-red-glow   border-[oklch(65%_0.22_25_/_0.3)]',
  yellow: 'text-yellow-accent bg-yellow-glow border-[oklch(78%_0.18_90_/_0.3)]',
}

export function Tag({ label, color = 'green' }: TagProps) {
  return (
    <span
      className={`font-mono text-[11px] tracking-[0.08em] uppercase border px-[10px] py-[3px] clip-chip-xs ${styles[color]}`}
    >
      {label}
    </span>
  )
}
