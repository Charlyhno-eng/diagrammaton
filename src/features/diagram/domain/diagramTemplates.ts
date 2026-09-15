import type { AppTheme, Diagram, DiagramEdge, DiagramNode, NodeKind } from './diagram'

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

const databaseLandscape: Diagram = {
  title: 'Database internals', subtitle: 'Compare storage models and durability paths', background: 'midnight', width: 1200, height: 900,
  nodes: [
    node('pg-zone', 'group', 'Relational database', 'Tables, indexes, transactions and durability', 86, 48, 1028, 232, '#101922', { eyebrow: 'POSTGRESQL · ACID', badge: 'RELATIONAL' }),
    node('pg', 'technology', 'PostgreSQL', 'databases', 120, 137, 176, 92, '#101820', { technology: 'postgresql', eyebrow: 'DATABASE' }),
    node('tables', 'service', 'Tables & relations', 'Rows, columns, primary keys', 352, 137, 204, 92, '#13212a', { icon: 'panels', badge: 'SCHEMA' }),
    node('planner', 'service', 'Query planner', 'Chooses an execution plan', 610, 137, 204, 92, '#13212a', { icon: 'route', badge: 'QUERY' }),
    node('wal', 'database', 'Write-ahead log', 'Durable change records', 868, 137, 204, 92, '#13212a', { icon: 'database' }),
    node('mongo-zone', 'group', 'Document database', 'Flexible JSON-like documents grouped into collections', 86, 334, 1028, 232, '#101b17', { eyebrow: 'MONGODB · FLEXIBLE SCHEMA', badge: 'DOCUMENTS' }),
    node('mongo', 'technology', 'MongoDB', 'databases', 120, 423, 176, 92, '#101a16', { technology: 'mongodb', eyebrow: 'DATABASE' }),
    node('collections', 'service', 'Collections', 'Documents with flexible fields', 352, 423, 204, 92, '#13231b', { icon: 'file', badge: 'DOCUMENTS' }),
    node('wired', 'service', 'WiredTiger cache', 'Hot working set and indexes', 610, 423, 204, 92, '#13231b', { icon: 'activity', badge: 'CACHE' }),
    node('journal', 'database', 'Journal', 'Crash recovery records', 868, 423, 204, 92, '#13231b', { icon: 'database' }),
    node('cass-zone', 'group', 'Wide-column database', 'Distributed, write-optimized and horizontally scalable', 86, 620, 1028, 232, '#111724', { eyebrow: 'CASSANDRA · NO SINGLE LEADER', badge: 'WIDE COLUMN' }),
    node('cassandra', 'technology', 'Cassandra', 'databases', 120, 709, 176, 92, '#101722', { technology: 'cassandra', eyebrow: 'DATABASE' }),
    node('memtable', 'service', 'Memtables', 'Recent writes held in memory', 352, 709, 204, 92, '#151d2c', { icon: 'activity', badge: 'MEMORY' }),
    node('sstable', 'database', 'SSTables', 'Immutable sorted files', 610, 709, 204, 92, '#151d2c', { icon: 'database' }),
    node('compaction', 'service', 'Compaction', 'Merge files and remove stale data', 868, 709, 204, 92, '#151d2c', { icon: 'workflow', badge: 'BACKGROUND' }),
  ],
  edges: [
    edge('pg-t', 'pg', 'tables', 'right', 'left', '', '#2596be', { route: 'straight' }), edge('t-p', 'tables', 'planner', 'right', 'left', '', '#2596be', { route: 'straight' }), edge('p-w', 'planner', 'wal', 'right', 'left', '', '#2596be', { route: 'straight' }),
    edge('m-c', 'mongo', 'collections', 'right', 'left', '', '#47a248', { route: 'straight' }), edge('c-w', 'collections', 'wired', 'right', 'left', '', '#47a248', { route: 'straight' }), edge('w-j', 'wired', 'journal', 'right', 'left', '', '#47a248', { route: 'straight' }),
    edge('ca-m', 'cassandra', 'memtable', 'right', 'left', '', '#1287b1', { route: 'straight' }), edge('m-s', 'memtable', 'sstable', 'right', 'left', '', '#1287b1', { route: 'straight' }), edge('s-c', 'sstable', 'compaction', 'right', 'left', '', '#1287b1', { route: 'straight' }),
  ],
}

