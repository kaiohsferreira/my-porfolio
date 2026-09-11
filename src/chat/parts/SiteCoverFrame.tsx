import { useLayoutEffect, useRef, useState } from 'react'
import { buildPreviewUrl } from '@/lib/site-preview'

/**
 * Largura virtual do site dentro da capa. Renderizo em tamanho de desktop e reduzo por
 * transform: assim a capa mostra o layout que o visitante veria no computador, e não a versão
 * móvel espremida que um iframe de 500px receberia.
 */
const VIRTUAL_WIDTH = 1440
const ASPECT = 9 / 16

/**
 * Usa a própria página inicial do projeto como capa do card.
 *
 * É a alternativa a deixar o card sem imagem quando ninguém subiu uma capa no painel. Vale a
 * mesma restrição da prévia: só aparece em projeto cujo servidor permita ser enquadrado por
 * kaioferreira.com. Se o projeto recusar, o navegador põe a própria página de erro no lugar e
 * não há como perceber isso daqui.
 *
 * O frame é montado assim que a largura do card é conhecida — sem loading="lazy" e sem
 * IntersectionObserver. Os dois adiam a carga até o elemento "aparecer", e aqui o card vive
 * dentro do trilho do carrossel, que se desloca por transform: o que está fora da tela por
 * translação pode nunca ser considerado visível, e a capa ficaria eternamente vazia, sem erro
 * nenhum no console. Já perdi duas rodadas de depuração com exatamente esse sintoma. Como são
 * poucos projetos, carregar direto é mais barato do que a fragilidade.
 */
export function SiteCoverFrame({ url, name }: { url: string; name: string }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)

  useLayoutEffect(() => {
    const box = boxRef.current
    if (!box) return

    // Medida inicial no próprio layout, para não depender de o ResizeObserver entregar a
    // primeira notificação.
    const measure = (width: number) => {
      if (width > 0) setScale(width / VIRTUAL_WIDTH)
    }

    measure(box.getBoundingClientRect().width)

    const observer = new ResizeObserver(([entry]) => measure(entry.contentRect.width))
    observer.observe(box)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={boxRef} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {scale > 0 ? (
        <iframe
          src={buildPreviewUrl(url) ?? url}
          title={`${name} — capa`}
          tabIndex={-1}
          scrolling="no"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: VIRTUAL_WIDTH,
            height: VIRTUAL_WIDTH * ASPECT,
            border: 'none',
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            // A capa é ilustração: cliques e rolagem pertencem ao card, não ao site embutido.
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </div>
  )
}
