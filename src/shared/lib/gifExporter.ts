import { GIFEncoder, applyPalette, quantize } from 'gifenc'
import type { Diagram } from '../../features/diagram/domain/diagram'

const MAX_SIZE = { width: 960, height: 720 }
const FRAME_COUNT = 18
const FRAME_DELAY = 100
type Connector = { path: SVGPathElement; d: string; color: string; animated: boolean; current: boolean; both: boolean; label: string; labelX: number; labelY: number }

export const gifFileName = (title: string) => `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'diagrammaton'}.gif`

/** Captures the real HTML/SVG stage so the GIF preserves the editor layout and local vector icons. */
export async function createDiagramGif(stage: HTMLElement, diagram: Diagram) {
  const renderer = await createFrameRenderer(stage, diagram)
  const encoder = GIFEncoder()
  for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
    const pixels = renderer.render(frame / FRAME_COUNT)
    // A local palette preserves small icon and connector colors instead of allowing
    // the first frame's dark gradients to consume most of the GIF color table.
    const palette = quantize(pixels, 256)
    encoder.writeFrame(applyPalette(pixels, palette), renderer.canvas.width, renderer.canvas.height, { palette, delay: FRAME_DELAY, repeat: 0, dispose: 1 })
  }
  encoder.finish()
  return new Blob([encoder.bytesView()], { type: 'image/gif' })
}

/** Produces the exact opaque raster frame used by the encoder, useful for previews and regression tests. */
export async function renderDiagramGifFrame(stage: HTMLElement, diagram: Diagram, progress = 0) {
  const renderer = await createFrameRenderer(stage, diagram)
  renderer.render(progress)
  return renderer.canvas
}

