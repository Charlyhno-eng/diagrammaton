import { describe, expect, it } from 'vitest'
import { cloneDiagram, cloneDiagramWithTheme, diagramTemplates } from '../src/features/diagram/domain/diagramTemplates'

describe('diagram templates', () => {
  it('puts the blank board first and makes every template dark by default', () => {
    expect(diagramTemplates[0].id).toBe('blank')
    expect(diagramTemplates[0].diagram.nodes).toHaveLength(0)
    expect(diagramTemplates.every(template => template.diagram.background === 'midnight')).toBe(true)
  })

  it('contains valid unique nodes, edges and endpoints', () => {
    for (const template of diagramTemplates) {
      const nodeIds = template.diagram.nodes.map(node => node.id)
      const edgeIds = template.diagram.edges.map(edge => edge.id)
      expect(new Set(nodeIds).size, `${template.id}: duplicate node id`).toBe(nodeIds.length)
      expect(new Set(edgeIds).size, `${template.id}: duplicate edge id`).toBe(edgeIds.length)
      for (const edge of template.diagram.edges) {
        expect(nodeIds, `${template.id}: missing source ${edge.from}`).toContain(edge.from)
        expect(nodeIds, `${template.id}: missing target ${edge.to}`).toContain(edge.to)
      }
    }
  })

  it('keeps template cloning isolated and preserves an explicitly selected theme', () => {
    const source = diagramTemplates.find(template => template.id === 'databases')!.diagram
    const clone = cloneDiagram(source)
    clone.title = 'Changed'
    expect(source.title).not.toBe('Changed')
    expect(cloneDiagramWithTheme(source, 'electric').background).toBe('electric')
    expect(source.background).toBe('midnight')
  })

  it('aligns every database card on the exact center row', () => {
    const diagram = diagramTemplates.find(template => template.id === 'databases')!.diagram
    const at = (id: string) => diagram.nodes.find(node => node.id === id)!.y
    expect(at('pg')).toBe(at('tables'))
    expect(at('mongo')).toBe(at('collections'))
    expect(at('cassandra')).toBe(at('memtable'))
  })

  it('keeps Database Internals and Technical Explainer surfaces dark', () => {
    for (const id of ['databases', 'explainer']) {
      const diagram = diagramTemplates.find(template => template.id === id)!.diagram
      for (const item of diagram.nodes) {
        const channels = item.color.slice(1).match(/.{2}/g)!.map(channel => Number.parseInt(channel, 16))
        expect(Math.max(...channels), `${id}/${item.id} is too bright`).toBeLessThan(64)
      }
    }
  })

  it('includes a mixed software and electronics reference architecture', () => {
    const diagram = diagramTemplates.find(template => template.id === 'embedded')!.diagram
    expect(diagram.nodes.some(node => node.kind === 'technology')).toBe(true)
    expect(diagram.nodes.some(node => node.kind === 'electronic')).toBe(true)
    expect(diagram.edges.some(edge => edge.label === 'MQTT')).toBe(true)
  })
})
