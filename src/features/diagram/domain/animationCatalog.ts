import type { AnimationCategory, ArrowAnimation, NodeAnimation } from './diagram'

type LocalizedAnimation = { category: AnimationCategory; id: NodeAnimation; name: string; fr: string; description: string; frDescription: string; glyph: string }
const node = (category: AnimationCategory, id: string, name: string, fr: string, description: string, frDescription: string, glyph: string): LocalizedAnimation => ({ category, id, name, fr, description, frDescription, glyph })

// Purposefully compact: each block animation has a visibly different use.
export const nodeAnimations: LocalizedAnimation[] = [
  node('entrance', 'none', 'Static', 'Fixe', 'No movement', 'Sans mouvement', '—'),
  node('entrance', 'slide-left', 'Slide in', 'Glissement', 'Enters from one side', 'Entrée latérale', '→'),
  node('entrance', 'zoom-in', 'Zoom in', 'Zoom avant', 'Scale into view', 'Grossissement', '⊕'),
  node('emphasis', 'pulse', 'Pulse', 'Pulsation', 'Draw attention', 'Attire le regard', '✦'),
  node('emphasis', 'shake', 'Alert', 'Alerte', 'Error or warning', 'Erreur ou alerte', '↔'),
  node('technical', 'scan', 'Scan', 'Balayage', 'Software / data processing', 'Traitement logiciel / données', '⌁'),
  node('technical', 'deploy', 'Deploy', 'Déploiement', 'Release action', 'Mise en production', '⇧'),
  node('construction', 'build', 'Build', 'Construction', 'Assembly from the ground up', 'Assemblage depuis le sol', '▰'),
  node('electrical', 'energize', 'Energize', 'Power on', 'Power comes alive', 'Mise sous tension', 'ϟ'),
]

type LocalizedArrow = { id: ArrowAnimation; name: string; fr: string; description: string; frDescription: string }
const arrow = (id: string, name: string, fr: string, description: string, frDescription: string): LocalizedArrow => ({ id, name, fr, description, frDescription })

export const arrowAnimations: LocalizedArrow[] = [
  arrow('none', 'Static', 'Statique', 'A clean, non-animated connector', 'Une liaison nette, sans animation'),
  arrow('flow', 'Flow', 'Flux', 'A continuous flow moves through the connector', 'Un flux continu parcourt la liaison'),
  arrow('current', 'Current', 'Courant', 'An energetic flow travels through the connector', 'Un flux énergique parcourt la liaison'),
]

export const categoryLabels: Record<AnimationCategory, { en: string; fr: string }> = {
  entrance: { en: 'Entrance', fr: 'Entrée' }, emphasis: { en: 'Emphasis', fr: 'Emphase' }, technical: { en: 'Software & data', fr: 'Logiciel & données' }, construction: { en: 'Construction', fr: 'Construction / BTP' }, electrical: { en: 'Electrical', fr: 'Électrique' }, transitions: { en: 'Transitions', fr: 'Transitions' },
}
