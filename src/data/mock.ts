import type { Project, Skill, Experience, Message, Visitor, SocialLink } from '@/types'

export const MOCK_PROJECTS: Project[] = [
  { id: 1, title: 'DevFlow API', desc: 'REST API para gerenciamento de pipelines CI/CD com autenticação JWT e rate limiting.', tags: ['Node.js', 'TypeScript', 'PostgreSQL'], repo: 'github.com/kaio/devflow', featured: true, status: 'published', thumb: null },
  { id: 2, title: 'Orbit UI Kit', desc: 'Design system com 40+ componentes React acessíveis, documentado com Storybook.', tags: ['React', 'Storybook', 'WCAG'], repo: 'github.com/kaio/orbit', featured: true, status: 'published', thumb: null },
  { id: 3, title: 'NexChat', desc: 'Aplicativo de chat em tempo real com WebSockets, rooms e criptografia E2E.', tags: ['Socket.io', 'Redis', 'React'], repo: 'github.com/kaio/nexchat', featured: false, status: 'draft', thumb: null },
  { id: 4, title: 'Codebase AI', desc: 'Extensão VSCode que usa LLM para sugerir refatorações e detectar code smells.', tags: ['Python', 'LLM', 'VSCode API'], repo: 'github.com/kaio/codebase-ai', featured: false, status: 'published', thumb: null },
]

export const MOCK_SKILLS: Skill[] = [
  { id: 1, name: 'TypeScript', category: 'Linguagens', level: 92 },
  { id: 2, name: 'React', category: 'Frontend', level: 90 },
  { id: 3, name: 'Node.js', category: 'Backend', level: 85 },
  { id: 4, name: 'PostgreSQL', category: 'Banco de Dados', level: 78 },
  { id: 5, name: 'Docker', category: 'DevOps', level: 72 },
  { id: 6, name: 'Python', category: 'Linguagens', level: 70 },
  { id: 7, name: 'Redis', category: 'Banco de Dados', level: 68 },
  { id: 8, name: 'Kubernetes', category: 'DevOps', level: 55 },
]

export const MOCK_EXPERIENCES: Experience[] = [
  { id: 1, role: 'Software Engineer', company: 'TechCorp', period: '2023 — Atual', desc: 'Desenvolvimento de APIs RESTful e microsserviços em Node.js e TypeScript.' },
  { id: 2, role: 'Frontend Developer', company: 'StartupX', period: '2022 — 2023', desc: 'Construção do design system e interfaces com React e Next.js.' },
]

export const MOCK_MESSAGES: Message[] = [
  { id: 1, name: 'Rafael Mendes', email: 'rafael@email.com', msg: 'Oi Kaio, adorei seu portfólio! Tenho uma oportunidade freelance de dev fullstack para discutir.', date: '2025-05-01', read: false },
  { id: 2, name: 'Ana Silva', email: 'ana@techco.com', msg: 'Olá! Sua stack é exatamente o que precisamos. Poderia agendar uma conversa?', date: '2025-05-02', read: false },
  { id: 3, name: 'Lucas Ferreira', email: 'lucas@dev.io', msg: 'Cara, esse projeto do NexChat é impressionante. Você usa Redis Pub/Sub?', date: '2025-04-29', read: true },
  { id: 4, name: 'Carla Torres', email: 'carla@agencia.com', msg: 'Oi Kaio, temos um projeto de médio porte para um cliente no setor financeiro.', date: '2025-04-28', read: true },
]

export const MOCK_VISITORS: Visitor[] = [
  { id: 1, country: 'Brasil', city: 'São Paulo', page: '/projects', time: 'Agora', device: 'Desktop' },
  { id: 2, country: 'Portugal', city: 'Lisboa', page: '/', time: '3 min', device: 'Mobile' },
  { id: 3, country: 'EUA', city: 'Austin', page: '/about', time: '8 min', device: 'Desktop' },
  { id: 4, country: 'Argentina', city: 'Buenos Aires', page: '/projects', time: '15 min', device: 'Tablet' },
  { id: 5, country: 'Brasil', city: 'Belo Horizonte', page: '/', time: '22 min', device: 'Mobile' },
]

export const MOCK_LINKS: SocialLink[] = [
  { id: 1, label: 'GitHub', url: 'https://github.com/kaio', icon: 'github' },
  { id: 2, label: 'LinkedIn', url: 'https://linkedin.com/in/kaio', icon: 'linkedin' },
]
