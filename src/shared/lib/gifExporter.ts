import type { Diagram } from '../../features/diagram/domain/diagram'
import { buildDiagramHtml, downloadDiagramHtml } from './htmlExporter'

const GIF_SERVICE_PATH = '/api/gif'

export const gifFileName = (title: string) => `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'diagrammaton'}.gif`

/** Sends the self-contained HTML artifact to the local TypeScript/Playwright renderer. */
export async function createDiagramGif(html: string) {
  let response: Response
  try {
    response = await fetch(GIF_SERVICE_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html }),
    })
  } catch {
    throw new Error('The GIF renderer is unavailable. Restart the Diagrammaton server.')
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null
    throw new Error(payload?.error || `GIF service failed with HTTP ${response.status}.`)
  }
  return response.blob()
}

/** Downloads the self-contained HTML first, then its high-fidelity Playwright/Sharp GIF companion. */
export async function downloadDiagramArtifacts(diagram: Diagram) {
  const html = buildDiagramHtml(diagram)
  downloadDiagramHtml(diagram, html)
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  const blob = await createDiagramGif(html)
  downloadBlob(blob, gifFileName(diagram.title))
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
