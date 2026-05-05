import { useEffect, useRef } from 'react'
import type { Language } from '@/types'

const WORDS: Record<Language, string[]> = {
  pt: ['"Desenvolvedor Web"', '"Técnico em TI"', '"Entusiasta de Games"', '"Criativo & Focado"'],
  en: ['"Web Developer"', '"IT Technician"', '"Game Enthusiast"', '"Creative & Focused"'],
}

export function useTyped(ref: React.RefObject<HTMLSpanElement | null>, lang: Language) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const words = WORDS[lang]
    let wordIdx = 0
    let charIdx = 0
    let deleting = false
    let pause = 0

    function tick() {
      if (pause > 0) {
        pause--
        timer.current = setTimeout(tick, 50)
        return
      }
      const word = words[wordIdx]
      if (!deleting) {
        el!.textContent = word.slice(0, ++charIdx)
        if (charIdx === word.length) { deleting = true; pause = 40 }
        timer.current = setTimeout(tick, 60)
      } else {
        el!.textContent = word.slice(0, --charIdx)
        if (charIdx === 0) { deleting = false; wordIdx = (wordIdx + 1) % words.length; pause = 10 }
        timer.current = setTimeout(tick, 35)
      }
    }

    tick()
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [ref, lang])
}
