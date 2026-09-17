import {
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'

/**
 * A escultura da abertura: uma esfera cujos vértices respiram por uma soma de senos e reagem ao
 * mouse. Fica em módulo próprio para o Three.js entrar só por import dinâmico, depois da página.
 *
 * As intensidades das luzes estão multiplicadas por π em relação ao exemplo aprovado, que usava
 * uma versão antiga do Three: desde a r155 a iluminação é fisicamente correta e os mesmos números
 * sairiam três vezes mais escuros.
 */
export function mountBlob(host: HTMLElement) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.setClearColor(0x000000, 0)
  host.appendChild(renderer.domElement)
  host.classList.add('has-canvas')

  const scene = new Scene()
  const camera = new PerspectiveCamera(35, 1, 0.1, 100)
  camera.position.z = 5

  scene.add(new HemisphereLight(0xffffff, 0xcfc6ec, 2.2))
  const key = new DirectionalLight(0xffffff, 2.8)
  key.position.set(-3, 4, 5)
  scene.add(key)
  const rim = new PointLight(0x5a93ad, 4.7, 12, 0)
  rim.position.set(3, -2, 3)
  scene.add(rim)

  const geometry = new SphereGeometry(1.15, 64, 64)
  const position = geometry.attributes.position
  const base = Float32Array.from(position.array as ArrayLike<number>)
  const material = new MeshStandardMaterial({ color: 0x8676c8, roughness: 0.28, metalness: 0.12 })
  const blob = new Mesh(geometry, material)
  scene.add(blob)

  const resize = () => {
    const w = host.clientWidth
    const h = host.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  const observer = new ResizeObserver(resize)
  observer.observe(host)

  const pointer = { x: 0, y: 0 }
  const onPointer = (event: PointerEvent) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -((event.clientY / window.innerHeight) * 2 - 1)
  }
  window.addEventListener('pointermove', onPointer)

  const v = new Vector3()
  let t = 0

  const draw = () => {
    const array = position.array as Float32Array
    const amp = 0.1 + Math.abs(pointer.x) * 0.07
    for (let i = 0; i < array.length; i += 3) {
      v.set(base[i], base[i + 1], base[i + 2]).normalize()
      const n = Math.sin(v.x * 3 + t) * Math.sin(v.y * 3.4 + t * 1.3) * Math.sin(v.z * 2.8 + t * 0.8)
      const s = 1 + n * amp
      array[i] = base[i] * s
      array[i + 1] = base[i + 1] * s
      array[i + 2] = base[i + 2] * s
    }
    position.needsUpdate = true
    geometry.computeVertexNormals()
    blob.rotation.y += 0.003
    blob.rotation.x += (pointer.y * 0.4 - blob.rotation.x) * 0.05
    renderer.render(scene, camera)
  }

  const card = host.closest<HTMLElement>('.depth-card')
  let frame = 0

  // Quem pede menos movimento vê a forma parada, num único quadro.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    draw()
    return dispose
  }

  const loop = () => {
    frame = requestAnimationFrame(loop)
    // Longe da abertura o cartão some; não vale gastar a placa de vídeo com o que ninguém vê.
    // Opacidade baixa já é a forma indo embora: parar ali poupa a CPU justo na viagem até a próxima seção.
    if (document.hidden || card?.style.visibility === 'hidden' || Number(card?.style.opacity || 1) < 0.5) return
    t += 0.012
    draw()
  }
  loop()

  function dispose() {
    cancelAnimationFrame(frame)
    observer.disconnect()
    window.removeEventListener('pointermove', onPointer)
    geometry.dispose()
    material.dispose()
    renderer.dispose()
    renderer.domElement.remove()
    host.classList.remove('has-canvas')
  }

  return dispose
}
