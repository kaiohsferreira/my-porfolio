const ICONIFY_API_BASE_URL = 'https://api.iconify.design'
const DEFAULT_ICON_SEARCH_LIMIT = 36
const DEFAULT_ICON_PREFIXES = [
  'devicon',
  'devicon-plain',
  'skill-icons',
  'logos',
  'simple-icons',
  'vscode-icons',
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

export async function searchSkillIcons(query: string, options?: { limit?: number; prefixes?: string[] }) {
  const normalizedQuery = query.trim()
  if (normalizedQuery.length < 2) return []

  const params = new URLSearchParams({
    query: normalizedQuery,
    limit: String(options?.limit ?? DEFAULT_ICON_SEARCH_LIMIT),
    prefixes: (options?.prefixes ?? DEFAULT_ICON_PREFIXES).join(','),
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
  const byName = new Map<string, SkillIconSearchResult>()

  for (const icon of data.icons ?? []) {
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
