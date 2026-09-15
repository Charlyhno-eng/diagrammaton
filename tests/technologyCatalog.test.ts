import { describe, expect, it } from 'vitest'
import { getTechnology, technologies, technologyCategories } from '../src/features/diagram/domain/technologyCatalog'

describe('technology catalog', () => {
  it('offers a broad, unique architecture catalog', () => {
    expect(technologies.length).toBeGreaterThanOrEqual(100)
    expect(new Set(technologies.map(item => item.id)).size).toBe(technologies.length)
  })

  it('covers every declared category with usable vector data', () => {
    for (const category of technologyCategories) expect(technologies.some(item => item.category === category.id)).toBe(true)
    for (const item of technologies) {
      expect(item.icon.path.length, `${item.id}: missing SVG path`).toBeGreaterThanOrEqual(20)
      expect(item.icon.hex, `${item.id}: missing brand color`).toMatch(/^[0-9A-F]{6}$/i)
    }
  })

  it.each(['postgresql', 'mongodb', 'redis', 'docker', 'kubernetes', 'terraform', 'kafka', 'prometheus', 'langchain', 'onnx', 'hugging-face', 'ollama', 'pytorch', 'tensorflow', 'typescript', 'python', 'go', 'rust'])('includes %s', id => {
    expect(getTechnology(id)?.id).toBe(id)
  })
})
