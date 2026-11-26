// Vercel serverless function: /api/health
import { handleApi } from '../server/api.js'

export default async function handler(req, res) {
  if (!(await handleApi(req, res))) {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end('{"error":"Method not allowed"}')
  }
}
