import type { Diagram, DiagramEdge, DiagramNode, NodeKind } from './diagram'

type TemplateInfo = { id: string; name: string; fr: string; description: string; frDescription: string; diagram: Diagram }

const node = (id: string, kind: NodeKind, title: string, subtitle: string, x: number, y: number, width: number, height: number, color: string, extra: Partial<DiagramNode> = {}): DiagramNode => ({
  id, kind, title, subtitle, x, y, width, height, color, textColor: '#f6f8fb', animation: 'none', ...extra,
})
const edge = (id: string, from: string, to: string, fromSide: DiagramEdge['fromSide'], toSide: DiagramEdge['toSide'], label = '', color = '#84f24b', extra: Partial<DiagramEdge> = {}): DiagramEdge => ({
  id, from, to, fromSide, toSide, label, color, animation: 'flow', direction: 'forward', route: 'curve', ...extra,
})

const architecture: Diagram = {
  title: 'AI operations platform', subtitle: 'Teams, automation, ontology and systems of action', background: 'midnight', width: 1400, height: 920,
  nodes: [
    node('analytics', 'platform', 'Analytics & workflows', 'Observe, explore and decide', 72, 105, 350, 210, '#10151d', { eyebrow: 'EXPERIENCE', icon: 'chart', items: ['Dashboards', 'Investigations', 'Workflows'] }),
    node('automation', 'platform', 'Automations', 'Orchestrate intelligent operations', 525, 105, 350, 210, '#10151d', { eyebrow: 'CONTROL PLANE', icon: 'workflow', items: ['Agents', 'Rules', 'Approvals'] }),
    node('products', 'platform', 'Products & SDKs', 'Build on a governed foundation', 978, 105, 350, 210, '#10151d', { eyebrow: 'DEVELOPER LAYER', icon: 'code', items: ['SDK', 'API', 'Applications'] }),
    node('ontology', 'group', 'Operational ontology', 'A shared semantic layer connecting decisions to real-world objects', 214, 400, 972, 310, '#0d1218', { eyebrow: 'LIVE OPERATING MODEL', icon: 'network' }),
    node('inventory', 'service', 'Inventory', 'Stock & availability', 278, 493, 190, 88, '#151a20', { icon: 'boxes', badge: 'OBJECT' }),
    node('supplier', 'service', 'Suppliers', 'Lead times & scores', 508, 493, 190, 88, '#151a20', { icon: 'truck', badge: 'OBJECT' }),
    node('orders', 'service', 'Purchase orders', 'Create and approve', 738, 493, 190, 88, '#151a20', { icon: 'file', badge: 'ACTION' }),
    node('routing', 'service', 'Route planning', 'Optimize fulfillment', 968, 493, 160, 88, '#151a20', { icon: 'route', badge: 'MODEL' }),
    node('audit', 'metric', '98.7%', 'Inventory accuracy', 318, 616, 150, 64, '#151a20', { eyebrow: 'LIVE KPI', icon: 'activity' }),
    node('restock', 'note', 'Trigger restock', 'When cover < 7 days', 578, 614, 194, 68, '#231a3f', { badge: 'AUTOMATION', icon: 'zap' }),
    node('allocation', 'note', 'Allocate inventory', 'Region-aware policy', 878, 614, 194, 68, '#182e12', { badge: 'AUTOMATION', icon: 'sparkles' }),
    node('data', 'database', 'Data', 'Warehouses · streams · files', 92, 796, 240, 92, '#10151d', { icon: 'database', items: ['SQL', 'Lakehouse', 'Events'] }),
    node('models', 'platform', 'Models', 'Predict · retrieve · optimize', 573, 786, 254, 104, '#10151d', { icon: 'cpu', items: ['LLM', 'Forecast', 'Vision'] }),
    node('actions', 'service', 'Systems of action', 'ERP · CRM · operations', 1068, 796, 240, 92, '#10151d', { icon: 'panels', items: ['ERP', 'WMS', 'CRM'] }),
  ],
  edges: [
    edge('a-o', 'analytics', 'ontology', 'bottom', 'top', 'insights', '#c9d0db'), edge('au-o', 'automation', 'ontology', 'bottom', 'top', 'decisions'), edge('p-o', 'products', 'ontology', 'bottom', 'top', 'applications', '#c9d0db'),
    edge('o-d', 'data', 'ontology', 'top', 'bottom', 'context', '#c9d0db'), edge('o-m', 'models', 'ontology', 'top', 'bottom', 'intelligence'), edge('o-s', 'actions', 'ontology', 'top', 'bottom', 'execution', '#c9d0db'),
    edge('i-s', 'inventory', 'supplier', 'right', 'left', '', '#84f24b'), edge('s-o', 'supplier', 'orders', 'right', 'left', '', '#84f24b'), edge('o-r', 'orders', 'routing', 'right', 'left', '', '#84f24b'),
  ],
}

