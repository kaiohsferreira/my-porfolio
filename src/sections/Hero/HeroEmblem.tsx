import type { ReactElement } from 'react'
import { useTheme } from '@/context/ThemeContext'

/**
 * Emblema animado que acompanha o tema escolhido.
 *
 * Os desenhos são originais e deliberadamente abstratos. Cada tema leva o nome de um
 * personagem protegido por direito autoral e marca, então aqui não se reproduz personagem nem
 * emblema registrado: o que o desenho traduz é o arquétipo — velocidade, sonar, maré, energia,
 * escala — em geometria, pintada com as cores que o próprio tema já define.
 */

const LINE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const THIN = { ...LINE, strokeWidth: 1.2 } as const

/** Atalho para escalonar animações iguais sem repetir objeto de estilo. */
const delay = (seconds: number) => ({ animationDelay: `${seconds}s` })

const MOTIFS: Record<string, () => ReactElement> = {
  /* Escala: quadrados que encolhem e voltam. */
  'ant-man': () => (
    <>
      <rect className="emb-shrink" x="20" y="20" width="60" height="60" {...LINE} />
      <rect className="emb-shrink" style={delay(0.5)} x="34" y="34" width="32" height="32" {...THIN} />
      <rect className="emb-shrink e-accent" style={delay(1)} x="45" y="45" width="10" height="10" {...THIN} stroke="currentColor" />
    </>
  ),

  /* Maré: linhas de onda atravessando o quadro. */
  aquaman: () => (
    <>
      <path className="emb-drift" d="M6 38q12-11 24 0t24 0 24 0" {...LINE} />
      <path className="emb-drift e-accent" style={delay(0.6)} d="M6 52q12-11 24 0t24 0 24 0" {...LINE} />
      <path className="emb-drift" style={delay(1.2)} d="M6 66q12-11 24 0t24 0 24 0" {...THIN} />
    </>
  ),

  /* Sonar: pulsos que partem de um ponto e se abrem. */
  batman: () => (
    <>
      <circle cx="50" cy="50" r="4" fill="currentColor" />
      <circle className="emb-echo" cx="50" cy="50" r="18" {...LINE} />
      <circle className="emb-echo" style={delay(0.8)} cx="50" cy="50" r="18" {...LINE} />
      <circle className="emb-echo e-accent" style={delay(1.6)} cx="50" cy="50" r="18" {...THIN} />
    </>
  ),

  /* Explosão contida: raios curtos em torno de um núcleo. */
  'capita-marvel': () => (
    <>
      <g className="emb-pulse">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="50" y1="24" x2="50" y2="12"
            {...LINE}
            transform={`rotate(${angle} 50 50)`}
          />
        ))}
      </g>
      <circle className="emb-pulse e-accent" style={delay(0.4)} cx="50" cy="50" r="14" {...LINE} />
    </>
  ),

  /* Avanço: galões subindo em sequência. */
  'capitao-america': () => (
    <>
      <path className="emb-rise" d="M26 62 50 40l24 22" {...LINE} />
      <path className="emb-rise e-accent" style={delay(0.8)} d="M26 62 50 40l24 22" {...LINE} />
      <path className="emb-rise" style={delay(1.6)} d="M26 62 50 40l24 22" {...THIN} />
    </>
  ),

  /* Circuito: pulso percorrendo uma trilha. */
  ciborgue: () => (
    <>
      <path d="M16 30h24l12 12h32M16 70h20l14-14" {...THIN} opacity="0.35" />
      <path className="emb-travel" d="M16 30h24l12 12h32" {...LINE} />
      <path className="emb-travel e-accent" style={delay(1.1)} d="M16 70h20l14-14" {...LINE} />
      <circle cx="84" cy="42" r="3.5" fill="currentColor" className="emb-pulse" />
    </>
  ),

  /* Anéis concêntricos girando em sentidos opostos. */
  'doutor-estranho': () => (
    <>
      <circle className="emb-spin" cx="50" cy="50" r="34" {...THIN} strokeDasharray="10 8" />
      <circle className="emb-spin-rev e-accent" cx="50" cy="50" r="24" {...THIN} strokeDasharray="6 10" />
      <circle className="emb-pulse" cx="50" cy="50" r="12" {...LINE} />
    </>
  ),

  /* Caos: arcos contrários e partículas soltas. */
  'feiticeira-escarlate': () => (
    <>
      <path className="emb-spin" d="M50 16a34 34 0 0 1 34 34" {...LINE} />
      <path className="emb-spin-rev e-accent" d="M50 84a34 34 0 0 1-34-34" {...LINE} />
      <circle className="emb-pulse" cx="50" cy="50" r="8" {...THIN} />
      <circle className="emb-drift" cx="50" cy="30" r="2.5" fill="currentColor" />
      <circle className="emb-drift" style={delay(1.4)} cx="50" cy="70" r="2" fill="currentColor" />
    </>
  ),

  /* Velocidade: rastros horizontais e o eco de quem já passou. */
  flash: () => (
    <>
      <path className="emb-drift" d="M20 34h40" {...LINE} />
      <path className="emb-drift e-accent" style={delay(0.35)} d="M14 50h52" {...LINE} />
      <path className="emb-drift" style={delay(0.7)} d="M22 66h34" {...THIN} />
      <path className="emb-blink" d="M58 26 44 52h12l-6 22 20-30H58l6-18z" {...THIN} />
    </>
  ),

  /* Trajetória: a flecha desenha o arco até o alvo. */
  'gaviao-arqueiro': () => (
    <>
      <path className="emb-dash" d="M12 76Q42 8 84 34" {...LINE} />
      <circle className="emb-pulse e-accent" cx="84" cy="34" r="12" {...THIN} />
      <circle cx="84" cy="34" r="3" fill="currentColor" />
    </>
  ),

  /* Núcleo: reator concêntrico pulsando. */
  'homem-de-ferro': () => (
    <>
      <circle className="emb-spin" cx="50" cy="50" r="30" {...THIN} strokeDasharray="4 7" />
      <circle className="emb-pulse" cx="50" cy="50" r="20" {...LINE} />
      <path className="emb-pulse e-accent" style={delay(0.5)} d="M50 38 62 58H38z" {...LINE} />
    </>
  ),

  /* Teia: raios e anéis, com um tremor percorrendo o fio. */
  'homem-aranha': () => (
    <>
      {[0, 60, 120].map((angle) => (
        <line key={angle} x1="14" y1="50" x2="86" y2="50" {...THIN} transform={`rotate(${angle} 50 50)`} opacity="0.5" />
      ))}
      <path className="emb-pulse" d="M50 22 74 50 50 78 26 50z" {...LINE} />
      <path className="emb-pulse e-accent" style={delay(0.6)} d="M50 36 64 50 50 64 36 50z" {...THIN} />
    </>
  ),

  /* Impacto: ondas de choque saindo do golpe. */
  hulk: () => (
    <>
      <path className="emb-blink" d="M38 30l10 16-8 4 12 20-4-18 8-3-8-19z" {...LINE} />
      <circle className="emb-echo" cx="50" cy="50" r="22" {...THIN} />
      <circle className="emb-echo e-accent" style={delay(1.2)} cx="50" cy="50" r="22" {...THIN} />
    </>
  ),

  /* Vontade: o anel se fecha e projeta um facho. */
  'lanterna-verde': () => (
    <>
      <circle className="emb-sweep" cx="50" cy="50" r="26" {...LINE} />
      <path className="emb-pulse e-accent" d="M50 24V10M50 90V76M24 50H10M90 50H76" {...THIN} />
    </>
  ),

  /* Travessia: a forma some e reaparece atrás do próprio contorno. */
  'martian-manhunter': () => (
    <>
      <path className="emb-blink" d="M50 18c14 0 22 12 22 26S62 82 50 82 28 58 28 44 36 18 50 18z" {...LINE} />
      <path d="M50 18c14 0 22 12 22 26S62 82 50 82 28 58 28 44 36 18 50 18z" {...THIN} opacity="0.25" />
      <circle className="emb-pulse e-accent" cx="50" cy="46" r="10" {...THIN} />
    </>
  ),

  /* Laço: espiral que gira sem fim. */
  'mulher-maravilha': () => (
    <g className="emb-spin">
      <path d="M50 14a36 36 0 1 1-.1 0" {...THIN} strokeDasharray="8 6" />
      <path d="M50 26a24 24 0 1 1-.1 0" {...LINE} strokeDasharray="60 30" />
      <path className="e-accent" d="M50 38a12 12 0 1 1-.1 0" {...THIN} />
    </g>
  ),

  /* Garras: três riscos abrindo em sequência. */
  'pantera-negra': () => (
    <>
      <path className="emb-dash" d="M28 20Q34 50 26 80" {...LINE} />
      <path className="emb-dash" style={delay(0.25)} d="M50 16Q56 50 48 84" {...LINE} />
      <path className="emb-dash e-accent" style={delay(0.5)} d="M72 20Q78 50 70 80" {...LINE} />
    </>
  ),

  /* Raio: a descarga e o clarão que sobra. */
  shazam: () => (
    <>
      <path className="emb-blink" d="M56 14 32 54h16l-6 32 26-44H50l6-28z" {...LINE} />
      <circle className="emb-echo e-accent" cx="50" cy="50" r="26" {...THIN} />
    </>
  ),

  /* Voo: a esteira subindo. */
  superman: () => (
    <>
      <path className="emb-rise" d="M32 66 50 44l18 22" {...LINE} />
      <path className="emb-rise e-accent" style={delay(0.7)} d="M38 72 50 56l12 16" {...THIN} />
      <line className="emb-drift" x1="20" y1="80" x2="44" y2="80" {...THIN} />
    </>
  ),

  /* Tempestade: arcos elétricos entre dois pontos. */
  thor: () => (
    <>
      <path className="emb-blink" d="M34 20 52 46H40l14 34-6-30h12L34 20z" {...LINE} />
      <circle className="emb-spin" cx="50" cy="50" r="32" {...THIN} strokeDasharray="3 12" />
      <path className="emb-blink e-accent" style={delay(1.1)} d="M22 62q14 8 28 0t28 0" {...THIN} />
    </>
  ),

  /* Prisma: a pedra e o facho que atravessa. */
  visao: () => (
    <>
      <path className="emb-pulse" d="M50 18 78 34v32L50 82 22 66V34z" {...LINE} />
      <line className="emb-drift e-accent" x1="26" y1="50" x2="74" y2="50" {...LINE} />
      <circle cx="50" cy="50" r="5" fill="currentColor" className="emb-pulse" style={delay(0.4)} />
    </>
  ),

  /* Mira: retículo girando sobre o alvo. */
  'viuva-negra': () => (
    <>
      <circle className="emb-spin" cx="50" cy="50" r="30" {...THIN} strokeDasharray="14 10" />
      <circle className="emb-pulse" cx="50" cy="50" r="16" {...LINE} />
      <path className="e-accent" d="M50 12v14M50 74v14M12 50h14M74 50h14" {...THIN} />
    </>
  ),
}

/** Temas básicos não têm herói: fica a marca do próprio site, o par de colchetes. */
function DefaultMotif() {
  return (
    <>
      <path className="emb-pulse" d="M40 24H26v52h14" {...LINE} />
      <path className="emb-pulse" style={delay(0.3)} d="M60 24h14v52H60" {...LINE} />
      <line className="emb-blink e-accent" x1="50" y1="42" x2="50" y2="58" {...LINE} />
    </>
  )
}

export function HeroEmblem() {
  const { theme } = useTheme()
  const Motif = MOTIFS[theme.id]

  return (
    <svg
      className="hero-emblem"
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Emblema do tema ${theme.label}`}
      // A troca de tema remonta o desenho, para as animações recomeçarem juntas em vez de
      // herdarem a fase do emblema anterior.
      key={theme.id}
    >
      {Motif ? <Motif /> : <DefaultMotif />}
    </svg>
  )
}
