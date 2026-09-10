const ICONIFY_API_BASE_URL = 'https://api.iconify.design'
const DEFAULT_ICON_SEARCH_LIMIT = 36
/**
 * Conjuntos de marcas primeiro: para uma tecnologia com logo, e ele que se quer ver.
 *
 * Os conjuntos genericos vem depois porque boa parte das habilidades nao e produto nenhum —
 * 'Clean Architecture', 'REST API', 'LINQ' — e sem eles a busca nao devolvia nada, deixando a
 * habilidade sem icone e o carrossel com um buraco.
 */
const DEFAULT_ICON_PREFIXES = [
  'devicon',
  'devicon-plain',
  'skill-icons',
  'logos',
  'simple-icons',
  'vscode-icons',
  'tabler',
  'lucide',
  'mdi',
  'ph',
]

interface IconifySearchResponse {
  icons?: string[]
}

export interface SkillIconSearchResult {
  iconName: string
  sourceIcon: string
  svgUrl: string
}

function toNormalizedIconName(value: string) {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return ''
  const segments = normalized.split(':')
  return (segments.at(-1) || normalized).trim()
}

export function normalizeSkillIconName(value: string) {
  return toNormalizedIconName(value)
}

export function getIconifyIconUrl(name: string, options?: { height?: number; color?: string }) {
  const encodedName = encodeURIComponent(name)
  const params = new URLSearchParams()

  if (options?.height) params.set('height', String(options.height))
  if (options?.color) params.set('color', options.color)

  const query = params.toString()
  return `${ICONIFY_API_BASE_URL}/${encodedName}.svg${query ? `?${query}` : ''}`
}

export function getSkillIconCandidates(iconName: string) {
  const normalized = normalizeSkillIconName(iconName)
  if (!normalized) return []

  const directCandidates = iconName.includes(':')
    ? [iconName.trim().toLowerCase()]
    : []

  const prefixedCandidates = DEFAULT_ICON_PREFIXES.map((prefix) => `${prefix}:${normalized}`)
  return Array.from(new Set([...directCandidates, ...prefixedCandidates]))
}

export function getSkillIconUrls(iconName: string, size = 28) {
  return getSkillIconCandidates(iconName).map((candidate) => getIconifyIconUrl(candidate, { height: size }))
}

function stripAccents(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Ponte para o catálogo da Iconify, que é todo em inglês, enquanto as habilidades aqui são
 * cadastradas em português. Sem isso "Servidores" ou "Segurança da Informação" não devolvem
 * nada e a habilidade fica sem ícone.
 */
const PT_EN_HINTS: Record<string, string> = {
  seguranca: 'security',
  informacao: 'information',
  redes: 'network',
  rede: 'network',
  servidores: 'server',
  servidor: 'server',
  monitoramento: 'monitor',
  infraestrutura: 'server',
  banco: 'database',
  dados: 'database',
  nuvem: 'cloud',
  testes: 'test',
  teste: 'test',
  arquitetura: 'architecture',
  validacao: 'check',
  desempenho: 'speed',
  mensageria: 'message',
  autenticacao: 'lock',
  criptografia: 'lock',
  versionamento: 'git',
  implantacao: 'rocket',
  acessibilidade: 'accessibility',
  cftv: 'cctv',
  lgpd: 'shield-lock',
}

async function fetchIcons(term: string, limit: number, prefixes: string[]) {
  const params = new URLSearchParams({
    query: term,
    limit: String(limit),
    prefixes: prefixes.join(','),
  })

  const response = await fetch(`${ICONIFY_API_BASE_URL}/search?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Nao foi possivel buscar icones agora.')
  }

  const data = (await response.json()) as IconifySearchResponse
  return data.icons ?? []
}

export async function searchSkillIcons(query: string, options?: { limit?: number; prefixes?: string[] }) {
  const normalizedQuery = query.trim()
  if (normalizedQuery.length < 2) return []

  const limit = options?.limit ?? DEFAULT_ICON_SEARCH_LIMIT
  const prefixes = options?.prefixes ?? DEFAULT_ICON_PREFIXES

  let icons = await fetchIcons(normalizedQuery, limit, prefixes)

  /**
   * A busca da Iconify trata o termo como um nome so, entao habilidade de nome composto
   * ("REST API", "Clean Architecture") nao devolve nada. Nesse caso tento palavra por palavra,
   * da mais longa para a mais curta, que e a com mais chance de ser o assunto.
   */
  if (!icons.length) {
    const words = normalizedQuery
      .split(/[\s/_-]+/)
      .map((word) => word.trim())
      .filter((word) => word.length >= 3)
      .sort((a, b) => b.length - a.length)

    // A palavra como foi escrita primeiro; a tradução depois, porque o catálogo da Iconify é
    // todo em inglês e as habilidades aqui são cadastradas em português.
    const terms: string[] = []
    for (const word of words) {
      terms.push(word)
      const hint = PT_EN_HINTS[stripAccents(word.toLowerCase())]
      if (hint) terms.push(hint)
    }

    for (const term of terms) {
      icons = await fetchIcons(term, limit, prefixes)
      if (icons.length) break
    }
  }

  const byName = new Map<string, SkillIconSearchResult>()

  for (const icon of icons) {
    const iconName = normalizeSkillIconName(icon)
    if (!iconName || byName.has(iconName)) continue

    byName.set(iconName, {
      iconName,
      sourceIcon: icon,
      svgUrl: getIconifyIconUrl(icon, { height: 28 }),
    })
  }

  return Array.from(byName.values())
}

/**
 * Iniciais para a habilidade que nao encontrou icone nenhum.
 *
 * Nome composto entrega a inicial das duas primeiras palavras ("Clean Architecture" vira CA);
 * palavra unica entrega as duas primeiras letras ("LINQ" vira LI). E melhor uma marca desenhada
 * de proposito do que um quadrado vazio no meio do carrossel.
 */
/** Palavras de ligação não dizem nada nas iniciais: "Infraestrutura de Redes" é IR, não ID. */
const INITIALS_STOPWORDS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'para', 'com',
  'of', 'the', 'and', 'in', 'for',
])

export function getSkillInitials(name: string) {
  const words = name
    .trim()
    .split(/[\s/_-]+/)
    .filter(Boolean)

  if (!words.length) return '?'

  const meaningful = words.filter((word) => !INITIALS_STOPWORDS.has(stripAccents(word.toLowerCase())))
  const chosen = meaningful.length ? meaningful : words

  if (chosen.length === 1) return chosen[0].slice(0, 2).toUpperCase()

  return (chosen[0][0] + chosen[1][0]).toUpperCase()
}