const workflow: Diagram = {
  title: 'Product engineering principles', subtitle: 'From request to measurable impact', background: 'midnight', width: 1280, height: 720,
  nodes: [
    node('input', 'card', 'Input', 'Request / data', 62, 304, 150, 92, '#101720', { eyebrow: 'START', icon: 'inbox' }),
    node('coupling', 'group', 'Big ball of mud', 'Tight coupling · high latency · friction', 398, 52, 480, 188, '#10141a', { eyebrow: 'ANTI-PATTERN', badge: 'AVOID', icon: 'warning' }),
    node('srp', 'card', 'Single responsibility', 'Keep each unit focused', 360, 318, 242, 112, '#101720', { eyebrow: 'PRINCIPLE 05', icon: 'focus' }),
    node('composition', 'card', 'Composition', 'Separate, combine, evolve', 712, 318, 242, 112, '#101720', { eyebrow: 'PRINCIPLE 08', icon: 'layers' }),
    node('fail', 'note', 'Fail fast', 'Detect problems early', 390, 536, 228, 94, '#2b0818', { eyebrow: 'PRINCIPLE 10', icon: 'alert' }),
    node('measure', 'metric', '?', 'Optimize what matters', 1056, 292, 150, 150, '#071c20', { eyebrow: 'MEASURE FIRST', icon: 'gauge' }),
  ],
  edges: [
    edge('i-c', 'input', 'coupling', 'right', 'left', 'legacy path', '#40616b', { dashed: true }), edge('i-s', 'input', 'srp', 'right', 'left', '', '#27ead7'), edge('s-c', 'srp', 'composition', 'right', 'left', '', '#27ead7'), edge('c-m', 'composition', 'measure', 'right', 'left', 'feedback', '#27ead7'), edge('i-f', 'input', 'fail', 'right', 'left', '', '#ed0060'), edge('couple-m', 'coupling', 'measure', 'right', 'top', '', '#31545a', { dashed: true }),
  ],
}

const blank: Diagram = { title: 'Untitled architecture', subtitle: 'Build with semantic HTML components', background: 'midnight', width: 1280, height: 760, nodes: [], edges: [] }

export const diagramTemplates: TemplateInfo[] = [
  { id: 'architecture', name: 'System landscape', fr: 'Paysage système', description: 'Layered platform, ontology and integrations', frDescription: 'Plateforme, ontologie et intégrations en couches', diagram: architecture },
  { id: 'workflow', name: 'Decision workflow', fr: 'Flux de décision', description: 'Principles, branches and feedback loops', frDescription: 'Principes, branches et boucles de retour', diagram: workflow },
  { id: 'blank', name: 'Blank HTML board', fr: 'Planche HTML vide', description: 'Start from semantic components', frDescription: 'Partir de composants sémantiques', diagram: blank },
]

export const cloneDiagram = (diagram: Diagram): Diagram => JSON.parse(JSON.stringify(diagram)) as Diagram
export const defaultDiagram = cloneDiagram(architecture)
