import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { usePortfolioContent } from '@/context/PortfolioContentContext'
import { AboutTopic } from './topics/AboutTopic'
import { SkillsTopic } from './topics/SkillsTopic'
import { ExperienceTopic } from './topics/ExperienceTopic'
import { ProjectsTopic } from './topics/ProjectsTopic'
import { ContactTopic } from './topics/ContactTopic'
import './site.css'

/** Distância entre dois cartões no eixo Z, em px. */
const GAP_Z = 1500
/** Quanto da altura da tela se rola para ir de um cartão ao seguinte. */
const STATION = 0.9

/** Poeira no fundo: posições pseudoaleatórias, mas fixas, para não mudarem a cada render. */
const DUST = Array.from({ length: 36 }, (_, i) => {
  const rand = (n: number) => Math.abs((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1)
  return { x: (rand(1) - 0.5) * 140, y: (rand(2) - 0.5) * 110, z: 400 - rand(3) * GAP_Z * 5.5, size: 3 + rand(4) * 7 }
})

/**
 * O portfólio como uma viagem em profundidade.
 *
 * Cada seção é um cartão HTML real parado num ponto do eixo Z; a rolagem da página move a
 * câmera para dentro da cena. O trilho invisível dá a altura rolável e as paradas suaves em cada
 * cartão, e o palco fixo só desenha. Texto, links e formulários continuam de verdade — o 3D é
 * apenas onde cada cartão está.
 */
export function DepthPortfolio() {
  const { lang, setLang, t } = useLanguage()
  const { profile, experiences, projects } = usePortfolioContent()
  // Quem pede menos movimento recebe uma página comum, com tudo visível.
  const [flat] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [active, setActive] = useState(0)
  const [reached, setReached] = useState<ReadonlySet<number>>(() => new Set(flat ? [0, 1, 2, 3, 4, 5] : [0]))
  const worldRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<Array<HTMLElement | null>>([])
  const anchorsRef = useRef<Array<HTMLSpanElement | null>>([])
  const activeRef = useRef(0)

  useLayoutEffect(() => {
    document.body.classList.add('site-mode')
    if (!flat) document.documentElement.classList.add('depth-snap')
    return () => {
      document.body.classList.remove('site-mode')
      document.documentElement.classList.remove('depth-snap')
    }
  }, [flat])

  const headline = t(profile.headline || 'Desenvolvedor Full Stack', profile.headlineEn || profile.headline || 'Full Stack Developer')
  const since = profile.sinceYear ? t(`construindo sistemas desde ${profile.sinceYear}`, `building systems since ${profile.sinceYear}`) : ''
  // O lugar vem do painel como texto livre; sem preposição para não errar "em/no/na".
  const where = [profile.location ? `📍 ${profile.location}` : '', since].filter(Boolean).join(' · ')

  function go(index: number) {
    if (flat) {
      cardsRef.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    // As âncoras usam vh do CSS; ler a posição delas evita divergir de innerHeight no celular.
    window.scrollTo({ top: anchorsRef.current[index]?.offsetTop ?? 0, behavior: 'smooth' })
  }

  const stations: Array<{ label: string; eyebrow?: string; title?: string; body: ReactNode }> = [
    {
      label: t('Início', 'Home'),
      body: (
        <div className="depth-hero">
          <span className="depth-eyebrow">{headline}</span>
          <h1>{profile.fullName}</h1>
          {where ? <p>{where}</p> : null}
          <div className="depth-actions">
            <button type="button" className="site-btn site-btn-primary" onClick={() => go(4)}>
              {t('Ver projetos', 'See projects')}
            </button>
            <button type="button" className="site-btn" onClick={() => go(5)}>
              {t('Falar comigo', 'Get in touch')}
            </button>
          </div>
          {flat ? null : <span className="depth-hint">{t('Role para entrar ↓', 'Scroll to dive in ↓')}</span>}
        </div>
      ),
    },
    {
      label: t('Sobre mim', 'About me'),
      eyebrow: t('Quem sou', 'Who I am'),
      title: t('Sobre mim', 'About me'),
      body: <AboutTopic reached={reached.has(1)} />,
    },
    {
      label: 'Skills',
      eyebrow: t('Com o que trabalho', 'What I work with'),
      title: 'Skills',
      body: <SkillsTopic />,
    },
    {
      label: t('Experiência', 'Experience'),
      eyebrow: t('Por onde passei', "Where I've been"),
      title: t('Experiência', 'Experience'),
      body: experiences.length ? (
        <ExperienceTopic />
      ) : (
        <p className="depth-empty">{t('Minha trajetória ainda está sendo escrita por aqui.', 'My journey is still being written here.')}</p>
      ),
    },
    {
      label: t('Projetos', 'Projects'),
      eyebrow: t('O que construí', "What I've built"),
      title: t('Projetos', 'Projects'),
      body: projects.length ? (
        <ProjectsTopic />
      ) : (
        <p className="depth-empty">{t('Os projetos estão chegando em breve.', 'Projects are coming soon.')}</p>
      ),
    },
    {
      label: t('Contato', 'Contact'),
      eyebrow: t('Contato', 'Contact'),
      title: t('Vamos conversar?', "Let's talk"),
      body: <ContactTopic />,
    },
  ]
  const count = stations.length

  useEffect(() => {
    if (flat) return
    const world = worldRef.current
    if (!world) return

    let frame = 0
    let camX = 0
    let camY = 0
    let targetX = 0
    let targetY = 0

    // Só o mouse gera paralaxe; no toque a câmera fica centrada.
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      targetX = (event.clientX / window.innerWidth - 0.5) * 60
      targetY = (event.clientY / window.innerHeight - 0.5) * 36
    }
    window.addEventListener('pointermove', onPointer)

    const tick = () => {
      frame = requestAnimationFrame(tick)

      const step = anchorsRef.current[1]?.offsetTop || window.innerHeight * STATION
      const progress = Math.min(count - 1, Math.max(0, window.scrollY / step))
      camX += (targetX - camX) * 0.06
      camY += (targetY - camY) * 0.06
      world.style.transform = `translate3d(${-camX}px, ${-camY}px, ${progress * GAP_Z}px)`

      cardsRef.current.forEach((card, i) => {
        if (!card) return
        // Distância em cartões: positiva à frente; negativa é o cartão passando pela câmera.
        const d = i - progress
        const opacity = d < -0.35 ? 0 : d < 0 ? 1 + d / 0.35 : Math.max(0, 1 - d / 2.2)
        card.style.opacity = opacity.toFixed(3)
        card.style.visibility = opacity < 0.02 ? 'hidden' : 'visible'
      })

      const nearest = Math.round(progress)
      if (nearest !== activeRef.current) {
        activeRef.current = nearest
        setActive(nearest)
        setReached((current) => (current.has(nearest) ? current : new Set(current).add(nearest)))
      }
    }
    tick()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [flat, count])

  return (
    <div className={flat ? 'depth is-flat' : 'depth'}>
      <header className="depth-head">
        <button type="button" className="depth-brand" onClick={() => go(0)}>
          {profile.fullName}
        </button>
        <div className="depth-head-actions">
          {profile.resumeFileUrl ? (
            <a className="site-btn" href={profile.resumeFileUrl} target="_blank" rel="noopener noreferrer">
              {t('Currículo', 'Resume')} ↗
            </a>
          ) : null}
          <div className="depth-lang" role="group" aria-label={t('Idioma', 'Language')}>
            {(['pt', 'en'] as const).map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={lang === code}
                className={lang === code ? 'is-on' : undefined}
                onClick={() => setLang(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <nav aria-label={t('Seções', 'Sections')}>
        <ul className="depth-rail">
          {stations.map((station, i) => (
            <li key={i}>
              <button
                type="button"
                className={i === active ? 'is-on' : undefined}
                aria-current={i === active ? 'true' : undefined}
                aria-label={station.label}
                onClick={() => go(i)}
              >
                <span aria-hidden="true">{station.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* A página rola este trilho; o palco fixo é que desenha a cena. */}
      <div className="depth-track" style={{ height: `calc(${(count - 1) * STATION * 100}vh + 100vh)` }} aria-hidden="true">
        {stations.map((_, i) => (
          <span
            key={i}
            ref={(el) => {
              anchorsRef.current[i] = el
            }}
            className="depth-anchor"
            style={{ top: `${i * STATION * 100}vh` }}
          />
        ))}
      </div>

      <main className="depth-stage">
        <div ref={worldRef} className="depth-world">
          {DUST.map((dot, i) => (
            <span
              key={i}
              className="depth-dot"
              aria-hidden="true"
              style={{ width: dot.size, height: dot.size, transform: `translate3d(${dot.x}vw, ${dot.y}vh, ${dot.z}px)` }}
            />
          ))}

          {stations.map((station, i) => {
            // A abertura fica no centro; as seções alternam lados, viradas para o eixo da câmera.
            const side = i === 0 ? 0 : i % 2 ? -1 : 1

            return (
              <section
                key={i}
                ref={(el) => {
                  cardsRef.current[i] = el
                }}
                className={i === active || flat ? 'depth-card is-active' : 'depth-card'}
                aria-label={station.label}
                // Tab até um cartão distante leva a câmera até ele.
                onFocus={() => {
                  if (i !== activeRef.current) go(i)
                }}
                style={{
                  transform: `translate(-50%, -50%) translate3d(calc(${side} * var(--sway)), 0, ${-i * GAP_Z}px) rotateY(calc(${-side} * var(--tilt)))`,
                }}
              >
                {station.title ? (
                  <header className="depth-card-head">
                    <span className="depth-eyebrow">{station.eyebrow}</span>
                    <h2>{station.title}</h2>
                  </header>
                ) : null}
                {station.body}
              </section>
            )
          })}
        </div>
      </main>
    </div>
  )
}
