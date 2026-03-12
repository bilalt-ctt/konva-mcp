import express from 'express'
import { dispatch } from './src/handlers/index.js'

const PORT = parseInt(process.env.BRIDGE_PORT ?? '3847', 10)
const app = express()

app.use(express.json({ limit: '50mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/execute', async (req, res) => {
  const { action, params } = req.body ?? {}
  if (!action) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'action is required' },
    })
  }
  try {
    const data = await dispatch(action, params ?? {})
    res.json({ success: true, data })
  } catch (err) {
    const status = err.code ? 400 : 500
    res.status(status).json({
      success: false,
      error: { code: err.code ?? 'INTERNAL_ERROR', message: err.message },
    })
  }
})

const server = app.listen(PORT, '127.0.0.1', () => {
  // Signal to Python subprocess manager that bridge is ready
  process.stdout.write('BRIDGE_READY\n')
})

process.on('SIGTERM', () => server.close())
process.on('SIGINT',  () => server.close())
