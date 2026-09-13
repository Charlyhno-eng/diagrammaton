import { useState } from 'react'
import { initialDiagram, type ArrowAnimation, type Diagram, type DiagramEdge, type DiagramNode, type NodeAnimation, type Side } from '../domain/diagram'

export function useDiagram() {
  const [diagram, setDiagram] = useState<Diagram>(initialDiagram)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [arrowAnimation, setArrowAnimation] = useState<ArrowAnimation>('flow')
  const [copiedNode, setCopiedNode] = useState<{ template: Omit<DiagramNode, 'id' | 'x' | 'y'>; x: number; y: number; count: number } | null>(null)
  const selected = diagram.nodes.find(node => node.id === selectedId) ?? null
  const selectedEdge = diagram.edges.find(edge => edge.id === selectedEdgeId) ?? null
  const updateNode = (patch: Partial<DiagramNode>) => { if (!selected) return; setDiagram(current => ({ ...current, nodes: current.nodes.map(node => node.id === selected.id ? { ...node, ...patch } : node) })) }
  const moveNode = (id: string, x: number, y: number) => setDiagram(current => ({ ...current, nodes: current.nodes.map(node => node.id === id ? { ...node, x, y } : node) }))
  const resizeNode = (id: string, width: number, height: number) => setDiagram(current => ({ ...current, nodes: current.nodes.map(node => node.id === id ? { ...node, width, height } : node) }))
  const addNode = () => { const id = `block-${Date.now()}`; const offset = diagram.nodes.length * 22; setDiagram(current => ({ ...current, nodes: [...current.nodes, { id, title: 'New step', subtitle: 'Describe this step', x: 250 + offset, y: 200 + offset, width: 184, height: 118, color: '#2e74ca', textColor: '#fff', animation: 'none' }] })); setSelectedId(id); setSelectedEdgeId(null) }
  const copySelectedNode = () => { if (!selected) return; const { id: _id, x, y, ...template } = selected; setCopiedNode({ template, x, y, count: 0 }) }
  const pasteNode = () => {
    if (!copiedNode) return
    const id = `block-${Date.now()}`, offset = (copiedNode.count + 1) * 28
    setDiagram(current => ({ ...current, nodes: [...current.nodes, { ...copiedNode.template, id, x: copiedNode.x + offset, y: copiedNode.y + offset }] }))
    setCopiedNode(current => current ? { ...current, count: current.count + 1 } : current)
    setSelectedId(id); setSelectedEdgeId(null)
  }
  const removeSelectedNode = () => { if (!selected) return; setDiagram(current => ({ ...current, nodes: current.nodes.filter(node => node.id !== selected.id), edges: current.edges.filter(edge => edge.from !== selected.id && edge.to !== selected.id) })); setSelectedId(null) }
  const connect = (from: string, to: string, fromSide: Side = 'right', toSide: Side = 'left') => setDiagram(current => ({ ...current, edges: [...current.edges, { id: `edge-${Date.now()}`, from, to, fromSide, toSide, direction: 'forward', label: '', animation: arrowAnimation, color: '#77a7ff' }] }))
  const setNodeAnimation = (animation: NodeAnimation) => updateNode({ animation })
  const updateEdge = (patch: Partial<DiagramEdge>) => { if (!selectedEdge) return; setDiagram(current => ({ ...current, edges: current.edges.map(edge => edge.id === selectedEdge.id ? { ...edge, ...patch } : edge) })) }
  const removeSelectedEdge = () => { if (!selectedEdge) return; setDiagram(current => ({ ...current, edges: current.edges.filter(edge => edge.id !== selectedEdge.id) })); setSelectedEdgeId(null) }
  const applyArrowAnimation = (animation: ArrowAnimation) => { setArrowAnimation(animation); if (selectedEdge) updateEdge({ animation }); else setDiagram(current => ({ ...current, edges: current.edges.map(edge => ({ ...edge, animation })) })) }
  const selectNode = (id: string) => { setSelectedId(id); setSelectedEdgeId(null) }
  const selectEdge = (id: string) => { setSelectedEdgeId(id); const edge = diagram.edges.find(item => item.id === id); if (edge) setArrowAnimation(edge.animation) }
  return { diagram, setDiagram, selected, selectedId, setSelectedId: selectNode, selectedEdge, selectedEdgeId, setSelectedEdgeId: selectEdge, updateNode, updateEdge, removeSelectedEdge, removeSelectedNode, moveNode, resizeNode, addNode, copySelectedNode, pasteNode, canPaste: Boolean(copiedNode), connect, arrowAnimation, setArrowAnimation: applyArrowAnimation, setNodeAnimation }
}
