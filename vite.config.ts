import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createGifRequestHandler } from './gif-service.ts'

function gifRenderer(): Plugin {
  const handler = createGifRequestHandler()
  const middleware = (request: IncomingMessage, response: ServerResponse, next: () => void) => {
    const path = new URL(request.url ?? '/', 'http://localhost').pathname
    if (path !== '/api/gif' && path !== '/health') {
      next()
      return
    }
    void handler(request, response)
  }

  return {
    name: 'diagrammaton-gif-renderer',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig({
  plugins: [react(), gifRenderer()],
})
