import { ChangeEvent, PointerEvent, useMemo, useRef, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import { GIFEncoder, applyPalette, quantize } from 'gifenc'
import {
  ArrowLeft, ChevronDown, CirclePlay, Download, FileImage, ImagePlus,
  Layers3, Link2, Maximize2, MousePointer2, Palette, Play, Plus,
  Redo2, Settings2, Sparkles, Square, Trash2, Undo2, Upload, X,
} from 'lucide-react'

type Animation = 'Aucune' | 'Apparition' | 'Glissement' | 'Rebond' | 'Pulsation'
type NodeKind = 'block' | 'image'
type DiagramNode = {
  id: string
  kind: NodeKind
  title: string
  subtitle: string
  x: number
  y: number
  color: string
  textColor: string
  animation: Animation
  delay: number
  image?: string
}
type Edge = { id: string; from: string; to: string; label: string }

const swatches = ['#f6c85f', '#ef746f', '#e878b3', '#a98ad8', '#75b9be', '#79c99e', '#4b85d1', '#252a42']
const animations: { name: Animation; hint: string; icon: string }[] = [
  { name: 'Aucune', hint: 'Reste fixe', icon: '—' },
  { name: 'Apparition', hint: 'Fondu délicat', icon: '◐' },
  { name: 'Glissement', hint: 'Entre depuis la gauche', icon: '→' },
  { name: 'Rebond', hint: 'Effet dynamique', icon: '↟' },
  { name: 'Pulsation', hint: 'Attire le regard', icon: '✦' },
]

const initialNodes: DiagramNode[] = [
  { id: 'start', kind: 'block', title: 'Départ', subtitle: 'Votre idée', x: 72, y: 220, color: '#f6c85f', textColor: '#202337', animation: 'Apparition', delay: 0 },
  { id: 'research', kind: 'block', title: 'Recherche', subtitle: 'Comprendre le besoin', x: 330, y: 125, color: '#a98ad8', textColor: '#ffffff', animation: 'Glissement', delay: 300 },
  { id: 'prototype', kind: 'block', title: 'Prototype', subtitle: 'Donner forme', x: 330, y: 324, color: '#75b9be', textColor: '#ffffff', animation: 'Glissement', delay: 600 },
  { id: 'result', kind: 'block', title: 'Résultat', subtitle: 'Prêt à partager', x: 605, y: 220, color: '#ef746f', textColor: '#ffffff', animation: 'Rebond', delay: 900 },
]
const initialEdges: Edge[] = [
  { id: 'e1', from: 'start', to: 'research', label: '' },
  { id: 'e2', from: 'start', to: 'prototype', label: '' },
  { id: 'e3', from: 'research', to: 'result', label: '' },
  { id: 'e4', from: 'prototype', to: 'result', label: '' },
]

function classNames(...values: Array<string | false | undefined>) { return values.filter(Boolean).join(' ') }

function App() {
  return <Routes><Route path="*" element={<Editor />} /><Route path="/preview" element={<Preview />} /></Routes>
}

function Editor() {
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const [selectedId, setSelectedId] = useState('research')
  const [tool, setTool] = useState<'select' | 'link'>('select')
  const [linkStart, setLinkStart] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [showExport, setShowExport] = useState(false)
  const [toast, setToast] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const selected = nodes.find(n => n.id === selectedId) ?? nodes[0]

  const updateNode = (patch: Partial<DiagramNode>) => setNodes(current => current.map(n => n.id === selected.id ? { ...n, ...patch } : n))
  const addNode = () => {
    const id = `block-${Date.now()}`
    setNodes(current => [...current, { id, kind: 'block', title: 'Nouveau bloc', subtitle: 'Ajoutez une description', x: 470, y: 440, color: '#4b85d1', textColor: '#fff', animation: 'Apparition', delay: 0 }])
    setSelectedId(id)
    setTool('select')
  }
  const removeSelected = () => {
    if (nodes.length === 1) return
    setNodes(current => current.filter(n => n.id !== selected.id))
    setEdges(current => current.filter(e => e.from !== selected.id && e.to !== selected.id))
    setSelectedId(nodes.find(n => n.id !== selected.id)?.id ?? '')
  }
  const connect = (id: string) => {
    if (tool !== 'link') { setSelectedId(id); return }
    if (!linkStart) { setLinkStart(id); return }
    if (linkStart !== id && !edges.some(e => e.from === linkStart && e.to === id)) setEdges(old => [...old, { id: `e-${Date.now()}`, from: linkStart, to: id, label: '' }])
    setLinkStart(null)
    setTool('select')
  }
  const addImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const id = `image-${Date.now()}`
      setNodes(current => [...current, { id, kind: 'image', title: file.name.replace(/\.[^.]+$/, ''), subtitle: 'Image importée', x: 500, y: 100, color: '#fff', textColor: '#202337', animation: 'Apparition', delay: 0, image: String(reader.result) }])
      setSelectedId(id)
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }
  const play = () => { setIsPlaying(true); window.setTimeout(() => setIsPlaying(false), 2200) }
  const share = () => { navigator.clipboard?.writeText(window.location.href); setToast('Lien de partage copié'); window.setTimeout(() => setToast(''), 2300) }

  return <main className="app-shell">
    <aside className="left-rail">
      <Link className="brand" to="/" aria-label="Diagrammaton accueil"><span className="brand-dot">D</span></Link>
      <nav className="rail-nav" aria-label="Navigation principale">
        <button className="rail-button active" title="Éditeur"><Square size={19} /></button>
        <button className="rail-button" title="Mes schémas"><Layers3 size={19} /></button>
        <button className="rail-button" title="Réglages"><Settings2 size={19} /></button>
      </nav>
      <button className="avatar">CM</button>
    </aside>

    <section className="workspace">
      <header className="topbar">
        <div className="crumbs"><span>Mes schémas</span><span className="slash">/</span><strong>Parcours produit</strong><button className="title-menu"><ChevronDown size={15} /></button></div>
        <div className="top-actions">
          <button className="icon-action" title="Annuler"><Undo2 size={17} /></button>
          <button className="icon-action mute" title="Rétablir"><Redo2 size={17} /></button>
          <div className="divider" />
          <button className="share-button" onClick={share}>Partager</button>
          <button className="export-button" onClick={() => setShowExport(true)}><Download size={16} /> Exporter</button>
        </div>
      </header>

      <div className="editor-area">
        <section className="canvas-panel">
          <div className="canvas-toolbar">
            <button className={classNames('tool-button', tool === 'select' && 'selected')} onClick={() => { setTool('select'); setLinkStart(null) }} title="Sélectionner"><MousePointer2 size={17} /></button>
            <button className={classNames('tool-button', tool === 'link' && 'selected')} onClick={() => setTool('link')} title="Créer une liaison"><Link2 size={17} /></button>
            <span className="toolbar-separator" />
            <button className="tool-button" onClick={addNode} title="Ajouter un bloc"><Plus size={18} /></button>
            <button className="tool-button" onClick={() => fileRef.current?.click()} title="Importer une image"><ImagePlus size={18} /></button>
            <input ref={fileRef} className="hidden" type="file" accept="image/*" onChange={addImage} />
          </div>
          {tool === 'link' && <div className="link-hint">{linkStart ? 'Choisissez le bloc d’arrivée' : 'Choisissez le bloc de départ'}</div>}
          <DiagramCanvas nodes={nodes} edges={edges} selectedId={selectedId} tool={tool} onSelect={connect} onMove={setNodes} isPlaying={isPlaying} zoom={zoom} />
          <div className="canvas-status"><span className="autosave"><i /> Enregistré à l’instant</span><div className="zoom-control"><button onClick={() => setZoom(Math.max(60, zoom - 10))}>−</button><span>{zoom}%</span><button onClick={() => setZoom(Math.min(140, zoom + 10))}>+</button><button title="Ajuster à l’écran" onClick={() => setZoom(100)}><Maximize2 size={14} /></button></div></div>
        </section>

        <aside className="inspector">
          <div className="inspector-heading"><span>Propriétés</span><button className="tiny-icon" onClick={removeSelected} title="Supprimer l’élément"><Trash2 size={16} /></button></div>
          <div className="inspector-content">
            <div className="selection-label"><span className="selection-dot" style={{ background: selected.color }} /> {selected.kind === 'image' ? 'Image' : 'Bloc'} sélectionné</div>
            <Field label="Titre"><input value={selected.title} onChange={e => updateNode({ title: e.target.value })} /></Field>
            <Field label="Texte secondaire"><textarea rows={2} value={selected.subtitle} onChange={e => updateNode({ subtitle: e.target.value })} /></Field>
            {selected.kind === 'block' && <>
              <Field label="Couleur du bloc">
                <div className="color-row"><button className="color-preview" style={{ background: selected.color }} onClick={() => document.getElementById('native-color')?.click()} /><input id="native-color" className="native-color" type="color" value={selected.color} onChange={e => updateNode({ color: e.target.value })} /><span>{selected.color.toUpperCase()}</span></div>
                <div className="swatches">{swatches.map(color => <button key={color} onClick={() => updateNode({ color })} className={classNames('swatch', selected.color === color && 'current')} style={{ background: color }} />)}</div>
              </Field>
              <Field label="Couleur du texte"><div className="text-options"><button className={classNames(selected.textColor === '#ffffff' && 'active')} onClick={() => updateNode({ textColor: '#ffffff' })}>Aa Clair</button><button className={classNames(selected.textColor !== '#ffffff' && 'active')} onClick={() => updateNode({ textColor: '#202337' })}>Aa Foncé</button></div></Field>
            </>}
            {selected.kind === 'image' && <button className="replace-image" onClick={() => fileRef.current?.click()}><Upload size={15} /> Remplacer l’image</button>}
            <div className="section-rule" />
            <div className="animation-label"><span>Animation</span><Sparkles size={15} /></div>
            <div className="animation-picker">{animations.map(item => <button key={item.name} onClick={() => updateNode({ animation: item.name })} className={classNames('animation-option', selected.animation === item.name && 'active')}><span className="animation-symbol">{item.icon}</span><span><b>{item.name}</b><small>{item.hint}</small></span>{selected.animation === item.name && <span className="check">✓</span>}</button>)}</div>
            {selected.animation !== 'Aucune' && <Field label={`Délai · ${selected.delay} ms`}><input className="range" type="range" min="0" max="2000" step="100" value={selected.delay} onChange={e => updateNode({ delay: Number(e.target.value) })} /></Field>}
          </div>
          <div className="preview-box"><div><CirclePlay size={18} /><span><b>Prévisualiser</b><small>Voir l’animation complète</small></span></div><button onClick={play}><Play size={15} fill="currentColor" /></button></div>
        </aside>
      </div>
    </section>
    {showExport && <ExportDialog nodes={nodes} edges={edges} onClose={() => setShowExport(false)} onExport={() => { setShowExport(false); setToast('Création de votre GIF…'); window.setTimeout(() => setToast(''), 3200) }} />}
    {toast && <div className="toast"><span>✓</span>{toast}</div>}
  </main>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="field"><span>{label}</span>{children}</label> }

