import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDiagramGif, gifFileName } from '../src/shared/lib/gifExporter'
import { htmlFileName } from '../src/shared/lib/htmlExporter'

describe('GIF export', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('creates safe, meaningful filenames', () => {
    expect(gifFileName('Connected edge controller')).toBe('connected-edge-controller.gif')
    expect(gifFileName('  Électronique / API  ')).toBe('lectronique-api.gif')
    expect(gifFileName('---')).toBe('diagrammaton.gif')
  })

  it('keeps the HTML companion filename aligned with its GIF', () => {
    expect(htmlFileName('Connected edge controller')).toBe('connected-edge-controller.html')
    expect(htmlFileName('---')).toBe('diagram.html')
  })

  it('sends standalone HTML to the local TypeScript renderer', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('GIF89a', { headers: { 'Content-Type': 'image/gif' } }))
    vi.stubGlobal('fetch', fetchMock)

    const gif = await createDiagramGif('<!doctype html><html><body>diagram</body></html>')

    expect(gif.type).toBe('image/gif')
    expect(fetchMock).toHaveBeenCalledWith('/api/gif', expect.objectContaining({ method: 'POST', body: expect.stringContaining('<!doctype html>') }))
  })

  it('explains how to recover when the local renderer is offline', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network error')))
    await expect(createDiagramGif('<!doctype html><html></html>')).rejects.toThrow('Restart the Diagrammaton server')
  })
})
