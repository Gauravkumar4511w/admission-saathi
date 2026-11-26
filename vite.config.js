import 'dotenv/config'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { handleApi, handleKeySetup } from './server/api.js'

const envPath = fileURLToPath(new URL('./.env', import.meta.url))

// Mounts the /api routes inside the Vite dev server, so `npm run dev` is all you need.
// The key-setup route exists only here (local dev), not in the production server.
const apiPlugin = {
  name: 'admission-api',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (await handleKeySetup(req, res, envPath)) return
      if (!(await handleApi(req, res))) next()
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [apiPlugin, react(), babel({ presets: [reactCompilerPreset()] })],
})