function DiagramCanvas({ nodes, edges, selectedId, tool, onSelect, onMove, isPlaying, zoom }: { nodes: DiagramNode[]; edges: Edge[]; selectedId: string; tool: string; onSelect: (id: string) => void; onMove: React.Dispatch<React.SetStateAction<DiagramNode[]>>; isPlaying: boolean; zoom: number }) {
  const drag = useRef<{ id: string; startX: number; startY: number; nodeX: number; nodeY: number } | null>(null)
  const index = useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes])
  const startDrag = (event: PointerEvent<HTMLDivElement>, node: DiagramNode) => {
    if (tool !== 'select') return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { id: node.id, startX: event.clientX, startY: event.clientY, nodeX: node.x, nodeY: node.y }
  }
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const d = drag.current
    onMove(old => old.map(n => n.id === d.id ? { ...n, x: Math.max(18, d.nodeX + (event.clientX - d.startX)), y: Math.max(18, d.nodeY + (event.clientY - d.startY)) } : n))
  }
  const stop = () => { drag.current = null }
  return <div className="diagram-viewport" onPointerMove={move} onPointerUp={stop} onPointerLeave={stop}>
    <div className="diagram-stage" style={{ transform: `scale(${zoom / 100})` }}>
      <svg className="edge-layer" viewBox="0 0 920 620" preserveAspectRatio="none"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#b9beca" /></marker></defs>{edges.map(edge => { const a = index[edge.from], b = index[edge.to]; if (!a || !b) return null; const ax = a.x + 156, ay = a.y + 52, bx = b.x + 2, by = b.y + 52; const mid = (ax + bx) / 2; return <path key={edge.id} d={`M ${ax} ${ay} C ${mid} ${ay}, ${mid} ${by}, ${bx} ${by}`} markerEnd="url(#arrow)" /> })}</svg>
      {nodes.map(node => <div key={node.id} className={classNames('diagram-node', node.kind === 'image' && 'image-node', selectedId === node.id && 'selected', isPlaying && node.animation !== 'Aucune' && `motion-${node.animation.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`)} style={{ left: node.x, top: node.y, background: node.kind === 'image' ? '#fff' : node.color, color: node.textColor, animationDelay: `${node.delay}ms` }} onClick={() => onSelect(node.id)} onPointerDown={e => startDrag(e, node)}>
        {node.kind === 'image' && <img src={node.image} alt={node.title} />}
        {node.kind === 'block' && <><b>{node.title}</b><small>{node.subtitle}</small></>}
        {node.kind === 'image' && <span className="image-caption">{node.title}</span>}
        {selectedId === node.id && <span className="resize-handle" />}
      </div>)}
    </div>
  </div>
}

