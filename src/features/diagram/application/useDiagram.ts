import { useState } from 'react'
import { defaultDiagram } from '../domain/diagramTemplates'
import type { ArrowAnimation, Diagram, DiagramEdge, DiagramNode, NodeAnimation, NodeKind, Side } from '../domain/diagram'

const defaults: Record<NodeKind, Pick<DiagramNode, 'title' | 'subtitle' | 'width' | 'height' | 'color' | 'icon' | 'eyebrow'>> = {
  card: { title: 'New card', subtitle: 'Describe this step', width: 210, height: 112, color: '#18243a', icon: 'box', eyebrow: 'COMPONENT' },
  service: { title: 'New service', subtitle: 'Responsibility', width: 210, height: 88, color: '#151a20', icon: 'cpu', eyebrow: 'SERVICE' },
  group: { title: 'New group', subtitle: 'A semantic boundary', width: 520, height: 280, color: '#0d1218', icon: 'layers', eyebrow: 'BOUNDARY' },
  platform: { title: 'New platform', subtitle: 'Capabilities and tools', width: 340, height: 210, color: '#10151d', icon: 'panels', eyebrow: 'PLATFORM' },
  database: { title: 'Data store', subtitle: 'System of record', width: 230, height: 100, color: '#10151d', icon: 'database', eyebrow: 'DATA' },
  actor: { title: 'Team', subtitle: 'Owner or user', width: 156, height: 156, color: '#171c27', icon: 'users', eyebrow: 'ACTOR' },
  note: { title: 'Automation', subtitle: 'Trigger and outcome', width: 220, height: 86, color: '#231a3f', icon: 'zap', eyebrow: 'ACTION' },
  metric: { title: '99.9%', subtitle: 'Key result', width: 164, height: 116, color: '#102521', icon: 'activity', eyebrow: 'METRIC' },
}

export function useDiagram() {
  const [diagram, setDiagram] = useState<Diagram>(defaultDiagram)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [arrowAnimation, setArrowAnimation] = useState<ArrowAnimation>('flow')
  const [copiedNode, setCopiedNode] = useState<{ template: Omit<DiagramNode, 'id' | 'x' | 'y'>; x: number; y: number; count: number } | null>(null)
  const selected = diagram.nodes.find(node => node.id === selectedId) ?? null
  const selectedEdge = diagram.edges.find(edge => edge.id === selectedEdgeId) ?? null
  const updateNode = (patch: Partial<DiagramNode>) => { if (!selected) return; setDiagram(current => ({ ...current, nodes: current.nodes.map(node => node.id === selected.id ? { ...node, ...patch } : node) })) }
  const moveNode = (id: string, x: number, y: number) => setDiagram(current => ({ ...current, nodes: current.nodes.map(node => node.id === id ? { ...node, x, y } : node) }))
  const resizeNode = (id: string, width: number, height: number) => setDiagram(current => ({ ...current, nodes: current.nodes.map(node => node.id === id ? { ...node, width, height } : node) }))
  const addNode = (kind: NodeKind = 'card') => {
    const id = `${kind}-${Date.now()}`, base = defaults[kind], offset = diagram.nodes.length % 8 * 18
    const item: DiagramNode = { id, kind, ...base, x: 310 + offset, y: 230 + offset, textColor: '#f6f8fb', animation: 'none', items: kind === 'platform' ? ['Capability', 'Service', 'Tool'] : undefined }
    setDiagram(current => ({ ...current, nodes: [...current.nodes, item] })); setSelectedId(id); setSelectedEdgeId(null)
  }
  const copySelectedNode = () => { if (!selected) return; const { id: _id, x, y, ...template } = selected; setCopiedNode({ template, x, y, count: 0 }) }
  const pasteNode = () => { if (!copiedNode) return; const id = `block-${Date.now()}`, offset = (copiedNode.count + 1) * 28; setDiagram(current => ({ ...current, nodes: [...current.nodes, { ...copiedNode.template, id, x: copiedNode.x + offset, y: copiedNode.y + offset }] })); setCopiedNode(current => current ? { ...current, count: current.count + 1 } : current); setSelectedId(id); setSelectedEdgeId(null) }
  const removeSelectedNode = () => { if (!selected) return; setDiagram(current => ({ ...current, nodes: current.nodes.filter(node => node.id !== selected.id), edges: current.edges.filter(edge => edge.from !== selected.id && edge.to !== selected.id) })); setSelectedId(null) }
  const connect = (from: string, to: string, fromSide: Side = 'right', toSide: Side = 'left') => setDiagram(current => ({ ...current, edges: [...current.edges, { id: `edge-${Date.now()}`, from, to, fromSide, toSide, direction: 'forward', label: '', animation: arrowAnimation, color: '#77a7ff', route: 'curve' }] }))
  const setNodeAnimation = (animation: NodeAnimation) => updateNode({ animation })
  const updateEdge = (patch: Partial<DiagramEdge>) => { if (!selectedEdge) return; setDiagram(current => ({ ...current, edges: current.edges.map(edge => edge.id === selectedEdge.id ? { ...edge, ...patch } : edge) })) }
  const removeSelectedEdge = () => { if (!selectedEdge) return; setDiagram(current => ({ ...current, edges: current.edges.filter(edge => edge.id !== selectedEdge.id) })); setSelectedEdgeId(null) }
  const applyArrowAnimation = (animation: ArrowAnimation) => { setArrowAnimation(animation); if (selectedEdge) updateEdge({ animation }); else setDiagram(current => ({ ...current, edges: current.edges.map(edge => ({ ...edge, animation })) })) }
  const selectNode = (id: string | null) => { setSelectedId(id); setSelectedEdgeId(null) }
  const selectEdge = (id: string | null) => { setSelectedEdgeId(id); setSelectedId(null); const edge = diagram.edges.find(item => item.id === id); if (edge) setArrowAnimation(edge.animation) }
  const loadDiagram = (next: Diagram) => { setDiagram(next); setSelectedId(null); setSelectedEdgeId(null) }
  return { diagram, setDiagram, loadDiagram, selected, selectedId, setSelectedId: selectNode, selectedEdge, selectedEdgeId, setSelectedEdgeId: selectEdge, updateNode, updateEdge, removeSelectedEdge, removeSelectedNode, moveNode, resizeNode, addNode, copySelectedNode, pasteNode, canPaste: Boolean(copiedNode), connect, arrowAnimation, setArrowAnimation: applyArrowAnimation, setNodeAnimation }
}
