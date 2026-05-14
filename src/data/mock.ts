import type { Experience, Message, Project, Skill, SocialLink, Visitor } from '@/types'

export const MOCK_PROJECTS: Project[] = [
  { id: 1, title: 'DevFlow API', desc: 'REST API para gerenciamento de pipelines CI/CD com autenticacao JWT e rate limiting.', tags: ['Node.js', 'TypeScript', 'PostgreSQL'], repo: 'github.com/kaio/devflow', liveUrl: '', featured: true, status: 'published', thumb: null },
  { id: 2, title: 'Orbit UI Kit', desc: 'Design system com 40+ componentes React acessiveis, documentado com Storybook.', tags: ['React', 'Storybook', 'WCAG'], repo: 'github.com/kaio/orbit', liveUrl: '', featured: true, status: 'published', thumb: null },
  { id: 3, title: 'NexChat', desc: 'Aplicativo de chat em tempo real com WebSockets, rooms e criptografia E2E.', tags: ['Socket.io', 'Redis', 'React'], repo: 'github.com/kaio/nexchat', liveUrl: '', featured: false, status: 'draft', thumb: null },
  { id: 4, title: 'Codebase AI', desc: 'Extensao VSCode que usa LLM para sugerir refatoracoes e detectar code smells.', tags: ['Python', 'LLM', 'VSCode API'], repo: 'github.com/kaio/codebase-ai', liveUrl: '', featured: false, status: 'published', thumb: null },
]

export const MOCK_SKILLS: Skill[] = [
  { id: 1, name: 'TypeScript', category: 'Linguagens', iconName: 'typescript', level: 92, sortOrder: 1 },
  { id: 2, name: 'React', category: 'Frontend', iconName: 'react', level: 90, sortOrder: 2 },
  { id: 3, name: 'Node.js', category: 'Backend', iconName: 'nodejs', level: 85, sortOrder: 3 },
  { id: 4, name: 'PostgreSQL', category: 'Banco de Dados', iconName: 'postgresql', level: 78, sortOrder: 4 },
]

export const MOCK_EXPERIENCES: Experience[] = [
  { id: 1, role: 'Software Engineer', company: 'TechCorp', period: '2023 - Atual', desc: 'Desenvolvimento de APIs RESTful e microsservicos em Node.js e TypeScript.', sortOrder: 1 },
  { id: 2, role: 'Frontend Developer', company: 'StartupX', period: '2022 - 2023', desc: 'Construcao do design system e interfaces com React e Next.js.', sortOrder: 2 },
]

export const MOCK_MESSAGES: Message[] = [
  { id: 1, name: 'Rafael Mendes', email: 'rafael@email.com', msg: 'Oi Kaio, adorei seu portfolio! Tenho uma oportunidade freelance de dev fullstack para discutir.', date: '2025-05-01', read: false },
  { id: 2, name: 'Ana Silva', email: 'ana@techco.com', msg: 'Ola! Sua stack e exatamente o que precisamos. Poderia agendar uma conversa?', date: '2025-05-02', read: false },
]

export const MOCK_VISITORS: Visitor[] = [
  { id: 1, country: 'Brasil', city: 'Sao Paulo', page: '/projects', time: 'Agora', device: 'Desktop' },
  { id: 2, country: 'Portugal', city: 'Lisboa', page: '/', time: '3 min', device: 'Mobile' },
]

export const MOCK_LINKS: SocialLink[] = [
  { id: 1, label: 'GitHub', url: 'https://github.com/kaio', icon: 'github' },
  { id: 2, label: 'LinkedIn', url: 'https://linkedin.com/in/kaio', icon: 'linkedin' },
]