const explainer: Diagram = {
  title: 'Technical explainer', subtitle: 'A visual comparison grid for engineering concepts', background: 'midnight', width: 1200, height: 790,
  nodes: [
    node('e1', 'platform', 'Request routing', 'Distribute work using policy and context', 65, 65, 520, 190, '#10201c', { eyebrow: 'PATTERN 01', icon: 'route', items: ['Request', 'Router', 'Worker'] }),
    node('e2', 'platform', 'Shared cache', 'Reuse expensive results across consumers', 615, 65, 520, 190, '#121a27', { eyebrow: 'PATTERN 02', icon: 'database', items: ['Producer', 'Cache', 'Consumer'] }),
    node('e3', 'platform', 'Event stream', 'Decouple producers from downstream processing', 65, 300, 520, 190, '#251813', { eyebrow: 'PATTERN 03', icon: 'workflow', items: ['Producer', 'Topic', 'Consumer'] }),
    node('e4', 'platform', 'Observability', 'Correlate metrics, logs and distributed traces', 615, 300, 520, 190, '#211521', { eyebrow: 'PATTERN 04', icon: 'chart', items: ['Metrics', 'Logs', 'Traces'] }),
    node('e5', 'platform', 'Horizontal scaling', 'Add replicas and spread the active workload', 65, 535, 520, 190, '#151a2a', { eyebrow: 'PATTERN 05', icon: 'layers', items: ['Load balancer', 'Replica A', 'Replica B'] }),
    node('e6', 'platform', 'Tiered storage', 'Move inactive data to a cheaper storage class', 615, 535, 520, 190, '#241d10', { eyebrow: 'PATTERN 06', icon: 'database', items: ['Memory', 'SSD', 'Object store'] }),
  ], edges: [],
}

const deliveryPlatform: Diagram = {
  title: 'Software delivery platform', subtitle: 'From source code to an observable production runtime', background: 'midnight', width: 1300, height: 760,
  nodes: [
    node('source-zone', 'group', 'Product engineering', 'Source code and application runtimes', 42, 62, 280, 632, '#0d1218', { eyebrow: 'BUILD', badge: 'TEAM' }),
    node('react-tech', 'technology', 'React', 'runtimes', 94, 166, 176, 92, '#12181d', { technology: 'react', eyebrow: 'FRONTEND' }),
    node('node-tech', 'technology', 'Node.js', 'runtimes', 94, 322, 176, 92, '#12181d', { technology: 'nodejs', eyebrow: 'BACKEND' }),
    node('python-tech', 'technology', 'Python', 'runtimes', 94, 478, 176, 92, '#12181d', { technology: 'python', eyebrow: 'WORKERS' }),
    node('delivery-zone', 'group', 'Delivery pipeline', 'Test, package and provision continuously', 358, 62, 394, 632, '#0d1218', { eyebrow: 'SHIP', badge: 'DEVOPS' }),
    node('actions-tech', 'technology', 'GitHub Actions', 'devops', 402, 151, 176, 92, '#12181d', { technology: 'github-actions', eyebrow: 'CI / CD' }),
    node('docker-tech', 'technology', 'Docker', 'devops', 532, 298, 176, 92, '#12181d', { technology: 'docker', eyebrow: 'PACKAGE' }),
    node('terraform-tech', 'technology', 'Terraform', 'devops', 402, 445, 176, 92, '#12181d', { technology: 'terraform', eyebrow: 'PROVISION' }),
    node('runtime-zone', 'group', 'Production runtime', 'Orchestration, data and observability', 790, 62, 468, 632, '#0d1218', { eyebrow: 'RUN', badge: 'PLATFORM' }),
    node('k8s-tech', 'technology', 'Kubernetes', 'devops', 936, 138, 176, 92, '#12181d', { technology: 'kubernetes', eyebrow: 'ORCHESTRATION' }),
    node('postgres-tech', 'technology', 'PostgreSQL', 'databases', 832, 304, 176, 92, '#12181d', { technology: 'postgresql', eyebrow: 'PRIMARY DATA' }),
    node('redis-tech', 'technology', 'Redis', 'databases', 1042, 304, 176, 92, '#12181d', { technology: 'redis', eyebrow: 'CACHE' }),
    node('prometheus-tech', 'technology', 'Prometheus', 'observability', 832, 482, 176, 92, '#12181d', { technology: 'prometheus', eyebrow: 'METRICS' }),
    node('grafana-tech', 'technology', 'Grafana', 'observability', 1042, 482, 176, 92, '#12181d', { technology: 'grafana', eyebrow: 'DASHBOARDS' }),
  ],
  edges: [
    edge('react-ci', 'react-tech', 'actions-tech', 'right', 'left', 'push', '#c9d0db'), edge('node-ci', 'node-tech', 'actions-tech', 'right', 'left', '', '#c9d0db'), edge('python-ci', 'python-tech', 'actions-tech', 'right', 'left', '', '#c9d0db'),
    edge('ci-docker', 'actions-tech', 'docker-tech', 'bottom', 'top', 'image'), edge('docker-k8s', 'docker-tech', 'k8s-tech', 'right', 'left', 'deploy'), edge('terraform-k8s', 'terraform-tech', 'k8s-tech', 'right', 'left', 'infrastructure', '#8d6be8'),
    edge('k8s-pg', 'k8s-tech', 'postgres-tech', 'bottom', 'top', '', '#2596be'), edge('k8s-redis', 'k8s-tech', 'redis-tech', 'bottom', 'top', '', '#d94b3d'), edge('k8s-prom', 'k8s-tech', 'prometheus-tech', 'bottom', 'top', 'metrics', '#e6522c'), edge('prom-grafana', 'prometheus-tech', 'grafana-tech', 'right', 'left', 'query', '#f46800'),
  ],
}

