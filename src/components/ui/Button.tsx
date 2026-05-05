import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline'
  children: ReactNode
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const base =
    'inline-flex items-center gap-2 font-mono text-[13px] tracking-[0.08em] cursor-pointer transition-all duration-200 clip-chip px-7 py-[14px]'

  const variants = {
    primary: 'bg-green text-bg border-none hover:bg-cyan hover:-translate-y-0.5 hover:shadow-[0_8px_32px_oklch(72%_0.25_220_/_0.3)]',
    outline: 'bg-transparent text-text border border-border-bright hover:border-green hover:text-green hover:bg-green-glow',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
