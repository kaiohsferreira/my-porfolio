import { useScrollReveal } from '@/hooks/useScrollReveal'
import { Hero }         from '@/sections/Hero'
import { About }        from '@/sections/About'
import { Skills }       from '@/sections/Skills'
import { Experience }   from '@/sections/Experience'
import { Projects }     from '@/sections/Projects'
import { Contact }      from '@/sections/Contact'
import { Navbar }       from '@/components/layout/Navbar'
import { Footer }       from '@/components/layout/Footer'
import { CustomCursor } from '@/components/layout/CustomCursor'

export function PortfolioPage() {
  useScrollReveal()

  return (
    <>
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
