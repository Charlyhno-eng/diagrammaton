import { GIFEncoder, applyPalette, quantize } from 'gifenc'
import type { DiagramEdge, DiagramNode } from '../../features/diagram/domain/diagram'

const OUTPUT = { width: 960, height: 640, frames: 64, duration: 6400, padding: 72 }
type Layout = { scale: number; offsetX: number; offsetY: number; minX: number; minY: number; maxX: number; maxY: number }

/** Generates a light, 10 fps looping GIF rather than a heavy low-frame-rate capture. */
export async function downloadDiagramGif(nodes: DiagramNode[], edges: DiagramEdge[]) {
  const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true })!
  canvas.width = OUTPUT.width; canvas.height = OUTPUT.height
  const encoder = GIFEncoder(), index = Object.fromEntries(nodes.map(node => [node.id, node]))
  const layout = getLayout(nodes)
  renderFrame(ctx, nodes, edges, index, layout, OUTPUT.duration)
  const palette = quantize(ctx.getImageData(0, 0, OUTPUT.width, OUTPUT.height).data, 256)
  for (let frame = 0; frame < OUTPUT.frames; frame++) {
    const time = frame / OUTPUT.frames * OUTPUT.duration
    renderFrame(ctx, nodes, edges, index, layout, time)
    const pixels = ctx.getImageData(0, 0, OUTPUT.width, OUTPUT.height).data
    encoder.writeFrame(applyPalette(pixels, palette), OUTPUT.width, OUTPUT.height, { palette, delay: OUTPUT.duration / OUTPUT.frames, repeat: 0 })
  }
  encoder.finish()
  const url = URL.createObjectURL(new Blob([encoder.bytesView()], { type: 'image/gif' })), anchor = document.createElement('a')
  anchor.href = url; anchor.download = 'diagrammaton.gif'; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function renderFrame(ctx: CanvasRenderingContext2D, nodes: DiagramNode[], edges: DiagramEdge[], index: Record<string, DiagramNode>, layout: Layout, time: number) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#081329'; ctx.fillRect(0, 0, OUTPUT.width, OUTPUT.height)
  ctx.translate(layout.offsetX, layout.offsetY); ctx.scale(layout.scale, layout.scale)
  drawGrid(ctx, layout); drawEdges(ctx, edges, index, time); nodes.forEach(node => drawNode(ctx, node, time))
}

function getLayout(nodes: DiagramNode[]): Layout {
  if (!nodes.length) return { scale: 1, offsetX: 20, offsetY: 10, minX: 0, minY: 0, maxX: 920, maxY: 620 }
  const minX = Math.min(...nodes.map(node => node.x)) - OUTPUT.padding, minY = Math.min(...nodes.map(node => node.y)) - OUTPUT.padding
  const maxX = Math.max(...nodes.map(node => node.x + nodeWidth(node))) + OUTPUT.padding, maxY = Math.max(...nodes.map(node => node.y + nodeHeight(node))) + OUTPUT.padding
  const contentWidth = Math.max(1, maxX - minX), contentHeight = Math.max(1, maxY - minY)
  const scale = Math.min((OUTPUT.width - OUTPUT.padding) / contentWidth, (OUTPUT.height - OUTPUT.padding) / contentHeight, 1.25)
  return { scale, offsetX: (OUTPUT.width - contentWidth * scale) / 2 - minX * scale, offsetY: (OUTPUT.height - contentHeight * scale) / 2 - minY * scale, minX, minY, maxX, maxY }
}

function nodeWidth(node: DiagramNode) { return node.width ?? 166 }
function nodeHeight(node: DiagramNode) { return node.height ?? 110 }
function endpoint(node: DiagramNode, side: DiagramEdge['fromSide']) { const width = nodeWidth(node), height = nodeHeight(node); if (side === 'top') return { x: node.x + width / 2, y: node.y - 1 }; if (side === 'bottom') return { x: node.x + width / 2, y: node.y + height + 1 }; if (side === 'left') return { x: node.x - 1, y: node.y + height / 2 }; return { x: node.x + width + 1, y: node.y + height / 2 } }
function orthogonalPoints(start: { x: number; y: number }, end: { x: number; y: number }, fromSide: DiagramEdge['fromSide'], toSide: DiagramEdge['toSide']) { if ((fromSide === 'left' || fromSide === 'right') && (toSide === 'left' || toSide === 'right')) { const x = Math.round((start.x + end.x) / 2); return [start, { x, y: start.y }, { x, y: end.y }, end] } if ((fromSide === 'top' || fromSide === 'bottom') && (toSide === 'top' || toSide === 'bottom')) { const y = Math.round((start.y + end.y) / 2); return [start, { x: start.x, y }, { x: end.x, y }, end] } return fromSide === 'left' || fromSide === 'right' ? [start, { x: end.x, y: start.y }, end] : [start, { x: start.x, y: end.y }, end] }

