import { expect, test, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const template = (page: Page, name: string) => page.locator('.template-card').filter({ hasText: name })

function gifFrames(bytes: Buffer) {
  const frames: Buffer[] = []
  let offset = 13
  if (bytes[10] & 0x80) offset += 3 * 2 ** ((bytes[10] & 0x07) + 1)
  const skipBlocks = () => { while (bytes[offset]) { offset += bytes[offset] + 1 } offset += 1 }
  while (offset < bytes.length) {
    const marker = bytes[offset++]
    if (marker === 0x3b) break
    if (marker === 0x21) { offset += 1; skipBlocks(); continue }
    if (marker !== 0x2c) break
    const packed = bytes[offset + 8]
    offset += 9
    if (packed & 0x80) offset += 3 * 2 ** ((packed & 0x07) + 1)
    offset += 1
    const chunks: Buffer[] = []
    while (bytes[offset]) { const size = bytes[offset++]; chunks.push(bytes.subarray(offset, offset + size)); offset += size }
    offset += 1
    frames.push(Buffer.concat(chunks))
  }
  return frames
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('starts dark with the highlighted blank board first', async ({ page }) => {
  await expect(page.locator('main.studio')).toHaveAttribute('data-theme', 'midnight')
  await expect(page.locator('.template-card').first()).toContainText('Blank HTML board')
  await expect(page.locator('.template-card').first()).toHaveClass(/blank-template/)
  await expect(page.getByRole('button', { name: 'Play' })).toHaveCount(0)
})

test('keeps the library open, preserves the theme and aligns database cards', async ({ page }) => {
  await page.locator('.theme-select select').selectOption('electric')
  await template(page, 'Database internals').click()
  await expect(page.locator('.template-drawer')).toBeVisible()
  await expect(page.locator('main.studio')).toHaveAttribute('data-theme', 'electric')
  await expect(page.locator('.document-title input')).toHaveValue('Database internals')

  const rows = await page.locator('.html-node').evaluateAll(nodes => Object.fromEntries(nodes.map(node => {
    const title = node.querySelector('h3')?.textContent ?? ''
    return [title, node.getBoundingClientRect().top]
  }))) as Record<string, number>
  expect(Math.abs(rows.PostgreSQL - rows['Tables & relations'])).toBeLessThan(1)
  expect(Math.abs(rows.MongoDB - rows.Collections)).toBeLessThan(1)
  expect(Math.abs(rows.Cassandra - rows.Memtables)).toBeLessThan(1)
})

test('renders the mixed architecture with software and electronic symbols', async ({ page }) => {
  await template(page, 'Software + electronics').click()
  await expect(page.locator('.kind-technology')).toHaveCount(3)
  await expect(page.locator('.kind-electronic')).toHaveCount(8)
  await expect(page.locator('.kind-electronic svg[aria-label="Microcontroller"]')).toBeVisible()
  await expect(page.locator('.kind-electronic svg[aria-label="Sensor"]')).toBeVisible()
})

test('adds an electronic component without closing the library', async ({ page }) => {
  const before = await page.locator('.kind-electronic').count()
  await page.locator('.electronic-library summary').click()
  await page.locator('.electronic-library button').filter({ hasText: 'Resistor' }).click()
  await expect(page.locator('.template-drawer')).toBeVisible()
  await expect(page.locator('.kind-electronic')).toHaveCount(before + 1)
  await expect(page.locator('.document-title small')).toContainText('HTML components')
})

test('keeps technology and electronics catalogs in independent dropdowns', async ({ page }) => {
  const electronics = page.locator('details.electronic-library')
  const technologies = page.locator('details.technology-library')
  await expect(electronics).not.toHaveAttribute('open', '')
  await expect(technologies).not.toHaveAttribute('open', '')
  await electronics.locator('summary').click()
  await expect(electronics).toHaveAttribute('open', '')
  await expect(electronics.locator('button[title="Add Resistor"]')).toBeVisible()
  await technologies.locator('summary').click()
  await expect(technologies).toHaveAttribute('open', '')
  await technologies.getByLabel('Search technologies').fill('PostgreSQL')
  await expect(technologies.locator('button[title="Add PostgreSQL"]')).toBeVisible()
})

test('exports an aligned standalone HTML diagram', async ({ page, browser }) => {
  await template(page, 'Software + electronics').click()
  const downloadPromise = page.waitForEvent('download')
  await page.locator('.html-export').click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('connected-edge-controller.html')
  const path = await download.path()
  expect(path).not.toBeNull()
  const html = await readFile(path!, 'utf8')

  const exported = await browser.newPage({ viewport: { width: 1500, height: 1000 } })
  await exported.setContent(html, { waitUntil: 'load' })
  const node = exported.locator('.node.technology').filter({ hasText: 'Node.js' })
  const nodeBox = await node.boundingBox()
  const logoBox = await node.locator('.brand').boundingBox()
  expect(nodeBox).not.toBeNull()
  expect(logoBox).not.toBeNull()
  expect(Math.abs(logoBox!.x - nodeBox!.x - 17)).toBeLessThan(.5)
  await expect(exported.locator('.board')).toHaveScreenshot('exported-software-electronics.png', { animations: 'disabled' })
  await exported.close()
})

test('downloads a valid GIF captured from the HTML stage', async ({ page }) => {
  test.setTimeout(60_000)
  await template(page, 'Software + electronics').click()
  const downloadPromise = page.waitForEvent('download')
  await page.locator('.gif-export').click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('connected-edge-controller.gif')
  const path = await download.path()
  expect(path).not.toBeNull()
  const bytes = await readFile(path!)
  expect(bytes.subarray(0, 6).toString()).toBe('GIF89a')
  expect(bytes.readUInt16LE(6)).toBe(960)
  expect(bytes.readUInt16LE(8)).toBe(562)
  expect(bytes.byteLength).toBeGreaterThan(10_000)
  const frames = gifFrames(bytes)
  expect(frames).toHaveLength(18)
  expect(new Set(frames.map(frame => frame.toString('base64'))).size).toBeGreaterThan(1)
  await expect(page.locator('.gif-export')).toBeEnabled()
  const rasterFingerprints = await page.evaluate(async () => {
    const [{ renderDiagramGifFrame }, { diagramTemplates }] = await Promise.all([
      import('/src/shared/lib/gifExporter.ts'),
      import('/src/features/diagram/domain/diagramTemplates.ts'),
    ])
    const diagram = diagramTemplates.find(item => item.id === 'embedded')!.diagram
    const stage = document.querySelector<HTMLElement>('.diagram-stage')!
    const [first, second] = await Promise.all([
      renderDiagramGifFrame(stage, diagram, 0),
      renderDiagramGifFrame(stage, diagram, .5),
    ])
    const fingerprint = (canvas: HTMLCanvasElement) => {
      const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data
      let hash = 2166136261
      for (let index = 0; index < pixels.length; index += 4) hash = Math.imul(hash ^ pixels[index] ^ pixels[index + 1] ^ pixels[index + 2], 16777619)
      return hash >>> 0
    }
    first.id = 'raw-gif-frame'
    document.body.replaceChildren(first)
    return [fingerprint(first), fingerprint(second)]
  })
  expect(rasterFingerprints[0]).not.toBe(rasterFingerprints[1])
  await expect(page.locator('#raw-gif-frame')).toHaveScreenshot('gif-software-electronics-raw-frame.png')
  await page.setContent('<canvas width="960" height="562"></canvas>')
  await page.evaluate(async source => {
    const image = new Image()
    image.src = source
    await image.decode()
    document.querySelector('canvas')!.getContext('2d')!.drawImage(image, 0, 0)
  }, `data:image/gif;base64,${bytes.toString('base64')}`)
  await expect(page.locator('canvas')).toHaveScreenshot('gif-software-electronics-encoded-frame.png', { maxDiffPixelRatio: 0 })
})

for (const example of [
  { name: 'Database internals', snapshot: 'database-internals.png' },
  { name: 'Technical explainer', snapshot: 'technical-explainer.png' },
  { name: 'Software + electronics', snapshot: 'software-electronics.png' },
]) {
  test(`${example.name} visual regression`, async ({ page }) => {
    await template(page, example.name).click()
    await page.locator('.drawer-head button').click()
    await expect(page.locator('.diagram-stage')).toHaveScreenshot(example.snapshot, { animations: 'disabled' })
  })
}
