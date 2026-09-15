import { describe, expect, it } from 'vitest'
import { diagramTemplates } from '../src/features/diagram/domain/diagramTemplates'
import { getTechnology } from '../src/features/diagram/domain/technologyCatalog'
import { getElectronicComponent } from '../src/features/diagram/domain/electronicCatalog'
import { buildDiagramHtml } from '../src/shared/lib/htmlExporter'

describe('standalone HTML export', () => {
  const diagram = diagramTemplates.find(template => template.id === 'delivery')!.diagram
  const html = buildDiagramHtml(diagram)

  it('builds a complete standalone document without remote assets', () => {
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('<style>')
    expect(html).not.toMatch(/<(script|img|link)[^>]+(src|href)=["']https?:/i)
  })

  it('embeds technology SVG paths and the selected dark background', () => {
    expect(html).toContain(getTechnology('kubernetes')!.icon.path)
    expect(html).toContain(getTechnology('postgresql')!.icon.path)
    expect(html).toContain('background:#050709')
  })

  it('embeds electronic symbols in a standalone mixed architecture', () => {
    const mixed = diagramTemplates.find(template => template.id === 'embedded')!.diagram
    const mixedHtml = buildDiagramHtml(mixed)
    expect(mixedHtml).toContain(getElectronicComponent('microcontroller')!.svg)
    expect(mixedHtml).toContain(getElectronicComponent('sensor')!.svg)
    expect(mixedHtml).toContain('class="brand electronic"')
  })

  it('keeps exported cards on the same vertical layout as the editor', () => {
    expect(html).toContain('.node{position:absolute;z-index:2;display:flex;flex-direction:column')
    expect(html).toContain('.technology .heading,.electronic .heading{align-items:center}')
    expect(html).toContain('.database-stack{position:absolute')
    expect(html).toContain('.platform-visual{display:grid')
  })
})
