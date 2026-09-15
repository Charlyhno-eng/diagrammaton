#!/usr/bin/env node
/** Local HTML-to-GIF renderer for Diagrammaton.
 *
 * POST /api/gif with { "html": "<!doctype html>..." } and receive image/gif.
 * The server only listens on localhost by default: it renders user-provided HTML
 * in Chromium and must not be exposed directly to the public internet.
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { access, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import sharp from 'sharp'

export const FRAME_COUNT = 60
export const FRAME_DELAY_MS = 100
export const VIEWPORT = { width: 1484, height: 904 } as const
export const MAX_HTML_BYTES = 5 * 1024 * 1024

const MAX_REQUEST_BYTES = MAX_HTML_BYTES
const CHROMIUM_CANDIDATES = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']

type CapturedFrame = { png: Buffer; duration: number }

async function chromiumExecutable() {
  const configured = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  if (configured) return configured
  for (const candidate of CHROMIUM_CANDIDATES) {
    try {
      await access(candidate, constants.X_OK)
      return candidate
    } catch {
      // Try the next system browser before falling back to Playwright's.
    }
  }
  return undefined
}

/** Exact duplicate frames can share one GIF frame with a longer duration. */
export function coalesceFrames(frames: Buffer[]): CapturedFrame[] {
  const compact: CapturedFrame[] = []
  for (const png of frames) {
    const previous = compact.at(-1)
    if (previous?.png.equals(png)) previous.duration += FRAME_DELAY_MS
    else compact.push({ png, duration: FRAME_DELAY_MS })
  }
  return compact
}

async function encodeGif(frames: CapturedFrame[]) {
  const decoded: Buffer[] = []
  let width = 0
  let height = 0

  for (const frame of frames) {
    const image = sharp(frame.png)
    const metadata = await image.metadata()
    if (!metadata.width || !metadata.height) throw new Error('Chromium returned a frame with no dimensions.')
    if (!width) ({ width, height } = metadata)
    if (metadata.width !== width || metadata.height !== height) throw new Error('The exported document changed size while it was being captured.')
    decoded.push(await image.removeAlpha().raw().toBuffer())
  }

  // A shared 128-colour palette is ample for diagram UI while greatly reducing
  // weight. libvips stores only changed areas between frames and effort 10 runs
  // its strongest compression pass. RGB input also saves 25% of working memory.
  return sharp(Buffer.concat(decoded), {
    raw: { width, height: height * frames.length, channels: 3, pageHeight: height },
  }).gif({
    loop: 0,
    delay: frames.map(frame => frame.duration),
    colours: 128,
    effort: 10,
    dither: 0.5,
    interFrameMaxError: 1,
    interPaletteMaxError: 3,
    keepDuplicateFrames: false,
  }).toBuffer()
}

export async function renderHtmlAsGif(html: string) {
  const directory = await mkdtemp(join(tmpdir(), 'diagrammaton-gif-'))
  const source = join(directory, 'diagram.html')
  try {
    await writeFile(source, html, 'utf8')
    const browser = await chromium.launch({ headless: true, executablePath: await chromiumExecutable() })
    const pngFrames: Buffer[] = []
    try {
      const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 })
      await page.goto(pathToFileURL(source).href, { waitUntil: 'load' })
      await page.waitForTimeout(500)
      for (let index = 0; index < FRAME_COUNT; index += 1) {
        pngFrames.push(await page.screenshot({ fullPage: true, type: 'png' }))
        if (index < FRAME_COUNT - 1) await page.waitForTimeout(FRAME_DELAY_MS)
      }
    } finally {
      await browser.close()
    }
    return encodeGif(coalesceFrames(pngFrames))
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

function cors(response: ServerResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
}

function sendJson(response: ServerResponse, status: number, payload: Record<string, string>) {
  const body = Buffer.from(JSON.stringify(payload))
  cors(response)
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': body.length })
  response.end(body)
}

async function readRequest(request: IncomingMessage) {
  const declaredLength = Number(request.headers['content-length'] ?? 0)
  if (!Number.isInteger(declaredLength) || declaredLength <= 0 || declaredLength > MAX_REQUEST_BYTES) {
    throw new Error(`The HTML payload must be between 1 byte and ${MAX_HTML_BYTES / 1024 / 1024} MB.`)
  }
  const chunks: Buffer[] = []
  let length = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    length += buffer.length
    if (length > MAX_REQUEST_BYTES) throw new Error(`The HTML payload must be between 1 byte and ${MAX_HTML_BYTES / 1024 / 1024} MB.`)
    chunks.push(buffer)
  }
  return Buffer.concat(chunks).toString('utf8')
}

let renderQueue = Promise.resolve()

function queueRender(html: string) {
  const rendering = renderQueue.then(() => renderHtmlAsGif(html))
  renderQueue = rendering.then(() => undefined, () => undefined)
  return rendering
}

export function createGifRequestHandler() {
  return async (request: IncomingMessage, response: ServerResponse) => {
    const path = new URL(request.url ?? '/', 'http://localhost').pathname
    if (request.method === 'OPTIONS') {
      cors(response)
      response.writeHead(204).end()
      return
    }
    if (request.method === 'GET' && path === '/health') {
      sendJson(response, 200, { status: 'ok' })
      return
    }
    if (request.method !== 'POST' || path !== '/api/gif') {
      sendJson(response, 404, { error: 'Not found.' })
      return
    }

    try {
      const payload = JSON.parse(await readRequest(request)) as unknown
      const html = payload && typeof payload === 'object' && 'html' in payload ? (payload as { html?: unknown }).html : undefined
      if (typeof html !== 'string' || Buffer.byteLength(html) > MAX_HTML_BYTES || !html.trimStart().toLowerCase().startsWith('<!doctype html')) {
        throw new Error('The request must contain a complete standalone HTML document.')
      }
      const gif = await queueRender(html)
      cors(response)
      response.writeHead(200, { 'Content-Type': 'image/gif', 'Content-Length': gif.length, 'Cache-Control': 'no-store' })
      response.end(gif)
    } catch (error) {
      const message = error instanceof SyntaxError
        ? `Invalid JSON: ${error.message}`
        : error instanceof Error ? error.message : String(error)
      const isBadRequest = error instanceof SyntaxError || message.startsWith('The HTML payload') || message.startsWith('The request must')
      sendJson(response, isBadRequest ? 400 : 500, { error: isBadRequest ? message : `GIF rendering failed: ${message}` })
    }
  }
}

export function createGifServer() {
  return createServer(createGifRequestHandler())
}

function argument(name: string, fallback: string) {
  const index = process.argv.indexOf(name)
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const host = argument('--host', '127.0.0.1')
  const port = Number(argument('--port', '8000'))
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`Invalid port: ${port}`)
  createGifServer().listen(port, host, () => console.log(`Diagrammaton GIF service listening at http://${host}:${port}`))
}
