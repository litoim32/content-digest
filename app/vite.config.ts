import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { htmlToText } from './src/digest/extract'

const sendJson = (
  res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (s: string) => void },
  status: number,
  body: unknown,
): void => {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(body))
}

/**
 * DEV-ONLY: GET /api/extract?url=<article> fetches the page server-side (no CORS)
 * and returns cleaned plain text as `{ text }`. Only registered on the dev server
 * (`configureServer`), so it does not exist in `vite build` / `preview` — the UI
 * degrades to manual paste there. See docs/decisions/004-dev-extract-middleware.md.
 */
function devExtractMiddleware(): Plugin {
  return {
    name: 'dev-extract-middleware',
    configureServer(server) {
      server.middlewares.use('/api/extract', (req, res) => {
        void (async () => {
          try {
            const requestUrl = new URL(req.url ?? '', 'http://localhost')
            const target = requestUrl.searchParams.get('url')?.trim() ?? ''
            if (target.length === 0) return sendJson(res, 400, { error: 'missing url' })

            let parsed: URL
            try {
              parsed = new URL(target)
            } catch {
              return sendJson(res, 400, { error: 'invalid url' })
            }
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
              return sendJson(res, 400, { error: 'unsupported protocol' })
            }

            const upstream = await fetch(parsed, {
              headers: { 'user-agent': 'ContentDigestBot/1.0 (+dev)' },
              redirect: 'follow',
            })
            if (!upstream.ok) return sendJson(res, 502, { error: `upstream ${upstream.status}` })

            const html = await upstream.text()
            return sendJson(res, 200, { text: htmlToText(html) })
          } catch {
            return sendJson(res, 500, { error: 'fetch failed' })
          }
        })()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devExtractMiddleware()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true, open: false },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
