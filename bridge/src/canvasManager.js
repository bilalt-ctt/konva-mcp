// Must be imported first to configure Konva for headless Node.js usage
import 'konva/canvas-backend'
import Konva from 'konva'
import { genCanvasId, genLayerId, genShapeId } from './utils/idGenerator.js'
import { CanvasNotFoundError, LayerNotFoundError, ShapeNotFoundError } from './utils/errorTypes.js'

// Minimal DOM mock for Konva.Stage container (no browser DOM in Node.js)
function makeMockContainer() {
  return {
    style: { padding: '', margin: '', border: '', position: '', display: '', width: '', height: '' },
    addEventListener: () => {},
    removeEventListener: () => {},
    getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 }),
    offsetWidth: 0,
    offsetHeight: 0,
    children: [],
    appendChild: () => {},
    removeChild: () => {},
    getElementsByTagName: () => [],
  }
}

// Map<canvas_id, { stage, layers: Map<layer_id, Konva.Layer>, shapes: Map<shape_id, {node, type, layer_id}> }>
const canvases = new Map()

export function createCanvas_(width, height) {
  const canvas_id = genCanvasId()
  const stage = new Konva.Stage({ width, height, container: makeMockContainer() })

  const layer_id = genLayerId()
  const layer = new Konva.Layer()
  stage.add(layer)

  canvases.set(canvas_id, {
    stage,
    width,
    height,
    layers: new Map([[layer_id, layer]]),
    shapes: new Map(),
  })

  return { canvas_id, layer_id }
}

export function getCanvas(canvas_id) {
  const entry = canvases.get(canvas_id)
  if (!entry) throw new CanvasNotFoundError(canvas_id)
  return entry
}

export function getLayer(canvas_id, layer_id) {
  const entry = getCanvas(canvas_id)
  const layer = entry.layers.get(layer_id)
  if (!layer) throw new LayerNotFoundError(layer_id)
  return layer
}

export function getShape(canvas_id, shape_id) {
  const entry = getCanvas(canvas_id)
  const shape = entry.shapes.get(shape_id)
  if (!shape) throw new ShapeNotFoundError(shape_id)
  return shape
}

export function addLayer(canvas_id, name) {
  const entry = getCanvas(canvas_id)
  const layer_id = genLayerId()
  const layer = new Konva.Layer({ name })
  entry.stage.add(layer)
  entry.layers.set(layer_id, layer)
  return { layer_id, name }
}

export function registerShape(canvas_id, layer_id, node, type) {
  const entry = getCanvas(canvas_id)
  const shape_id = genShapeId()
  entry.shapes.set(shape_id, { node, type, layer_id })
  return shape_id
}

export function removeShape(canvas_id, shape_id) {
  const entry = getCanvas(canvas_id)
  const shape = entry.shapes.get(shape_id)
  if (!shape) throw new ShapeNotFoundError(shape_id)
  shape.node.destroy()
  entry.shapes.delete(shape_id)
}

export function clearLayer(canvas_id, layer_id) {
  const entry = getCanvas(canvas_id)
  getLayer(canvas_id, layer_id)
  let count = 0
  for (const [shape_id, shape] of entry.shapes) {
    if (shape.layer_id === layer_id) {
      shape.node.destroy()
      entry.shapes.delete(shape_id)
      count++
    }
  }
  return count
}

export function listShapes(canvas_id, layer_id) {
  const entry = getCanvas(canvas_id)
  const result = []
  for (const [shape_id, shape] of entry.shapes) {
    if (!layer_id || shape.layer_id === layer_id) {
      result.push({ shape_id, type: shape.type, layer_id: shape.layer_id, attrs: shape.node.getAttrs() })
    }
  }
  return result
}

export function getStageJSON(canvas_id) {
  const entry = getCanvas(canvas_id)
  return JSON.parse(entry.stage.toJSON())
}

export async function exportToPNG(canvas_id, pixelRatio = 1) {
  const entry = getCanvas(canvas_id)
  const dataURL = entry.stage.toDataURL({ mimeType: 'image/png', pixelRatio })
  // Strip "data:image/png;base64," prefix
  return dataURL.replace(/^data:image\/png;base64,/, '')
}
