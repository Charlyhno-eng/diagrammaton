import { useState } from 'react'
import type { AppTheme, Locale } from '../../diagram/domain/diagram'

const copy = {
  en: { diagrams: 'My diagrams', journey: 'Product journey', export: 'Export GIF', theme: 'Theme', properties: 'Properties', link: 'Link', linkColor: 'Link color', deleteLink: 'Delete link', delete: 'Delete', copy: 'Copy block', paste: 'Paste block', addBlock: 'Add block', animation: 'Step animations', arrowAnimations: 'Arrow animations', preview: 'Preview', previewHint: 'Play all animations', title: 'Title', description: 'Description', color: 'Step color', language: 'Language', saved: 'Saved just now', linkFrom: 'Choose the starting step', linkTo: 'Choose the destination step', selectedStep: 'SELECTED STEP', software: 'Software & data', construction: 'Construction / BTP', electrical: 'Electrical diagrams', gif: 'GIF EXPORT', ready: 'Ready for export', exportDescription: 'The GIF encoder runs locally in your browser. The exported file preserves your selected node and arrow animations.', cancel: 'Cancel', create: 'Create GIF', newStep: 'New step', describeStep: 'Describe this step' },
  fr: { diagrams: 'Mes schémas', journey: 'Parcours produit', export: 'Exporter le GIF', theme: 'Thème', properties: 'Propriétés', link: 'Liaison', linkColor: 'Couleur de la liaison', deleteLink: 'Supprimer la liaison', delete: 'Supprimer', copy: 'Copier le bloc', paste: 'Coller le bloc', addBlock: 'Ajouter un bloc', animation: 'Animations du bloc', arrowAnimations: 'Animations des flèches', preview: 'Prévisualiser', previewHint: 'Lire toutes les animations', title: 'Titre', description: 'Description', color: 'Couleur du bloc', language: 'Langue', saved: 'Enregistré à l’instant', linkFrom: 'Choisissez le bloc de départ', linkTo: 'Choisissez le bloc d’arrivée', selectedStep: 'BLOC SÉLECTIONNÉ', software: 'Logiciel & données', construction: 'Construction / BTP', electrical: 'Schémas électriques', gif: 'EXPORT GIF', ready: 'Prêt à exporter', exportDescription: 'L’encodeur GIF fonctionne localement dans votre navigateur. Le fichier conserve les animations de blocs et de flèches sélectionnées.', cancel: 'Annuler', create: 'Créer le GIF', newStep: 'Nouvelle étape', describeStep: 'Décrivez cette étape' },
}

export function usePreferences() {
  const [locale, setLocale] = useState<Locale>('en')
  const [theme, setTheme] = useState<AppTheme>('midnight')
  return { locale, setLocale, theme, setTheme, t: copy[locale] }
}
