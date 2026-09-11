export const SKILLS_DATA = [
  { name: 'HTML5', iconName: 'html5' },
  { name: 'CSS3', iconName: 'css3' },
  { name: 'JavaScript', iconName: 'javascript' },
  { name: 'C#', iconName: 'csharp' },
  { name: 'Python', iconName: 'python' },
  { name: 'MySQL', iconName: 'mysql' },
  { name: 'Unity', iconName: 'unity' },
  { name: 'Git', iconName: 'git' },
  { name: 'GitHub', iconName: 'github' },
  { name: 'VS Code', iconName: 'vscode' },
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
