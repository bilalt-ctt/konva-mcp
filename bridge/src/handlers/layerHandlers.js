import { addLayer as addLayerToCanvas, clearLayer as clearLayerFromCanvas, getCanvas } from '../canvasManager.js'
import { ValidationError } from '../utils/errorTypes.js'

export async function addLayer({ canvas_id, name } = {}) {
  if (!canvas_id) throw new ValidationError('canvas_id is required')
  const result = addLayerToCanvas(canvas_id, name)
  return { canvas_id, ...result }
}

export async function clearLayer({ canvas_id, layer_id } = {}) {
  if (!canvas_id) throw new ValidationError('canvas_id is required')
  if (!layer_id) throw new ValidationError('layer_id is required')
  const count = clearLayerFromCanvas(canvas_id, layer_id)
  return { canvas_id, layer_id, cleared: count }
}
