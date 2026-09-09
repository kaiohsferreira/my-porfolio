import { useEffect } from 'react'

/**
 * Revela os elementos .reveal quando eles entram na tela.
 *
 * O observador acompanha também o que nasce depois. A varredura acontecia só uma vez, na
 * montagem, e isso quebrava qualquer seção que dependa da API: ela entra no DOM quando a
 * resposta chega, muito depois deste efeito, e nunca era observada — ficava em opacity 0 para
 * sempre, ocupando espaço em branco na página. Foi exatamente o que aconteceu com a seção de
 * experiências, que só é renderizada quando existe experiência cadastrada.
 */
export function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    // Observar de novo um elemento já observado não tem efeito, então não preciso controlar
    // quem já passou por aqui.
    function observeInside(root: Element | Document) {
      root.querySelectorAll('.reveal:not(.visible)').forEach((el) => io.observe(el))
    }

    observeInside(document)

    const mo = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return
          if (node.matches('.reveal:not(.visible)')) io.observe(node)
          observeInside(node)
        })
      })
    })

    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
}
