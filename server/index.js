// Production server: serves the built app from dist/ and the /api routes.
// Usage: npm run build && npm start
import 'dotenv/config'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleApi } from './api.js'

const here = fileURLToPath(new URL('.', import.meta.url))
const dist = join(here, '..', 'dist')
const port = Number(process.env.PORT) || 3000
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
}

createServer(async (req, res) => {
  if (await handleApi(req, res)) return
  if (req.url.startsWith('/api/')) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end('{"error":"Not found"}')
    return
  }
  const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '')
  let file = join(dist, path)
  if (!file.startsWith(dist)) file = join(dist, 'index.html')
  try {
    const data = await readFile(file)
    res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream')
    res.end(data)
  } catch {
    res.setHeader('Content-Type', types['.html'])
    res.end(await readFile(join(dist, 'index.html')))
  }
}).listen(port, () => console.log(`Admission Saathi running on http://localhost:${port}`))
