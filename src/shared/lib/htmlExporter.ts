import type { Diagram, DiagramEdge, DiagramNode, Side } from '../../features/diagram/domain/diagram'

const esc = (value = '') => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]!))
const width = (node: DiagramNode) => node.width ?? 190
const height = (node: DiagramNode) => node.height ?? 100
const endpoint = (node: DiagramNode, side: Side) => side === 'top' ? { x: node.x + width(node) / 2, y: node.y } : side === 'bottom' ? { x: node.x + width(node) / 2, y: node.y + height(node) } : side === 'left' ? { x: node.x, y: node.y + height(node) / 2 } : { x: node.x + width(node), y: node.y + height(node) / 2 }
const pathFor = (edge: DiagramEdge, from: DiagramNode, to: DiagramNode) => {
  const a = endpoint(from, edge.fromSide), b = endpoint(to, edge.toSide)
  if (edge.route === 'straight') return `M ${a.x} ${a.y} L ${b.x} ${b.y}`
  if (edge.route === 'curve') {
    const horizontal = edge.fromSide === 'left' || edge.fromSide === 'right', distance = horizontal ? Math.max(80, Math.abs(b.x - a.x) * .42) : Math.max(70, Math.abs(b.y - a.y) * .42)
    const vector = (side: Side) => side === 'left' ? [-1, 0] : side === 'right' ? [1, 0] : side === 'top' ? [0, -1] : [0, 1]
    const av = vector(edge.fromSide), bv = vector(edge.toSide)
    return `M ${a.x} ${a.y} C ${a.x + av[0] * distance} ${a.y + av[1] * distance}, ${b.x + bv[0] * distance} ${b.y + bv[1] * distance}, ${b.x} ${b.y}`
  }
  if ((edge.fromSide === 'left' || edge.fromSide === 'right') && (edge.toSide === 'left' || edge.toSide === 'right')) { const x = (a.x + b.x) / 2; return `M ${a.x} ${a.y} H ${x} V ${b.y} H ${b.x}` }
  const y = (a.y + b.y) / 2; return `M ${a.x} ${a.y} V ${y} H ${b.x} V ${b.y}`
}

function renderNode(node: DiagramNode) {
  const items = node.items?.map(item => `<span>${esc(item)}</span>`).join('') ?? ''
  return `<article class="node ${esc(node.kind)} motion-${esc(node.animation)}" style="left:${node.x}px;top:${node.y}px;width:${width(node)}px;height:${height(node)}px;--tone:${esc(node.color)};--ink:${esc(node.textColor)}">
    <div class="heading">${node.icon ? `<i>${esc(node.icon.slice(0, 2).toUpperCase())}</i>` : ''}<div>${node.eyebrow ? `<em>${esc(node.eyebrow)}</em>` : ''}<h2>${esc(node.title)}</h2></div>${node.badge ? `<b>${esc(node.badge)}</b>` : ''}</div>
    <p>${esc(node.subtitle)}</p>${items ? `<div class="items">${items}</div>` : ''}
  </article>`
}

