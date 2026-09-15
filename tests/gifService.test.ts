import { describe, expect, it } from 'vitest'
import { coalesceFrames, FRAME_DELAY_MS } from '../gif-service'

describe('TypeScript GIF service', () => {
  it('combines consecutive duplicate frames without shortening the animation', () => {
    const first = Buffer.from('first frame')
    const second = Buffer.from('second frame')

    const frames = coalesceFrames([first, Buffer.from(first), second, Buffer.from(second), Buffer.from(second)])

    expect(frames).toEqual([
      { png: first, duration: FRAME_DELAY_MS * 2 },
      { png: second, duration: FRAME_DELAY_MS * 3 },
    ])
    expect(frames.reduce((duration, frame) => duration + frame.duration, 0)).toBe(FRAME_DELAY_MS * 5)
  })

  it('does not merge identical frames separated by an animated frame', () => {
    const first = Buffer.from('first frame')
    const second = Buffer.from('second frame')

    expect(coalesceFrames([first, second, first])).toHaveLength(3)
  })
})
