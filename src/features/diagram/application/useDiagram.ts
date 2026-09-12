import { useState } from 'react'
import { initialDiagram, type ArrowAnimation, type Diagram, type DiagramEdge, type DiagramNode, type NodeAnimation } from '../domain/diagram'

export function useDiagram() {
  const [diagram, setDiagram] = useState<Diagram>(initialDiagram)
  const [selectedId, setSelectedId] = useState('research')
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [arrowAnimation, setArrowAnimation] = useState<ArrowAnimation>('flow')
  const selected = diagram.nodes.find(node => node.id === selectedId) ?? diagram.nodes[0]
  const selectedEdge = diagram.edges.find(edge => edge.id === selectedEdgeId) ?? null
  const updateNode = (patch: Partial<DiagramNode>) => setDiagram(current => ({ ...current, nodes: current.nodes.map(node => node.id === selected.id ? { ...node, ...patch } : node) }))
  const moveNode = (id: string, x: number, y: number) => setDiagram(current => ({ ...current, nodes: current.nodes.map(node => node.id === id ? { ...node, x, y } : node) }))
  const addNode = () => { const id = `block-${Date.now()}`; setDiagram(current => ({ ...current, nodes: [...current.nodes, { id, kind: 'block', title: 'New step', subtitle: 'Describe this step', x: 470, y: 440, color: '#2e74ca', textColor: '#fff', animation: 'fade', delay: 0 }] })); setSelectedId(id) }
  const addImageToNode = (image: string) => updateNode({ kind: 'image', image })
  const connect = (from: string, to: string) => setDiagram(current => current.edges.some(edge => edge.from === from && edge.to === to) ? current : ({ ...current, edges: [...current.edges, { id: `edge-${Date.now()}`, from, to, label: '', animation: arrowAnimation, color: '#77a7ff' }] }))
  const setNodeAnimation = (animation: NodeAnimation) => updateNode({ animation })
  const updateEdge = (patch: Partial<DiagramEdge>) => { if (!selectedEdge) return; setDiagram(current => ({ ...current, edges: current.edges.map(edge => edge.id === selectedEdge.id ? { ...edge, ...patch } : edge) })) }
  const removeSelectedEdge = () => { if (!selectedEdge) return; setDiagram(current => ({ ...current, edges: current.edges.filter(edge => edge.id !== selectedEdge.id) })); setSelectedEdgeId(null) }
  const applyArrowAnimation = (animation: ArrowAnimation) => { setArrowAnimation(animation); if (selectedEdge) updateEdge({ animation }); else setDiagram(current => ({ ...current, edges: current.edges.map(edge => ({ ...edge, animation })) })) }
  const selectNode = (id: string) => { setSelectedId(id); setSelectedEdgeId(null) }
  const selectEdge = (id: string) => { setSelectedEdgeId(id); const edge = diagram.edges.find(item => item.id === id); if (edge) setArrowAnimation(edge.animation) }
  return { diagram, setDiagram, selected, selectedId, setSelectedId: selectNode, selectedEdge, selectedEdgeId, setSelectedEdgeId: selectEdge, updateNode, updateEdge, removeSelectedEdge, moveNode, addNode, addImageToNode, connect, arrowAnimation, setArrowAnimation: applyArrowAnimation, setNodeAnimation }
}
