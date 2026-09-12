import { GIFEncoder, applyPalette, quantize } from 'gifenc'
import type { DiagramEdge, DiagramNode } from '../../features/diagram/domain/diagram'

const OUTPUT = { width: 736, height: 496, scale: 0.8, frames: 40, duration: 5000 }

/** Generates a light, 10 fps looping GIF rather than a heavy low-frame-rate capture. */
export async function downloadDiagramGif(nodes: DiagramNode[], edges: DiagramEdge[]) {
  const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true })!
  canvas.width = OUTPUT.width; canvas.height = OUTPUT.height
  const encoder = GIFEncoder(), index = Object.fromEntries(nodes.map(node => [node.id, node]))
  const images = await loadImages(nodes)
  for (let frame = 0; frame < OUTPUT.frames; frame++) {
    const time = frame / OUTPUT.frames * OUTPUT.duration
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#081329'; ctx.fillRect(0, 0, OUTPUT.width, OUTPUT.height)
    ctx.scale(OUTPUT.scale, OUTPUT.scale); drawGrid(ctx); drawEdges(ctx, edges, index, time); nodes.forEach(node => drawNode(ctx, node, time, images.get(node.id)))
    const pixels = ctx.getImageData(0, 0, OUTPUT.width, OUTPUT.height).data, palette = quantize(pixels, 128)
    encoder.writeFrame(applyPalette(pixels, palette), OUTPUT.width, OUTPUT.height, { palette, delay: OUTPUT.duration / OUTPUT.frames, repeat: 0 })
  }
  encoder.finish()
  const url = URL.createObjectURL(new Blob([encoder.bytesView()], { type: 'image/gif' })), anchor = document.createElement('a')
  anchor.href = url; anchor.download = 'diagrammaton.gif'; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function loadImages(nodes: DiagramNode[]) { return Promise.all(nodes.filter(node => node.image).map(node => new Promise<[string, HTMLImageElement]>(resolve => { const image = new Image(); image.onload = () => resolve([node.id, image]); image.onerror = () => resolve([node.id, image]); image.src = node.image! }))).then(entries => new Map(entries)) }

function drawGrid(ctx: CanvasRenderingContext2D) { ctx.fillStyle = '#18304f'; for (let x = 0; x < 920; x += 22) for (let y = 0; y < 620; y += 22) ctx.fillRect(x, y, 1, 1) }

function drawEdges(ctx: CanvasRenderingContext2D, edges: DiagramEdge[], index: Record<string, DiagramNode>, time: number) {
  edges.forEach(edge => {
    const from = index[edge.from], to = index[edge.to]; if (!from || !to) return
    const start = { x: from.x + 176, y: from.y + 55 }, end = { x: to.x - 10, y: to.y + 55 }, middle = Math.round((start.x + end.x) / 2)
    const points = [start, { x: middle, y: start.y }, { x: middle, y: end.y }, end]
    ctx.save(); ctx.strokeStyle = '#3f5877'; ctx.lineWidth = 2; ctx.beginPath(); trace(ctx, points); ctx.stroke()
    const speed = edge.animation === 'current' ? 1.25 : edge.animation === 'short-test' ? .9 : .58
    const spacing = edge.animation === 'pulse' || edge.animation === 'safety' ? .42 : edge.animation === 'current' ? .12 : .22
    for (let p = ((time * speed / 1000) % spacing) - spacing; p < 1; p += spacing) {
      const point = pointOnPath(points, p), radius = edge.animation === 'current' ? 3.4 : edge.animation === 'pulse' ? 4.5 : 3
      ctx.fillStyle = edge.color; ctx.shadowColor = edge.color; ctx.shadowBlur = 7; ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); ctx.fill()
    }
    ctx.shadowBlur = 0; drawArrowHead(ctx, points[2], end, edge.color); ctx.restore()
  })
}

function trace(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) { ctx.moveTo(points[0].x, points[0].y); points.slice(1).forEach(point => ctx.lineTo(point.x, point.y)) }
function pointOnPath(points: { x: number; y: number }[], ratio: number) {
  const lengths = points.slice(1).map((point, i) => Math.abs(point.x - points[i].x) + Math.abs(point.y - points[i].y))
  const total = lengths.reduce((a, b) => a + b, 0); let target = Math.max(0, ratio) * total
  for (let i = 0; i < lengths.length; i++) {
    if (target <= lengths[i]) { const from = points[i], to = points[i + 1], t = lengths[i] ? target / lengths[i] : 0; return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t } }
    target -= lengths[i]
  }
  return points[points.length - 1]
}
function drawArrowHead(ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }, color: string) { const angle = Math.atan2(to.y - from.y, to.x - from.x); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(to.x, to.y); ctx.lineTo(to.x - 9 * Math.cos(angle - .5), to.y - 9 * Math.sin(angle - .5)); ctx.lineTo(to.x - 9 * Math.cos(angle + .5), to.y - 9 * Math.sin(angle + .5)); ctx.closePath(); ctx.fill() }
function drawNode(ctx: CanvasRenderingContext2D, node: DiagramNode, time: number, image?: HTMLImageElement) {
  const progress = Math.max(0, Math.min(1, (time - node.delay) / 560)); let x = node.x, y = node.y, opacity = time < node.delay ? 0 : 1, scale = 1
  if (node.animation === 'fade') { opacity = progress; scale = .82 + progress * .18 } if (node.animation === 'slide-left') { x -= (1 - progress) * 65; opacity = progress } if (node.animation === 'zoom-in') { scale = .45 + progress * .55; opacity = progress } if (node.animation === 'build') { y += (1 - progress) * 42; opacity = progress } if (node.animation === 'energize') { opacity = progress; scale = 1 + Math.sin(time / 170) * .025 } if (node.animation === 'pulse') scale = 1 + Math.sin(time / 180) * .045
  ctx.save(); ctx.globalAlpha = opacity; ctx.translate(x + 83, y + 55); ctx.scale(scale, scale); ctx.translate(-83, -55); ctx.shadowColor = '#00000055'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 9; rounded(ctx, 0, 0, 166, 110, 15); ctx.fillStyle = node.color; ctx.fill(); ctx.shadowColor = 'transparent'; if (image?.complete && image.naturalWidth) { ctx.save(); rounded(ctx, 0, 0, 166, 110, 15); ctx.clip(); ctx.drawImage(image, 0, 0, 64, 110); ctx.restore() } const sheen = ctx.createLinearGradient(0, 0, 166, 110); sheen.addColorStop(0, '#ffffff25'); sheen.addColorStop(.55, '#ffffff00'); ctx.fillStyle = sheen; rounded(ctx, 0, 0, 166, 110, 15); ctx.fill(); const textX = image?.naturalWidth ? 78 : 20; ctx.fillStyle = node.textColor; ctx.font = '700 15px Arial'; ctx.fillText(node.title, textX, 49); ctx.globalAlpha *= .8; ctx.font = '11px Arial'; ctx.fillText(node.subtitle, textX, 70); ctx.restore()
}
function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) { ctx.beginPath(); ctx.roundRect(x, y, width, height, radius) }
