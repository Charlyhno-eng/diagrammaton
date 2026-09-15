export type Locale = 'en' | 'fr'
export type AppTheme = 'midnight' | 'light' | 'blueprint' | 'electric'
export type AnimationCategory = 'entrance' | 'emphasis' | 'technical' | 'construction' | 'electrical' | 'transitions'
export type NodeAnimation = string
export type ArrowAnimation = string
export type Side = 'top' | 'right' | 'bottom' | 'left'
export type NodeKind = 'card' | 'service' | 'group' | 'platform' | 'database' | 'actor' | 'note' | 'metric'
export type EdgeRoute = 'orthogonal' | 'curve' | 'straight'

export type DiagramNode = {
  id: string; kind: NodeKind; title: string; subtitle: string; x: number; y: number
  eyebrow?: string; badge?: string; icon?: string; items?: string[]
  width?: number; height?: number; color: string; textColor: string; animation: NodeAnimation; muted?: boolean
}
export type DiagramEdge = { id: string; from: string; to: string; fromSide: Side; toSide: Side; direction: 'forward' | 'both'; label: string; animation: ArrowAnimation; color: string; route?: EdgeRoute; dashed?: boolean }
export type Diagram = { title: string; subtitle: string; nodes: DiagramNode[]; edges: DiagramEdge[]; background: AppTheme; width: number; height: number }

export const initialDiagram: Diagram = {
  title: 'Untitled system',
  subtitle: 'HTML architecture diagram',
  background: 'midnight',
  width: 1280,
  height: 760,
  nodes: [],
  edges: [],
}