function ExportDialog({ nodes, edges, onClose, onExport }: { nodes: DiagramNode[]; edges: Edge[]; onClose: () => void; onExport: () => void }) {
  const [format, setFormat] = useState<'gif' | 'mp4'>('gif')
  const [creating, setCreating] = useState(false)
  const createExport = async () => {
    if (format === 'mp4') return
    setCreating(true)
    await new Promise(resolve => window.setTimeout(resolve, 40))
    exportGif(nodes, edges)
    setCreating(false)
    onExport()
  }
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="export-dialog" onMouseDown={e => e.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">EXPORTATION</span><h2>Donnez vie à votre schéma</h2></div><button onClick={onClose}><X size={19} /></button></div><p>Votre animation sera calculée directement dans votre navigateur.</p><div className="format-options"><button onClick={() => setFormat('gif')} className={classNames(format === 'gif' && 'picked')}><FileImage size={22} /><span><b>GIF animé</b><small>Parfait pour partager partout</small></span><i /></button><button onClick={() => setFormat('mp4')} className={classNames(format === 'mp4' && 'picked')}><Play size={22} /><span><b>Vidéo MP4</b><small>Haute définition · 1080p</small></span><i /></button></div><div className="export-settings"><span>Durée</span><strong>3,2 secondes</strong><span>Fond</span><button className="background-choice"><span /> Transparent <ChevronDown size={14} /></button></div><div className="modal-actions"><button className="cancel" onClick={onClose}>Annuler</button><button className="create" onClick={createExport} disabled={creating || format === 'mp4'}><Download size={16} />{creating ? ' Création…' : ` Créer mon ${format.toUpperCase()}`}</button></div></div></div>
}

function exportGif(nodes: DiagramNode[], edges: Edge[]) {
  const width = 960, height = 620, canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  const encoder = GIFEncoder()
  const frames = 18, duration = 3200
  for (let index = 0; index < frames; index++) {
    drawExportFrame(ctx, nodes, edges, (index / (frames - 1)) * duration, width, height)
    const pixels = ctx.getImageData(0, 0, width, height).data
    const palette = quantize(pixels, 256)
    encoder.writeFrame(applyPalette(pixels, palette), width, height, { palette, delay: Math.round(duration / frames), repeat: 0 })
  }
  encoder.finish()
  const url = URL.createObjectURL(new Blob([encoder.bytesView()], { type: 'image/gif' }))
  const link = document.createElement('a')
  link.href = url; link.download = 'diagrammaton-anime.gif'; link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function drawExportFrame(ctx: CanvasRenderingContext2D, nodes: DiagramNode[], edges: Edge[], time: number, width: number, height: number) {
  ctx.fillStyle = '#fbfbfd'; ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#e1e3ea'; for (let x = 0; x < width; x += 18) for (let y = 0; y < height; y += 18) ctx.fillRect(x, y, 1, 1)
  const map = Object.fromEntries(nodes.map(node => [node.id, node]))
  ctx.strokeStyle = '#b9beca'; ctx.lineWidth = 2
  edges.forEach(edge => { const a = map[edge.from], b = map[edge.to]; if (!a || !b) return; ctx.beginPath(); ctx.moveTo(a.x + 156, a.y + 52); ctx.bezierCurveTo((a.x + b.x + 158) / 2, a.y + 52, (a.x + b.x + 158) / 2, b.y + 52, b.x, b.y + 52); ctx.stroke() })
  nodes.forEach(node => {
    const local = Math.max(0, Math.min(1, (time - node.delay) / 540)); const eased = 1 - Math.pow(1 - local, 3)
    let x = node.x, y = node.y, scale = 1, opacity = 1
    if (node.animation === 'Apparition') { scale = .7 + .3 * eased; opacity = eased }
    if (node.animation === 'Glissement') { x -= (1 - eased) * 70; opacity = eased }
    if (node.animation === 'Rebond') { y -= Math.sin(eased * Math.PI) * 20 * (1 - eased * .45) }
    if (node.animation === 'Pulsation') scale = 1 + Math.sin(Math.min(1, time / 800) * Math.PI) * .08
    ctx.save(); ctx.globalAlpha = opacity; ctx.translate(x + 78, y + 51.5); ctx.scale(scale, scale); ctx.translate(-78, -51.5)
    if (node.kind === 'image') { roundedRect(ctx, 0, 0, 156, 103, 12); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#e1e3e9'; ctx.stroke(); ctx.fillStyle = '#e8eaf0'; roundedRect(ctx, 7, 7, 142, 66, 7); ctx.fill() } else { roundedRect(ctx, 0, 0, 156, 103, 12); ctx.fillStyle = node.color; ctx.fill(); ctx.fillStyle = node.textColor; ctx.font = '700 15px Inter, Arial'; ctx.fillText(node.title, 18, 45); ctx.globalAlpha *= .82; ctx.font = '11px Inter, Arial'; ctx.fillText(node.subtitle, 18, 66) }
    ctx.restore()
  })
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) { ctx.beginPath(); ctx.roundRect(x, y, width, height, radius) }

function Preview() { const navigate = useNavigate(); return <div className="preview-page"><button onClick={() => navigate('/')}><ArrowLeft size={17} /> Retour à l’éditeur</button><h1>Prévisualisation</h1><p>Votre schéma animé apparaîtra ici.</p></div> }

export default App
