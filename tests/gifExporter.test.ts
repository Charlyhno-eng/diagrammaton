import { describe, expect, it } from 'vitest'
import { gifFileName } from '../src/shared/lib/gifExporter'

describe('GIF export', () => {
  it('creates safe, meaningful filenames', () => {
    expect(gifFileName('Connected edge controller')).toBe('connected-edge-controller.gif')
    expect(gifFileName('  Électronique / API  ')).toBe('lectronique-api.gif')
    expect(gifFileName('---')).toBe('diagrammaton.gif')
  })
})
