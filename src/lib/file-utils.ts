export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error(`Nao foi possivel ler o arquivo ${file.name}`))

    reader.readAsDataURL(file)
  })
}