async function createFrameRenderer(stage: HTMLElement, diagram: Diagram) {
  await document.fonts.ready
  const scale = Math.min(MAX_SIZE.width / diagram.width, MAX_SIZE.height / diagram.height, 1)
  const outputWidth = Math.max(1, Math.round(diagram.width * scale))
  const outputHeight = Math.max(1, Math.round(diagram.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = outputWidth
  canvas.height = outputHeight
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Canvas 2D is unavailable')
  const connectors = readConnectors(stage)
  const image = await renderStageImage(stage, diagram)
  const background = diagram.background === 'light' ? '#ffffff' : diagram.background === 'blueprint' ? '#0a2233' : diagram.background === 'electric' ? '#08191b' : '#0a0e12'
  return {
    canvas,
    render(progress: number) {
      context.globalCompositeOperation = 'copy'
      context.fillStyle = background
      context.fillRect(0, 0, outputWidth, outputHeight)
      context.globalCompositeOperation = 'source-over'
      context.drawImage(image, 0, 0, outputWidth, outputHeight)
      drawConnectors(context, connectors, scale, progress)
      return context.getImageData(0, 0, outputWidth, outputHeight).data
    },
  }
}

function readConnectors(stage: HTMLElement): Connector[] {
  return Array.from(stage.querySelectorAll<SVGPathElement>('.edge-signal')).map(path => {
    const group = path.closest<SVGGElement>('.diagram-edge')
    const labelGroup = group?.querySelector<SVGGElement>('.edge-label')
    const coordinates = labelGroup?.getAttribute('transform')?.match(/translate\(([-\d.]+)[ ,]([-\d.]+)\)/)
    const color = getComputedStyle(group ?? path).color || getComputedStyle(path).stroke || '#84f24b'
    return { path, d: path.getAttribute('d') ?? '', color, animated: path.classList.contains('edge-motion-flow') || path.classList.contains('edge-motion-current'), current: path.classList.contains('edge-motion-current'), both: path.hasAttribute('marker-start'), label: labelGroup?.querySelector('text')?.textContent ?? '', labelX: Number(coordinates?.[1] ?? 0), labelY: Number(coordinates?.[2] ?? 0) }
  }).filter(connector => connector.d)
}

function drawConnectors(context: CanvasRenderingContext2D, connectors: Connector[], scale: number, progress: number) {
  context.save()
  context.scale(scale, scale)
  for (const connector of connectors) {
    const path = new Path2D(connector.d)
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.lineWidth = 2
    context.strokeStyle = '#3b454e'
    context.setLineDash([])
    context.stroke(path)

    context.strokeStyle = connector.color
    context.shadowColor = connector.color
    context.shadowBlur = 4
    context.lineWidth = connector.current ? 3 : 2
    context.setLineDash(connector.animated ? (connector.current ? [3, 12] : [8, 16]) : [])
    context.lineDashOffset = connector.animated ? -48 * progress : 0
    context.stroke(path)

    const length = connector.path.getTotalLength()
    drawArrow(context, connector.path, length, false, connector.color)
    if (connector.both) drawArrow(context, connector.path, length, true, connector.color)
    if (connector.animated && length > 0) {
      for (let packet = 0; packet < 5; packet += 1) {
        const point = connector.path.getPointAtLength(((progress + packet / 5) % 1) * length)
        context.fillStyle = connector.color
        context.beginPath()
        context.arc(point.x, point.y, connector.current ? 3.7 : 3.2, 0, Math.PI * 2)
        context.fill()
      }
    }
    if (connector.label) drawLabel(context, connector)
  }
  context.restore()
}

function drawLabel(context: CanvasRenderingContext2D, connector: Connector) {
  context.shadowBlur = 0
  context.font = '700 9px Inter, Arial, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  const width = context.measureText(connector.label).width + 14
  context.fillStyle = '#10151a'
  context.strokeStyle = '#364049'
  context.lineWidth = 1
  context.beginPath()
  context.roundRect(connector.labelX - width / 2, connector.labelY - 10, width, 20, 7)
  context.fill()
  context.stroke()
  context.fillStyle = '#9aa6b0'
  context.fillText(connector.label, connector.labelX, connector.labelY)
}

function drawArrow(context: CanvasRenderingContext2D, path: SVGPathElement, length: number, reverse: boolean, color: string) {
  const tip = path.getPointAtLength(reverse ? 0 : length)
  const reference = path.getPointAtLength(reverse ? Math.min(10, length) : Math.max(0, length - 10))
  const angle = Math.atan2(tip.y - reference.y, tip.x - reference.x)
  context.fillStyle = color
  context.beginPath()
  context.moveTo(tip.x, tip.y)
  context.lineTo(tip.x - 10 * Math.cos(angle - .55), tip.y - 10 * Math.sin(angle - .55))
  context.lineTo(tip.x - 10 * Math.cos(angle + .55), tip.y - 10 * Math.sin(angle + .55))
  context.closePath()
  context.fill()
}

export async function downloadDiagramGif(stage: HTMLElement, diagram: Diagram) {
  const blob = await createDiagramGif(stage, diagram)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = gifFileName(diagram.title)
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function renderStageImage(stage: HTMLElement, diagram: Diagram) {
  const clone = stage.cloneNode(true) as HTMLElement
  clone.classList.remove('selected')
  clone.querySelectorAll('.selected').forEach(element => element.classList.remove('selected'))
  clone.querySelectorAll('.node-port,.resize-handle').forEach(element => element.remove())
  clone.querySelector('.edge-layer')?.remove()
  clone.querySelectorAll('svg').forEach(svg => svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg'))
  clone.querySelectorAll<HTMLElement>('.html-node').forEach(node => {
    node.style.setProperty('background', node.style.getPropertyValue('--node-tone') || '#11181d', 'important')
    node.style.setProperty('background-image', 'none', 'important')
    node.style.setProperty('box-shadow', 'none', 'important')
    node.style.setProperty('filter', 'none', 'important')
    node.style.setProperty('opacity', '1', 'important')
  })
  Object.assign(clone.style, {
    position: 'relative',
    inset: 'auto',
    transform: 'none',
    transformOrigin: '0 0',
    width: `${diagram.width}px`,
    height: `${diagram.height}px`,
  })

  const css = stylesheetText()
  const source = `<svg xmlns="http://www.w3.org/2000/svg" width="${diagram.width}" height="${diagram.height}" viewBox="0 0 ${diagram.width} ${diagram.height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" class="studio" data-theme="${diagram.background}" style="display:block;width:${diagram.width}px;min-height:0"><style>${css}\n*,*::before,*::after{animation:none!important;transition:none!important}.html-node::before,.html-node::after,.group-grid{display:none!important}.html-node,.html-node *,.kind-group,.diagram-stage{box-shadow:none!important;filter:none!important}.html-node,.html-node *{background-image:none!important}.html-node{background:var(--node-tone)!important;opacity:1!important}</style>${clone.outerHTML}</div></foreignObject></svg>`
  const image = new Image()
  image.decoding = 'sync'
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`
  await image.decode()
  return image
}

function stylesheetText() {
  return Array.from(document.styleSheets).flatMap(sheet => {
    try {
      return Array.from(sheet.cssRules, rule => rule.cssText)
    } catch {
      return []
    }
  }).join('\n')
}
