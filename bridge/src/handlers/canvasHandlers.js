import { createCanvas_, getCanvas, getStageJSON, exportToPNG } from '../canvasManager.js'
import { ValidationError } from '../utils/errorTypes.js'
import Konva from 'konva'
import fs from 'fs'

export async function createCanvas({ width, height, background } = {}) {
  if (!width || !height) throw new ValidationError('width and height are required')
  const { canvas_id, layer_id } = createCanvas_(width, height)

  // Add background rect if specified
  if (background) {
    const entry = (await import('../canvasManager.js')).getCanvas(canvas_id)
    const layer = entry.layers.get(layer_id)
    const bg = new Konva.Rect({ x: 0, y: 0, width, height, fill: background, listening: false })
    layer.add(bg)
    // Do not register bg in shapes map — it's internal
  }

  return { canvas_id, layer_id, width, height }
}

export async function getCanvasState({ canvas_id } = {}) {
  if (!canvas_id) throw new ValidationError('canvas_id is required')
  const state = getStageJSON(canvas_id)
  const entry = getCanvas(canvas_id)
  const shapes = []
  for (const [shape_id, shape] of entry.shapes) {
    shapes.push({ shape_id, type: shape.type, layer_id: shape.layer_id })
  }
  return { canvas_id, state, shape_index: shapes }
}

export async function exportCanvas({ canvas_id, format = 'png', pixelRatio = 1, saveToFile } = {}) {
  if (!canvas_id) throw new ValidationError('canvas_id is required')
  const data = await exportToPNG(canvas_id, pixelRatio)

  if (saveToFile && typeof saveToFile === 'string') {
    const buffer = Buffer.from(data, 'base64')
    await fs.promises.writeFile(saveToFile, buffer)
    return { canvas_id, format: 'png', mime_type: 'image/png', file_path: saveToFile }
  }

  return { canvas_id, format: 'png', mime_type: 'image/png', data }
}