const embeddedSystem: Diagram = {
  title: 'Connected edge controller', subtitle: 'Combine application services, embedded control and a physical circuit', background: 'midnight', width: 1400, height: 820,
  nodes: [
    node('software-zone', 'group', 'Software services', 'Build, route and observe device workloads', 40, 58, 390, 704, '#0d151c', { eyebrow: 'APPLICATION LAYER', badge: 'SOFTWARE' }),
    node('node-runtime', 'technology', 'Node.js', 'Device API', 116, 158, 238, 96, '#111b20', { technology: 'nodejs', eyebrow: 'CONTROL API' }),
    node('mqtt-broker', 'technology', 'Eclipse Mosquitto', 'MQTT messaging', 116, 335, 238, 96, '#111b20', { technology: 'mosquitto', eyebrow: 'EVENT BUS' }),
    node('metrics', 'technology', 'Prometheus', 'Telemetry and alerts', 116, 512, 238, 96, '#111b20', { technology: 'prometheus', eyebrow: 'OBSERVABILITY' }),

    node('edge-zone', 'group', 'Embedded controller', 'Firmware, interfaces and regulated power', 505, 58, 370, 704, '#0d181a', { eyebrow: 'EDGE LAYER', badge: 'FIRMWARE' }),
    node('mcu', 'electronic', 'Microcontroller', 'Firmware · GPIO · ADC', 575, 158, 230, 96, '#0d2024', { electronic: 'microcontroller', eyebrow: 'COMPUTE', badge: 'MCU' }),
    node('bus', 'electronic', 'Connector', 'I²C · SPI · UART', 575, 335, 230, 96, '#0d2024', { electronic: 'connector', eyebrow: 'DATA BUS' }),
    node('regulator', 'electronic', 'Power supply', '12 V → 3.3 V regulated', 575, 512, 230, 96, '#0d2024', { electronic: 'power-supply', eyebrow: 'POWER RAIL' }),

    node('physical-zone', 'group', 'Physical system', 'Sensors, switching, actuation and energy', 950, 58, 410, 704, '#15131c', { eyebrow: 'ELECTRONIC LAYER', badge: 'HARDWARE' }),
    node('sensor', 'electronic', 'Sensor', 'Temperature / pressure', 995, 150, 150, 96, '#181525', { electronic: 'sensor', eyebrow: 'INPUT' }),
    node('relay', 'electronic', 'Relay', 'Galvanic isolation', 1165, 150, 150, 96, '#181525', { electronic: 'relay', eyebrow: 'SWITCH' }),
    node('led', 'electronic', 'LED', 'Status indicator', 995, 337, 150, 96, '#181525', { electronic: 'led', eyebrow: 'OUTPUT' }),
    node('motor', 'electronic', 'Motor', 'Mechanical actuator', 1165, 337, 150, 96, '#181525', { electronic: 'motor', eyebrow: 'ACTUATOR' }),
    node('battery', 'electronic', 'Battery', '12 V energy source', 1080, 531, 150, 96, '#181525', { electronic: 'battery', eyebrow: 'ENERGY' }),
  ],
  edges: [
    edge('api-mqtt', 'node-runtime', 'mqtt-broker', 'bottom', 'top', 'commands', '#c9d0db'),
    edge('mqtt-mcu', 'mqtt-broker', 'mcu', 'right', 'left', 'MQTT', '#41eee1'),
    edge('mcu-metrics', 'mcu', 'metrics', 'left', 'right', 'telemetry', '#e6522c'),
    edge('mcu-bus', 'mcu', 'bus', 'bottom', 'top', 'GPIO / I²C', '#41eee1'),
    edge('bus-sensor', 'bus', 'sensor', 'right', 'left', 'I²C', '#41eee1', { direction: 'both' }),
    edge('bus-relay', 'bus', 'relay', 'right', 'left', 'GPIO', '#8df556'),
    edge('relay-motor', 'relay', 'motor', 'bottom', 'top', '12 V', '#f2b84b'),
    edge('bus-led', 'bus', 'led', 'right', 'left', 'status', '#8df556'),
    edge('battery-regulator', 'battery', 'regulator', 'left', 'right', '12 V', '#f2b84b'),
    edge('regulator-mcu', 'regulator', 'mcu', 'top', 'bottom', '3.3 V', '#f2b84b'),
  ],
}

