declare module 'gifenc' {
  export type GifEncoder = {
    writeFrame: (index: Uint8Array, width: number, height: number, options: { palette: Uint8Array; delay: number; repeat?: number; dispose?: number }) => void
    finish: () => void
    bytesView: () => Uint8Array
  }
  export function GIFEncoder(): GifEncoder
  export function quantize(pixels: Uint8ClampedArray, maxColors: number): Uint8Array
  export function applyPalette(pixels: Uint8ClampedArray, palette: Uint8Array): Uint8Array
}
