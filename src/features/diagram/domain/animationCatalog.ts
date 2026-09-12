import type { AnimationCategory, ArrowAnimation, NodeAnimation } from './diagram'

type LocalizedAnimation = { category: AnimationCategory; id: NodeAnimation; name: string; fr: string; description: string; frDescription: string; glyph: string }
const node = (category: AnimationCategory, id: string, name: string, fr: string, description: string, frDescription: string, glyph: string): LocalizedAnimation => ({ category, id, name, fr, description, frDescription, glyph })

// Purposefully compact: each block animation has a visibly different use.
export const nodeAnimations: LocalizedAnimation[] = [
  node('entrance', 'none', 'Static', 'Fixe', 'No movement', 'Sans mouvement', '—'),
  node('entrance', 'fade', 'Fade in', 'Fondu entrant', 'Soft reveal', 'Apparition douce', '◐'),
  node('entrance', 'slide-left', 'Slide in', 'Glissement', 'Enters from one side', 'Entrée latérale', '→'),
  node('entrance', 'zoom-in', 'Zoom in', 'Zoom avant', 'Scale into view', 'Grossissement', '⊕'),
  node('emphasis', 'pulse', 'Pulse', 'Pulsation', 'Draw attention', 'Attire le regard', '✦'),
  node('emphasis', 'shake', 'Alert', 'Alerte', 'Error or warning', 'Erreur ou alerte', '↔'),
  node('technical', 'scan', 'Scan', 'Balayage', 'Software / data processing', 'Traitement logiciel / données', '⌁'),
  node('technical', 'deploy', 'Deploy', 'Déploiement', 'Release action', 'Mise en production', '⇧'),
  node('construction', 'build', 'Build', 'Construction', 'Assembly from the ground up', 'Assemblage depuis le sol', '▰'),
  node('electrical', 'energize', 'Energize', 'Power on', 'Power comes alive', 'Mise sous tension', 'ϟ'),
]

type ArrowCategory = 'software' | 'construction' | 'electrical'
type LocalizedArrow = { category: ArrowCategory; id: ArrowAnimation; name: string; fr: string; description: string; frDescription: string }
const arrow = (category: ArrowCategory, id: string, name: string, fr: string, description: string, frDescription: string): LocalizedArrow => ({ category, id, name, fr, description, frDescription })

// Every choice represents a flow moving through an orthogonal connector.
export const arrowAnimations: LocalizedArrow[] = [
  arrow('software', 'flow', 'Data packets', 'Paquets de données', 'Packets travel through the path', 'Des paquets parcourent le chemin'),
  arrow('software', 'pulse', 'API request', 'Requête API', 'A recurring request pulse', 'Une impulsion de requête récurrente'),
  arrow('software', 'stream', 'Live stream', 'Flux continu', 'Continuous data transmission', 'Transmission continue de données'),
  arrow('software', 'deploy', 'Deployment', 'Déploiement', 'A release travels to production', 'Une version part en production'),
  arrow('construction', 'truck', 'Material delivery', 'Livraison matériaux', 'Loads move through the worksite', 'Les charges circulent sur le chantier'),
  arrow('construction', 'workfront', 'Work progression', 'Avancement des travaux', 'The workfront advances step by step', 'Le front de travail avance par étapes'),
  arrow('construction', 'safety', 'Safety route', 'Parcours sécurité', 'A highlighted safe route', 'Un parcours sécurisé mis en évidence'),
  arrow('construction', 'survey-line', 'Survey trace', 'Trait de relevé', 'A surveying trace moves along', 'Un trait de relevé se propage'),
  arrow('electrical', 'current', 'Electric current', 'Courant électrique', 'Electric charge runs in the wire', 'La charge circule dans le câble'),
  arrow('electrical', 'voltage', 'Voltage wave', 'Onde de tension', 'Alternating energy wave', 'Onde d’énergie alternative'),
  arrow('electrical', 'signal-wire', 'Signal', 'Signal', 'Low-voltage signal propagates', 'Signal basse tension qui se propage'),
  arrow('electrical', 'short-test', 'Test pulse', 'Impulsion de test', 'Diagnostic pulse crosses the circuit', 'Impulsion de diagnostic dans le circuit'),
]

export const categoryLabels: Record<AnimationCategory, { en: string; fr: string }> = {
  entrance: { en: 'Entrance', fr: 'Entrée' }, emphasis: { en: 'Emphasis', fr: 'Emphase' }, technical: { en: 'Software & data', fr: 'Logiciel & données' }, construction: { en: 'Construction', fr: 'Construction / BTP' }, electrical: { en: 'Electrical', fr: 'Électrique' }, transitions: { en: 'Transitions', fr: 'Transitions' },
}
