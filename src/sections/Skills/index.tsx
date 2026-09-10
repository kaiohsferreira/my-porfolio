import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SKILLS_DATA } from '@/data/portfolio'
import { getSkillIconUrls } from '@/lib/skill-icons'
import { SkillMonogram } from '@/components/ui/SkillMonogram'

/** Tempo que o carrossel leva para percorrer um grupo inteiro, em milissegundos. */
const LOOP_DURATION = 28000

function SkillIcon({ iconName, alt }: { iconName: string; alt: string }) {
  const urls = getSkillIconUrls(iconName, 64)
  const [index, setIndex] = useState(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setIndex(0)
    setFailed(false)
  }, [iconName])

  // Sem ícone cadastrado, ou com todas as fontes recusadas, entra o monograma. Antes o último
  // erro não era tratado e sobrava a imagem quebrada no cartão.
  if (!urls.length || failed) return <SkillMonogram name={alt} size={64} />

  return (
    <img
      src={urls[index]}
      alt={alt}
      className="w-16 h-16 object-contain transition-all duration-[250ms]"
      loading="lazy"
      draggable={false}
      onError={() => {
        if (index < urls.length - 1) setIndex((current) => current + 1)
        else setFailed(true)
      }}
    />
  )
}

export function Skills() {
  const { t } = useLanguage()
  const { skills } = usePortfolioContent()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const baseGroupRef = useRef<HTMLDivElement>(null)
  const [repeatCount, setRepeatCount] = useState(3)
  const visibleSkills = skills.length ? skills : SKILLS_DATA.map((skill, index) => ({
    id: index + 1,
    name: skill.name,
    category: 'Skills',
    iconName: skill.iconName,
    level: 0,
    sortOrder: index,
  }))

  // Quantos grupos cabem. Preciso de conteúdo dos dois lados da posição atual para o arraste
  // poder ir e voltar sem esbarrar no fim da rolagem, por isso o mínimo é três.
  useEffect(() => {
    const scroller = scrollerRef.current
    const baseGroup = baseGroupRef.current
    if (!scroller || !baseGroup) return

    function updateRepeat() {
      const containerWidth = scroller!.offsetWidth
      const baseWidth = baseGroup!.scrollWidth
      if (!containerWidth || !baseWidth) return

      const next = Math.max(3, Math.ceil(containerWidth / baseWidth) + 2)
      setRepeatCount((current) => (current === next ? current : next))
    }

    updateRepeat()

    const resizeObserver = new ResizeObserver(updateRepeat)
    resizeObserver.observe(scroller)
    resizeObserver.observe(baseGroup)

    return () => resizeObserver.disconnect()
  }, [visibleSkills.length])

  /**
   * Avanço automático e arraste.
   *
   * A rolagem é nativa do contêiner: assim o toque no celular e no tablet funciona sem
   * nenhum código, com a inércia que o sistema já dá. O avanço automático apenas empurra o
   * scrollLeft quadro a quadro, e o arraste com o mouse escreve nele diretamente.
   *
   * O laço é infinito porque os grupos se repetem: a posição volta um grupo inteiro para trás
   * quando passa dele, e o desenho na tela é idêntico, então a emenda não aparece.
   */
  useEffect(() => {
    const scroller = scrollerRef.current
    const baseGroup = baseGroupRef.current
    if (!scroller || !baseGroup) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let frame = 0
    let previous = 0
    let hovering = false
    let dragging = false
    let dragStartX = 0
    let dragStartScroll = 0
    let started = false

    function baseWidth() {
      return baseGroup!.scrollWidth
    }

    /**
     * Mantém a posição na faixa de um grupo, para nunca alcançar as pontas da rolagem.
     * Devolve o quanto deslocou, porque quem está arrastando precisa corrigir a referência do
     * gesto: sem isso o cálculo seguinte usaria a posição anterior à volta e desfaria o salto,
     * travando o carrossel na emenda.
     */
    function wrap() {
      const width = baseWidth()
      if (width <= 0) return 0

      if (scroller!.scrollLeft >= width * 2) {
        scroller!.scrollLeft -= width
        return -width
      }

      if (scroller!.scrollLeft <= 0) {
        scroller!.scrollLeft += width
        return width
      }

      return 0
    }

    function step(now: number) {
      if (!previous) previous = now
      const elapsed = now - previous
      previous = now

      const width = baseWidth()

      if (width > 0) {
        if (!started) {
          // Começa um grupo adiante, deixando material à esquerda para arrastar de volta.
          scroller!.scrollLeft = width
          started = true
        } else if (!hovering && !dragging && !reduced) {
          scroller!.scrollLeft += (width / LOOP_DURATION) * elapsed
        }

        wrap()
      }

      frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)

    const onEnter = () => { hovering = true }
    const onLeave = () => { hovering = false }

    /**
     * Só o mouse é arrastado por código. Toque e caneta ficam com a rolagem nativa, que já
     * tem inércia e não briga com o gesto vertical de rolar a página.
     */
    function onPointerDown(event: PointerEvent) {
      if (event.pointerType !== 'mouse' || event.button !== 0) return

      dragging = true
      dragStartX = event.clientX
      dragStartScroll = scroller!.scrollLeft
      scroller!.classList.add('is-dragging')

      // A captura só melhora o arraste quando o ponteiro sai do carrossel; se o navegador a
      // recusar, o arraste continua funcionando pelos eventos normais.
      try {
        scroller!.setPointerCapture(event.pointerId)
      } catch {
        /* sem captura, segue sem ela */
      }
    }

    function onPointerMove(event: PointerEvent) {
      if (!dragging) return

      event.preventDefault()

      // A volta é calculada antes de escrever a posição. Escrever primeiro e corrigir depois
      // perde movimento, porque o navegador prende o scrollLeft em zero antes de eu chegar —
      // e a referência do gesto acompanha o deslocamento para o arraste seguir contínuo.
      let target = dragStartScroll - (event.clientX - dragStartX)
      const width = baseWidth()

      if (width > 0) {
        if (target < 0) {
          target += width
          dragStartScroll += width
        } else if (target >= width * 2) {
          target -= width
          dragStartScroll -= width
        }
      }

      scroller!.scrollLeft = target
    }

    function onPointerUp(event: PointerEvent) {
      if (!dragging) return

      dragging = false
      scroller!.classList.remove('is-dragging')

      try {
        if (scroller!.hasPointerCapture(event.pointerId)) scroller!.releasePointerCapture(event.pointerId)
      } catch {
        /* nada a liberar */
      }
    }

    scroller.addEventListener('mouseenter', onEnter)
    scroller.addEventListener('mouseleave', onLeave)
    scroller.addEventListener('pointerdown', onPointerDown)
    scroller.addEventListener('pointermove', onPointerMove)
    scroller.addEventListener('pointerup', onPointerUp)
    scroller.addEventListener('pointercancel', onPointerUp)

    return () => {
      cancelAnimationFrame(frame)
      scroller.removeEventListener('mouseenter', onEnter)
      scroller.removeEventListener('mouseleave', onLeave)
      scroller.removeEventListener('pointerdown', onPointerDown)
      scroller.removeEventListener('pointermove', onPointerMove)
      scroller.removeEventListener('pointerup', onPointerUp)
      scroller.removeEventListener('pointercancel', onPointerUp)
    }
  }, [visibleSkills.length, repeatCount])

  return (
    <section
      id="skills"
      className="border-t"
      style={{ padding: '140px 0', borderColor: 'var(--border)' }}
    >
      <SectionHeader num="02" title={t('Skills', 'Skills')} className="px-12 !mb-16" />

      {/* As máscaras laterais ficam fora do contêiner que rola, senão andariam junto com ele. */}
      <div className="skills-marquee-wrap reveal">
        <div ref={scrollerRef} className="skills-marquee-scroller">
          <div className="skills-marquee-track">
            {Array.from({ length: repeatCount }, (_, groupIndex) => (
              <div
                key={`skills-group-${groupIndex}`}
                ref={groupIndex === 0 ? baseGroupRef : undefined}
                className="skills-marquee-group"
                aria-hidden={groupIndex > 0}
              >
                {visibleSkills.map((skill) => {
                  const level = Math.max(0, Math.min(100, Math.round(skill.level ?? 0)))

                  return (
                    <div
                      key={`${groupIndex}-${skill.id}-${skill.name}`}
                      className="skill-card-hover relative border flex flex-col items-center justify-center gap-4 overflow-hidden transition-all duration-[250ms]"
                      // A altura do preenchimento e a posicao do numero saem da mesma variavel.
                      style={{ borderColor: 'var(--border)', ['--level' as string]: `${level}%` }}
                    >
                      {level > 0 ? (
                        <span className="skill-level-corner font-mono" aria-hidden="true">
                          {level}%
                        </span>
                      ) : null}

                      <div className="skill-icon-wrap w-16 h-16 flex items-center justify-center relative z-10">
                        <SkillIcon iconName={skill.iconName} alt={skill.name} />
                      </div>

                      <span
                        className="skill-name font-mono text-[11px] tracking-[0.06em] text-center relative z-10 whitespace-nowrap transition-colors duration-[250ms]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {skill.name}
                      </span>

                      {level > 0 ? (
                        <>
                          <span
                            className="skill-level-fill"
                            role="img"
                            aria-label={`${skill.name}: ${level}% ${t('de domínio', 'proficiency')}`}
                          />
                          <span className="skill-level-big" aria-hidden="true">
                            {level}%
                          </span>
                        </>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
