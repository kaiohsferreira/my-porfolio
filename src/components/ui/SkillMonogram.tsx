import { getSkillInitials } from '@/lib/skill-icons'

/**
 * Marca de reserva para a habilidade sem ícone.
 *
 * Boa parte do que está cadastrado não é produto e não tem logo — "Clean Architecture",
 * "REST API", "LINQ". Antes essas caíam num quadrado com "N/A" no meio do carrossel. As
 * iniciais em monoespaçada, nas cores do tema, parecem escolha e não falha.
 */
export function SkillMonogram({ name, size }: { name: string; size: number }) {
  return (
    <span
      className="skill-monogram"
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
    >
      {getSkillInitials(name)}
    </span>
  )
}