function drawGrid(ctx: CanvasRenderingContext2D, layout: Layout) { ctx.fillStyle = '#18304f'; const startX = Math.floor(layout.minX / 22) * 22, startY = Math.floor(layout.minY / 22) * 22; for (let x = startX; x <= layout.maxX; x += 22) for (let y = startY; y <= layout.maxY; y += 22) ctx.fillRect(x, y, 1, 1) }

function drawEdges(ctx: CanvasRenderingContext2D, edges: DiagramEdge[], index: Record<string, DiagramNode>, time: number) {
  edges.forEach(edge => {
    const from = index[edge.from], to = index[edge.to]; if (!from || !to) return
    const start = endpoint(from, edge.fromSide), end = endpoint(to, edge.toSide), points = orthogonalPoints(start, end, edge.fromSide, edge.toSide)
    ctx.save(); ctx.strokeStyle = '#3f5877'; ctx.lineWidth = 2; ctx.beginPath(); trace(ctx, points); ctx.stroke()
    if (edge.animation !== 'none') { const speed = edge.animation === 'current' ? .32 : .16, spacing = edge.animation === 'current' ? .14 : .24; for (let p = ((time * speed / 1000) % spacing) - spacing; p < 1; p += spacing) { const point = pointOnPath(points, p), radius = edge.animation === 'current' ? 3.4 : 3; ctx.fillStyle = edge.color; ctx.shadowColor = edge.color; ctx.shadowBlur = 7; ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); ctx.fill() } }
    ctx.shadowBlur = 0; drawArrowHead(ctx, points[points.length - 2], end, edge.color); if (edge.direction === 'both') drawArrowHead(ctx, points[1], start, edge.color); ctx.restore()
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
function drawNode(ctx: CanvasRenderingContext2D, node: DiagramNode, time: number) {
  const progress = Math.max(0, Math.min(1, time / 1000)); let x = node.x, y = node.y, opacity = 1, scale = 1
  if (node.animation === 'slide-left') { x -= (1 - progress) * 65; opacity = progress } if (node.animation === 'zoom-in') { scale = .45 + progress * .55; opacity = progress } if (node.animation === 'build') { y += (1 - progress) * 42; opacity = progress } if (node.animation === 'energize') { opacity = progress; scale = 1 + Math.sin(time / 680) * .025 } if (node.animation === 'pulse') scale = 1 + Math.sin(time / 720) * .045
  const width = nodeWidth(node), height = nodeHeight(node); ctx.save(); ctx.globalAlpha = opacity; ctx.translate(x + width / 2, y + height / 2); ctx.scale(scale, scale); ctx.translate(-width / 2, -height / 2); ctx.shadowColor = '#00000055'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 9; rounded(ctx, 0, 0, width, height, 15); ctx.fillStyle = node.color; ctx.fill(); ctx.shadowColor = 'transparent'; const titleY = height * .45; ctx.fillStyle = node.textColor; ctx.font = '700 15px Arial'; ctx.fillText(node.title, 17, titleY); ctx.globalAlpha *= .8; ctx.font = '11px Arial'; ctx.fillText(node.subtitle, 17, titleY + 20); const sheen = ctx.createLinearGradient(0, 0, width, height); sheen.addColorStop(0, '#ffffff25'); sheen.addColorStop(.55, '#ffffff00'); ctx.fillStyle = sheen; rounded(ctx, 0, 0, width, height, 15); ctx.fill(); ctx.restore()
}
function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) { ctx.beginPath(); ctx.roundRect(x, y, width, height, radius) }
