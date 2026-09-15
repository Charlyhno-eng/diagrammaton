import { describe, expect, it } from 'vitest'
import { electronicCategories, electronicComponents, getElectronicComponent } from '../src/features/diagram/domain/electronicCatalog'

describe('electronic component catalog', () => {
  it('offers a useful starter set with unique bilingual entries', () => {
    expect(electronicComponents.length).toBeGreaterThanOrEqual(40)
    expect(new Set(electronicComponents.map(item => item.id)).size).toBe(electronicComponents.length)
    for (const item of electronicComponents) {
      expect(item.name.length).toBeGreaterThan(1)
      expect(item.fr.length).toBeGreaterThan(1)
      expect(getElectronicComponent(item.id)).toBe(item)
    }
  })

  it('covers every advertised category', () => {
    for (const category of electronicCategories) {
      expect(electronicComponents.some(item => item.category === category.id), category.id).toBe(true)
    }
  })

  it('contains only static SVG fragments', () => {
    for (const item of electronicComponents) {
      expect(item.svg, item.id).toMatch(/^<(path|rect|circle)/)
      expect(item.svg, item.id).not.toMatch(/<script|\son\w+=|javascript:/i)
    }
  })

  it.each(['fuse', 'crystal', 'bridge-rectifier', 'timer-555', 'fpga', 'buzzer', 'solar-panel', 'dc-dc-converter'])('includes %s', id => {
    expect(getElectronicComponent(id)?.id).toBe(id)
  })
})
