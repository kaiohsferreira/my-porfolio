import { Hero } from '@/sections/Hero'
import { About } from '@/sections/About'
import { Skills } from '@/sections/Skills'
import { Projects } from '@/sections/Projects'
import { Contact } from '@/sections/Contact'
import { Navbar } from '@/components/layout/Navbar'
import { CustomCursor } from '@/components/layout/CustomCursor'

export function PortfolioPage() {
  return (
    <>
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
    </>
  )
}