export function buildDiagramHtml(diagram: Diagram) {
  const index = Object.fromEntries(diagram.nodes.map(node => [node.id, node]))
  const edges = diagram.edges.map(edge => {
    const from = index[edge.from], to = index[edge.to]; if (!from || !to) return ''
    const d = pathFor(edge, from, to), dash = edge.dashed ? ' dashed' : '', motion = edge.animation === 'none' ? '' : ' flow'
    return `<g class="edge${dash}" style="color:${esc(edge.color)}"><path class="rail" d="${d}"/><path class="signal${motion}" d="${d}" marker-end="url(#arrow)"/>${edge.label ? `<text><textPath href="#edge-${esc(edge.id)}" startOffset="50%">${esc(edge.label)}</textPath></text>` : ''}<path id="edge-${esc(edge.id)}" class="label-path" d="${d}"/></g>`
  }).join('')
  const dark = diagram.background !== 'light'
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(diagram.title)}</title><style>
*{box-sizing:border-box}body{margin:0;background:${dark ? '#050709' : '#eef2f6'};color:${dark ? '#f5f7fa' : '#182231'};font-family:Inter,ui-sans-serif,system-ui,sans-serif}.page{min-width:${diagram.width}px;padding:42px}.title{width:${diagram.width}px;margin:0 auto 24px}.title small{color:#86f34d;font:700 11px ui-monospace,monospace;letter-spacing:.14em}.title h1{margin:8px 0 4px;font-size:27px;letter-spacing:-.035em}.title p{margin:0;color:#7e8998;font-size:13px}.board{position:relative;width:${diagram.width}px;height:${diagram.height}px;margin:auto;overflow:hidden;border:1px solid ${dark ? '#242b32' : '#d4dce5'};border-radius:18px;background-color:${dark ? '#090c10' : '#fff'};background-image:linear-gradient(${dark ? '#151a20' : '#edf1f5'} 1px,transparent 1px),linear-gradient(90deg,${dark ? '#151a20' : '#edf1f5'} 1px,transparent 1px);background-size:28px 28px;box-shadow:0 30px 100px #0006}.edges{position:absolute;inset:0;width:100%;height:100%;z-index:1;overflow:visible}.edge path{fill:none}.rail{stroke:#3a444e;stroke-width:2}.signal{stroke:currentColor;stroke-width:2;filter:drop-shadow(0 0 4px currentColor)}.dashed .rail,.dashed .signal{stroke-dasharray:7 8}.flow{stroke-dasharray:8 16;animation:flow 2s linear infinite}.label-path{stroke:none}.edge text{fill:#8995a3;font-size:10px}.edge textPath{dominant-baseline:hanging}.node{position:absolute;z-index:2;padding:18px;color:var(--ink);border:1px solid color-mix(in srgb,var(--tone),white 18%);border-radius:14px;background:color-mix(in srgb,var(--tone),transparent 2%);box-shadow:0 16px 44px #0007,inset 0 1px #ffffff12}.node.group{z-index:0;border-style:dashed;background:color-mix(in srgb,var(--tone),transparent 10%);box-shadow:inset 0 0 60px #0005}.node.platform:after{content:'';position:absolute;left:16px;right:16px;bottom:13px;height:4px;border-radius:4px;background:linear-gradient(90deg,#85f34c,#61d1ff,transparent)}.node.actor,.node.metric{border-radius:50%;text-align:center}.node.note{border-color:#9768ec;background:linear-gradient(135deg,var(--tone),#10151d)}.heading{display:flex;align-items:flex-start;gap:10px}.heading>div{min-width:0;flex:1}.heading i{display:grid;place-items:center;flex:0 0 30px;height:30px;border:1px solid #52606e;border-radius:7px;color:#9ff56d;font:700 9px ui-monospace,monospace}.heading em{display:block;margin-bottom:5px;color:#8cf152;font:700 8px ui-monospace,monospace;letter-spacing:.13em;font-style:normal}.heading h2{margin:0;font-size:15px;letter-spacing:-.02em}.heading b{padding:4px 6px;border:1px solid #6f54a1;border-radius:10px;color:#caaaff;font-size:7px}.node>p{margin:8px 0 0;color:#909ba8;font-size:10px;line-height:1.4}.items{display:flex;gap:5px;margin-top:14px}.items span{flex:1;padding:7px 4px;border:1px solid #343e48;border-radius:6px;color:#aab4bf;text-align:center;font-size:8px;background:#0b0f13}.metric .heading{justify-content:center}.metric .heading i{display:none}.metric .heading h2{font-size:27px}.metric>p{text-align:center}.motion-pulse{animation:pulse 2.2s ease-in-out infinite}.motion-glow{animation:glow 2s ease-in-out infinite}@keyframes flow{to{stroke-dashoffset:-48}}@keyframes pulse{50%{transform:scale(1.035)}}@keyframes glow{50%{filter:drop-shadow(0 0 14px #84f24b)}}@media(max-width:900px){body{overflow:auto}.page{padding:18px}}
</style></head><body><main class="page"><header class="title"><small>DIAGRAMMATON · HTML ARTIFACT</small><h1>${esc(diagram.title)}</h1><p>${esc(diagram.subtitle)}</p></header><section class="board"><svg class="edges" viewBox="0 0 ${diagram.width} ${diagram.height}"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="#86f34d"/></marker></defs>${edges}</svg>${diagram.nodes.map(renderNode).join('')}</section></main></body></html>`
}

export function downloadDiagramHtml(diagram: Diagram) {
  const blob = new Blob([buildDiagramHtml(diagram)], { type: 'text/html;charset=utf-8' }), url = URL.createObjectURL(blob), anchor = document.createElement('a')
  anchor.href = url; anchor.download = `${diagram.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'diagram'}.html`; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
