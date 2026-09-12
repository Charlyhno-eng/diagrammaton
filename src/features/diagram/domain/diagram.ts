export type Locale = 'en' | 'fr'
export type AppTheme = 'midnight' | 'light' | 'blueprint' | 'electric'
export type NodeKind = 'block' | 'image'
export type AnimationCategory = 'entrance' | 'emphasis' | 'technical' | 'construction' | 'electrical' | 'transitions'
export type NodeAnimation = string
export type ArrowAnimation = string

export type DiagramNode = {
  id: string; kind: NodeKind; title: string; subtitle: string; x: number; y: number
  color: string; textColor: string; animation: NodeAnimation; delay: number; image?: string
}
export type DiagramEdge = { id: string; from: string; to: string; label: string; animation: ArrowAnimation; color: string }
export type Diagram = { nodes: DiagramNode[]; edges: DiagramEdge[]; background: AppTheme }

export const initialDiagram: Diagram = {
  background: 'midnight',
  nodes: [
    { id: 'start', kind: 'block', title: 'Start', subtitle: 'Your idea', x: 72, y: 220, color: '#f6c85f', textColor: '#182036', animation: 'fade', delay: 0 },
    { id: 'research', kind: 'block', title: 'Research', subtitle: 'Understand the need', x: 330, y: 125, color: '#7a6fc8', textColor: '#ffffff', animation: 'slide-left', delay: 300 },
    { id: 'prototype', kind: 'block', title: 'Prototype', subtitle: 'Give it a shape', x: 330, y: 324, color: '#2b9ea3', textColor: '#ffffff', animation: 'scan', delay: 600 },
    { id: 'result', kind: 'block', title: 'Release', subtitle: 'Ready to share', x: 605, y: 220, color: '#e87874', textColor: '#ffffff', animation: 'bounce', delay: 900 },
  ],
  edges: [
    { id: 'e1', from: 'start', to: 'research', label: '', animation: 'flow', color: '#77a7ff' },
    { id: 'e2', from: 'start', to: 'prototype', label: '', animation: 'flow', color: '#77a7ff' },
    { id: 'e3', from: 'research', to: 'result', label: '', animation: 'stream', color: '#a68cff' },
    { id: 'e4', from: 'prototype', to: 'result', label: '', animation: 'current', color: '#4fddcf' },
  ],
}
