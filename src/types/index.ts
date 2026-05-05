export interface Project {
  id: number
  title: string
  desc: string
  tags: string[]
  repo: string
  featured: boolean
  status: 'published' | 'draft'
  thumb: string | null
}

export interface Skill {
  id: number
  name: string
  category: string
  level: number
}

export interface Experience {
  id: number
  role: string
  company: string
  period: string
  desc: string
}

export interface Message {
  id: number
  name: string
  email: string
  msg: string
  date: string
  read: boolean
}

export interface Visitor {
  id: number
  country: string
  city: string
  page: string
  time: string
  device: 'Desktop' | 'Mobile' | 'Tablet'
}

export interface SocialLink {
  id: number
  label: string
  url: string
  icon: string
}

export type Theme = 'green' | 'cyan' | 'purple' | 'orange' | 'red' | 'blue'

export type Language = 'pt' | 'en'
