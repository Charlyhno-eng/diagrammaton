export type Locale = 'en' | 'fr'
export type AppTheme = 'midnight' | 'light' | 'blueprint' | 'electric'
export type AnimationCategory = 'entrance' | 'emphasis' | 'technical' | 'construction' | 'electrical' | 'transitions'
export type NodeAnimation = string
export type ArrowAnimation = string
export type Side = 'top' | 'right' | 'bottom' | 'left'

export type DiagramNode = {
  id: string; title: string; subtitle: string; x: number; y: number
  width?: number; height?: number; color: string; textColor: string; animation: NodeAnimation
}
export type DiagramEdge = { id: string; from: string; to: string; fromSide: Side; toSide: Side; direction: 'forward' | 'both'; label: string; animation: ArrowAnimation; color: string }
export type Diagram = { nodes: DiagramNode[]; edges: DiagramEdge[]; background: AppTheme }

export const initialDiagram: Diagram = {
  background: 'midnight',
  nodes: [],
  edges: [],
}
