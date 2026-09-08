/**
 * Marca as URLs que o portfólio embute (capa do card e modal de prévia).
 *
 * O parâmetro existe por causa do cache HTTP: quem visitou um projeto antes de ele liberar o
 * enquadramento guardou a resposta antiga JUNTO COM os cabeçalhos dela, e o navegador continua
 * recusando o iframe mesmo depois de o servidor passar a permitir. Como a chave do cache inclui
 * a query, uma URL diferente força uma busca nova e os cabeçalhos atuais valem já na primeira
 * visita — sem depender de o visitante dar Ctrl+Shift+R.
 *
 * O valor é fixo de propósito: variável (timestamp) desligaria o cache para sempre.
 */
const PREVIEW_PARAM = 'embed'
const PREVIEW_VALUE = 'portfolio'

export function buildPreviewUrl(url: string | null): string | null {
  if (!url) return null

  try {
    const parsed = new URL(url)
    parsed.searchParams.set(PREVIEW_PARAM, PREVIEW_VALUE)
    return parsed.href
  } catch {
    // URL malformada vinda do cadastro: devolvo como está e deixo o iframe falhar sozinho,
    // em vez de derrubar a renderização do card inteiro.
    return url
  }
}
