export const SKILLS_DATA = [
  { name: 'HTML5',      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
  { name: 'CSS3',       icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
  { name: 'JavaScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { name: 'C#',         icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg' },
  { name: 'Python',     icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { name: 'MySQL',      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
  { name: 'Unity',      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/unity/unity-original.svg', filterStyle: 'invert(1) brightness(0.7)' },
  { name: 'Git',        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
  { name: 'GitHub',     icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg', filterStyle: 'invert(0.8)' },
  { name: 'VS Code',    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg' },
]

export interface ProjectData {
  id: number
  name: string
  type: { pt: string; en: string }
  desc: { pt: string; en: string }
  tags: string[]
}

export const PROJECTS_DATA: ProjectData[] = [
  {
    id: 1,
    name: 'Site COTEMIG',
    type: { pt: 'Acadêmico', en: 'Academic' },
    desc: {
      pt: 'Réplica do site institucional da COTEMIG, desenvolvida como projeto acadêmico com foco em fidelidade visual.',
      en: 'Replica of the COTEMIG institutional website, developed as an academic project focused on visual fidelity.',
    },
    tags: ['HTML', 'CSS', 'JS'],
  },
  {
    id: 2,
    name: 'Site Chimper',
    type: { pt: 'Freestyle', en: 'Freestyle' },
    desc: {
      pt: 'Projeto freestyle explorando layouts modernos e técnicas avançadas de CSS.',
      en: 'Freestyle project exploring modern layouts and advanced CSS techniques.',
    },
    tags: ['HTML', 'CSS'],
  },
  {
    id: 3,
    name: 'Site Photosen',
    type: { pt: 'Freestyle', en: 'Freestyle' },
    desc: {
      pt: 'Site de fotografia com galeria interativa e foco em experiência visual imersiva.',
      en: 'Photography website with interactive gallery and focus on immersive visual experience.',
    },
    tags: ['HTML', 'CSS', 'JS'],
  },
]

export interface ThemeConfig {
  id: string
  label: string
  group: 'basic' | 'hero'
  bg: string
  bg2: string
  bg3: string
  surface: string
  border: string
  borderBright: string
  text: string
  textMuted: string
  textDim: string
  green: string
  cyan: string
  greenGlow: string
  cyanGlow: string
}

const DEFAULT_BASE: Pick<ThemeConfig, 'bg' | 'bg2' | 'bg3' | 'surface' | 'text' | 'textMuted' | 'textDim'> = {
  bg:        '#050508',
  bg2:       '#0a0a10',
  bg3:       '#0f0f18',
  surface:   '#12121c',
  text:      '#e8e8f0',
  textMuted: '#6b6b80',
  textDim:   '#3a3a4a',
}

export const THEMES: ThemeConfig[] = [
  /* ── BÁSICOS ── */
  {
    id: 'green', label: 'Padrão', group: 'basic',
    ...DEFAULT_BASE,
    border: 'rgba(255,255,255,0.06)', borderBright: 'rgba(255,255,255,0.12)',
    green: 'oklch(72% 0.25 160)', cyan: 'oklch(72% 0.25 220)',
    greenGlow: 'oklch(72% 0.25 160 / 0.15)', cyanGlow: 'oklch(72% 0.25 220 / 0.15)',
  },
  {
    id: 'cyan', label: 'Cyan', group: 'basic',
    ...DEFAULT_BASE,
    border: 'rgba(255,255,255,0.06)', borderBright: 'rgba(255,255,255,0.12)',
    green: 'oklch(72% 0.25 210)', cyan: 'oklch(72% 0.25 250)',
    greenGlow: 'oklch(72% 0.25 210 / 0.15)', cyanGlow: 'oklch(72% 0.25 250 / 0.15)',
  },
  {
    id: 'purple', label: 'Purple', group: 'basic',
    ...DEFAULT_BASE,
    border: 'rgba(255,255,255,0.06)', borderBright: 'rgba(255,255,255,0.12)',
    green: 'oklch(68% 0.25 300)', cyan: 'oklch(68% 0.25 330)',
    greenGlow: 'oklch(68% 0.25 300 / 0.15)', cyanGlow: 'oklch(68% 0.25 330 / 0.15)',
  },
  {
    id: 'orange', label: 'Orange', group: 'basic',
    ...DEFAULT_BASE,
    border: 'rgba(255,255,255,0.06)', borderBright: 'rgba(255,255,255,0.12)',
    green: 'oklch(72% 0.22 55)', cyan: 'oklch(72% 0.22 30)',
    greenGlow: 'oklch(72% 0.22 55 / 0.15)', cyanGlow: 'oklch(72% 0.22 30 / 0.15)',
  },
  {
    id: 'red', label: 'Red', group: 'basic',
    ...DEFAULT_BASE,
    border: 'rgba(255,255,255,0.06)', borderBright: 'rgba(255,255,255,0.12)',
    green: 'oklch(65% 0.25 20)', cyan: 'oklch(65% 0.25 0)',
    greenGlow: 'oklch(65% 0.25 20 / 0.15)', cyanGlow: 'oklch(65% 0.25 0 / 0.15)',
  },
  {
    id: 'blue', label: 'Blue', group: 'basic',
    ...DEFAULT_BASE,
    border: 'rgba(255,255,255,0.06)', borderBright: 'rgba(255,255,255,0.12)',
    green: 'oklch(68% 0.22 245)', cyan: 'oklch(68% 0.22 270)',
    greenGlow: 'oklch(68% 0.22 245 / 0.15)', cyanGlow: 'oklch(68% 0.22 270 / 0.15)',
  },

  /* ── HERÓIS ── */
  {
    id: 'ant-man', label: 'Ant-Man', group: 'hero',
    bg: '#060808', bg2: '#080c0c', bg3: '#0a1010', surface: '#0c1414',
    border: 'rgba(0,180,160,0.08)', borderBright: 'rgba(0,180,160,0.18)',
    text: '#d8f8f8', textMuted: '#408888', textDim: '#183838',
    green: 'oklch(68% 0.2 192)', cyan: 'oklch(78% 0.18 160)',
    greenGlow: 'oklch(68% 0.2 192 / 0.15)', cyanGlow: 'oklch(78% 0.18 160 / 0.15)',
  },
  {
    id: 'aquaman', label: 'Aquaman', group: 'hero',
    bg: '#020c10', bg2: '#030f14', bg3: '#05131a', surface: '#071820',
    border: 'rgba(0,180,220,0.08)', borderBright: 'rgba(0,180,220,0.18)',
    text: '#d8f4f8', textMuted: '#407888', textDim: '#1a3840',
    green: 'oklch(68% 0.22 210)', cyan: 'oklch(78% 0.2 85)',
    greenGlow: 'oklch(68% 0.22 210 / 0.15)', cyanGlow: 'oklch(78% 0.2 85 / 0.15)',
  },
  {
    id: 'batman', label: 'Batman', group: 'hero',
    bg: '#080808', bg2: '#0c0c0c', bg3: '#101010', surface: '#141414',
    border: 'rgba(255,220,80,0.07)', borderBright: 'rgba(255,220,80,0.15)',
    text: '#e8e6e0', textMuted: '#7a7570', textDim: '#3a3830',
    green: 'oklch(76% 0.17 88)', cyan: 'oklch(58% 0.06 260)',
    greenGlow: 'oklch(76% 0.17 88 / 0.15)', cyanGlow: 'oklch(58% 0.06 260 / 0.15)',
  },
  {
    id: 'capita-marvel', label: 'Capitã Marvel', group: 'hero',
    bg: '#080410', bg2: '#0c0618', bg3: '#100820', surface: '#140a28',
    border: 'rgba(255,180,0,0.08)', borderBright: 'rgba(255,180,0,0.18)',
    text: '#fff4d8', textMuted: '#907040', textDim: '#3a2810',
    green: 'oklch(80% 0.24 88)', cyan: 'oklch(58% 0.26 280)',
    greenGlow: 'oklch(80% 0.24 88 / 0.15)', cyanGlow: 'oklch(58% 0.26 280 / 0.15)',
  },
  {
    id: 'capitao-america', label: 'Capitão América', group: 'hero',
    bg: '#06080e', bg2: '#080b14', bg3: '#0b0e1a', surface: '#0e1220',
    border: 'rgba(60,100,220,0.1)', borderBright: 'rgba(60,100,220,0.22)',
    text: '#dde4f5', textMuted: '#5e72b0', textDim: '#28324a',
    green: 'oklch(55% 0.24 258)', cyan: 'oklch(62% 0.25 18)',
    greenGlow: 'oklch(55% 0.24 258 / 0.15)', cyanGlow: 'oklch(62% 0.25 18 / 0.15)',
  },
  {
    id: 'ciborgue', label: 'Ciborgue', group: 'hero',
    bg: '#060608', bg2: '#09090c', bg3: '#0c0c10', surface: '#101015',
    border: 'rgba(80,160,255,0.08)', borderBright: 'rgba(80,160,255,0.18)',
    text: '#d8e8ff', textMuted: '#5070a0', textDim: '#202840',
    green: 'oklch(65% 0.22 248)', cyan: 'oklch(80% 0.18 200)',
    greenGlow: 'oklch(65% 0.22 248 / 0.15)', cyanGlow: 'oklch(80% 0.18 200 / 0.15)',
  },
  {
    id: 'doutor-estranho', label: 'Doutor Estranho', group: 'hero',
    bg: '#040608', bg2: '#060810', bg3: '#080a14', surface: '#0c0e1a',
    border: 'rgba(0,180,220,0.08)', borderBright: 'rgba(0,180,220,0.18)',
    text: '#d8f0ff', textMuted: '#406888', textDim: '#182838',
    green: 'oklch(68% 0.24 228)', cyan: 'oklch(72% 0.22 50)',
    greenGlow: 'oklch(68% 0.24 228 / 0.15)', cyanGlow: 'oklch(72% 0.22 50 / 0.15)',
  },
  {
    id: 'feiticeira-escarlate', label: 'Feiticeira Escarlate', group: 'hero',
    bg: '#080306', bg2: '#0c0408', bg3: '#10060c', surface: '#160810',
    border: 'rgba(200,0,80,0.08)', borderBright: 'rgba(200,0,80,0.18)',
    text: '#ffe0f0', textMuted: '#903060', textDim: '#3a1028',
    green: 'oklch(50% 0.28 358)', cyan: 'oklch(62% 0.26 340)',
    greenGlow: 'oklch(50% 0.28 358 / 0.15)', cyanGlow: 'oklch(62% 0.26 340 / 0.15)',
  },
  {
    id: 'flash', label: 'Flash', group: 'hero',
    bg: '#0a0500', bg2: '#0f0700', bg3: '#150900', surface: '#1a0b00',
    border: 'rgba(255,140,0,0.08)', borderBright: 'rgba(255,140,0,0.18)',
    text: '#fff0e0', textMuted: '#a07040', textDim: '#4a3010',
    green: 'oklch(72% 0.28 45)', cyan: 'oklch(85% 0.22 75)',
    greenGlow: 'oklch(72% 0.28 45 / 0.15)', cyanGlow: 'oklch(85% 0.22 75 / 0.15)',
  },
  {
    id: 'gaviao-arqueiro', label: 'Gavião Arqueiro', group: 'hero',
    bg: '#080700', bg2: '#0c0b00', bg3: '#100f00', surface: '#151300',
    border: 'rgba(180,160,0,0.08)', borderBright: 'rgba(180,160,0,0.18)',
    text: '#f8f0d0', textMuted: '#887840', textDim: '#383010',
    green: 'oklch(70% 0.2 88)', cyan: 'oklch(55% 0.12 60)',
    greenGlow: 'oklch(70% 0.2 88 / 0.15)', cyanGlow: 'oklch(55% 0.12 60 / 0.15)',
  },
  {
    id: 'homem-de-ferro', label: 'Homem de Ferro', group: 'hero',
    bg: '#0a0404', bg2: '#0f0606', bg3: '#140808', surface: '#1a0a0a',
    border: 'rgba(220,60,40,0.08)', borderBright: 'rgba(220,60,40,0.18)',
    text: '#ffe8e0', textMuted: '#a05050', textDim: '#4a1818',
    green: 'oklch(55% 0.28 25)', cyan: 'oklch(78% 0.22 60)',
    greenGlow: 'oklch(55% 0.28 25 / 0.15)', cyanGlow: 'oklch(78% 0.22 60 / 0.15)',
  },
  {
    id: 'homem-aranha', label: 'Homem-Aranha', group: 'hero',
    bg: '#080406', bg2: '#0c0608', bg3: '#10080c', surface: '#140a10',
    border: 'rgba(220,30,40,0.08)', borderBright: 'rgba(220,30,40,0.18)',
    text: '#ffe8e8', textMuted: '#904050', textDim: '#3a1820',
    green: 'oklch(52% 0.26 15)', cyan: 'oklch(65% 0.22 260)',
    greenGlow: 'oklch(52% 0.26 15 / 0.15)', cyanGlow: 'oklch(65% 0.22 260 / 0.15)',
  },
  {
    id: 'hulk', label: 'Hulk', group: 'hero',
    bg: '#040a04', bg2: '#060e06', bg3: '#081208', surface: '#0a160a',
    border: 'rgba(40,200,60,0.08)', borderBright: 'rgba(40,200,60,0.18)',
    text: '#d8ffd8', textMuted: '#3a8040', textDim: '#183018',
    green: 'oklch(65% 0.28 142)', cyan: 'oklch(80% 0.2 120)',
    greenGlow: 'oklch(65% 0.28 142 / 0.15)', cyanGlow: 'oklch(80% 0.2 120 / 0.15)',
  },
  {
    id: 'lanterna-verde', label: 'Lanterna Verde', group: 'hero',
    bg: '#030a04', bg2: '#040d05', bg3: '#061008', surface: '#081408',
    border: 'rgba(0,220,80,0.08)', borderBright: 'rgba(0,220,80,0.18)',
    text: '#e0f8e4', textMuted: '#3a8850', textDim: '#1a4020',
    green: 'oklch(72% 0.28 145)', cyan: 'oklch(88% 0.18 120)',
    greenGlow: 'oklch(72% 0.28 145 / 0.15)', cyanGlow: 'oklch(88% 0.18 120 / 0.15)',
  },
  {
    id: 'martian-manhunter', label: 'Martian Manhunter', group: 'hero',
    bg: '#080400', bg2: '#0d0600', bg3: '#120800', surface: '#180a00',
    border: 'rgba(200,60,0,0.08)', borderBright: 'rgba(200,60,0,0.18)',
    text: '#ffe8d8', textMuted: '#905040', textDim: '#3a1808',
    green: 'oklch(55% 0.26 30)', cyan: 'oklch(40% 0.2 280)',
    greenGlow: 'oklch(55% 0.26 30 / 0.15)', cyanGlow: 'oklch(40% 0.2 280 / 0.15)',
  },
  {
    id: 'mulher-maravilha', label: 'Mulher-Maravilha', group: 'hero',
    bg: '#08060a', bg2: '#0c0910', bg3: '#100d16', surface: '#150f1e',
    border: 'rgba(200,40,80,0.08)', borderBright: 'rgba(200,40,80,0.18)',
    text: '#f0e8f0', textMuted: '#8a6080', textDim: '#3a2840',
    green: 'oklch(52% 0.26 10)', cyan: 'oklch(72% 0.2 50)',
    greenGlow: 'oklch(52% 0.26 10 / 0.15)', cyanGlow: 'oklch(72% 0.2 50 / 0.15)',
  },
  {
    id: 'pantera-negra', label: 'Pantera Negra', group: 'hero',
    bg: '#050508', bg2: '#08080c', bg3: '#0b0b10', surface: '#0f0f16',
    border: 'rgba(160,100,255,0.08)', borderBright: 'rgba(160,100,255,0.18)',
    text: '#e8e0ff', textMuted: '#706090', textDim: '#2a2040',
    green: 'oklch(62% 0.24 300)', cyan: 'oklch(78% 0.2 280)',
    greenGlow: 'oklch(62% 0.24 300 / 0.15)', cyanGlow: 'oklch(78% 0.2 280 / 0.15)',
  },
  {
    id: 'shazam', label: 'Shazam', group: 'hero',
    bg: '#060510', bg2: '#09081a', bg3: '#0c0b20', surface: '#100f28',
    border: 'rgba(255,220,0,0.08)', borderBright: 'rgba(255,220,0,0.18)',
    text: '#fff8d0', textMuted: '#907830', textDim: '#3a3010',
    green: 'oklch(82% 0.22 92)', cyan: 'oklch(58% 0.26 280)',
    greenGlow: 'oklch(82% 0.22 92 / 0.15)', cyanGlow: 'oklch(58% 0.26 280 / 0.15)',
  },
  {
    id: 'superman', label: 'Superman', group: 'hero',
    bg: '#06080f', bg2: '#080b14', bg3: '#0b0f1a', surface: '#0e1220',
    border: 'rgba(100,130,255,0.08)', borderBright: 'rgba(100,130,255,0.16)',
    text: '#e8eaf8', textMuted: '#6872a8', textDim: '#2e3560',
    green: 'oklch(60% 0.28 25)', cyan: 'oklch(82% 0.22 95)',
    greenGlow: 'oklch(60% 0.28 25 / 0.15)', cyanGlow: 'oklch(82% 0.22 95 / 0.15)',
  },
  {
    id: 'thor', label: 'Thor', group: 'hero',
    bg: '#060810', bg2: '#080b16', bg3: '#0b0e1c', surface: '#0e1222',
    border: 'rgba(120,160,255,0.08)', borderBright: 'rgba(120,160,255,0.18)',
    text: '#e8ecff', textMuted: '#5868a0', textDim: '#242840',
    green: 'oklch(72% 0.2 270)', cyan: 'oklch(82% 0.18 90)',
    greenGlow: 'oklch(72% 0.2 270 / 0.15)', cyanGlow: 'oklch(82% 0.18 90 / 0.15)',
  },
  {
    id: 'visao', label: 'Visão', group: 'hero',
    bg: '#060408', bg2: '#09060c', bg3: '#0c0810', surface: '#100c16',
    border: 'rgba(180,0,60,0.08)', borderBright: 'rgba(180,0,60,0.18)',
    text: '#f0e0e8', textMuted: '#804060', textDim: '#302030',
    green: 'oklch(50% 0.26 10)', cyan: 'oklch(55% 0.2 280)',
    greenGlow: 'oklch(50% 0.26 10 / 0.15)', cyanGlow: 'oklch(55% 0.2 280 / 0.15)',
  },
  {
    id: 'viuva-negra', label: 'Viúva Negra', group: 'hero',
    bg: '#060606', bg2: '#090909', bg3: '#0c0c0c', surface: '#101010',
    border: 'rgba(180,0,0,0.08)', borderBright: 'rgba(180,0,0,0.18)',
    text: '#f0e8e8', textMuted: '#806060', textDim: '#3a2020',
    green: 'oklch(48% 0.26 18)', cyan: 'oklch(55% 0.08 0)',
    greenGlow: 'oklch(48% 0.26 18 / 0.15)', cyanGlow: 'oklch(55% 0.08 0 / 0.15)',
  },
]

export const BASIC_THEMES  = THEMES.filter((t) => t.group === 'basic')
export const HERO_THEMES   = THEMES.filter((t) => t.group === 'hero')