const blank: Diagram = { title: 'Untitled architecture', subtitle: 'Build with semantic HTML components', background: 'midnight', width: 1280, height: 760, nodes: [], edges: [] }

export const diagramTemplates: TemplateInfo[] = [
  { id: 'blank', name: 'Blank HTML board', fr: 'Planche HTML vide', description: 'Start from semantic components', frDescription: 'Partir de composants sémantiques', diagram: blank },
  { id: 'architecture', name: 'System landscape', fr: 'Paysage système', description: 'Layered platform, ontology and integrations', frDescription: 'Plateforme, ontologie et intégrations en couches', diagram: architecture },
  { id: 'workflow', name: 'Decision workflow', fr: 'Flux de décision', description: 'Principles, branches and feedback loops', frDescription: 'Principes, branches et boucles de retour', diagram: workflow },
  { id: 'databases', name: 'Database internals', fr: 'Architecture des données', description: 'Compare PostgreSQL, MongoDB and Cassandra', frDescription: 'Comparer PostgreSQL, MongoDB et Cassandra', diagram: databaseLandscape },
  { id: 'delivery', name: 'Software delivery', fr: 'Plateforme de livraison', description: 'CI/CD, containers, runtime and observability', frDescription: 'CI/CD, conteneurs, runtime et observabilité', diagram: deliveryPlatform },
  { id: 'embedded', name: 'Software + electronics', fr: 'Logiciel + électronique', description: 'Connected services, firmware and physical components', frDescription: 'Services connectés, firmware et composants physiques', diagram: embeddedSystem },
  { id: 'explainer', name: 'Technical explainer', fr: 'Planche pédagogique', description: 'Editorial grid for technical concepts', frDescription: 'Grille éditoriale de concepts techniques', diagram: explainer },
]

export const cloneDiagram = (diagram: Diagram): Diagram => JSON.parse(JSON.stringify(diagram)) as Diagram
export const cloneDiagramWithTheme = (diagram: Diagram, background: AppTheme): Diagram => ({ ...cloneDiagram(diagram), background })
export const defaultDiagram = cloneDiagram(architecture)
