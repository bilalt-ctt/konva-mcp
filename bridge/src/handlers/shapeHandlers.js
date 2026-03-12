import Konva from 'konva'
import { getCanvas, getLayer, getShape, registerShape, removeShape, listShapes as listShapesFromManager } from '../canvasManager.js'
import { ShapeTypeInvalidError, ValidationError } from '../utils/errorTypes.js'

const SHAPE_CONSTRUCTORS = {
  rect:            Konva.Rect,
  circle:          Konva.Circle,
  ellipse:         Konva.Ellipse,
  line:            Konva.Line,
  arrow:           Konva.Arrow,
  text:            Konva.Text,
  path:            Konva.Path,
  star:            Konva.Star,
  regular_polygon: Konva.RegularPolygon,
  wedge:           Konva.Wedge,
  ring:            Konva.Ring,
  arc:             Konva.Arc,
}

export async function createShape({ canvas_id, layer_id, shape_type, ...props } = {}) {
  if (!canvas_id)   throw new ValidationError('canvas_id is required')
  if (!layer_id)    throw new ValidationError('layer_id is required')
  if (!shape_type)  throw new ValidationError('shape_type is required')

  const Constructor = SHAPE_CONSTRUCTORS[shape_type]
  if (!Constructor) throw new ShapeTypeInvalidError(shape_type)

  const layer = getLayer(canvas_id, layer_id)
  const node = new Constructor(props)
  layer.add(node)

  const shape_id = registerShape(canvas_id, layer_id, node, shape_type)
  return { canvas_id, layer_id, shape_id, shape_type, attrs: node.getAttrs() }
}

export async function updateShape({ canvas_id, shape_id, ...props } = {}) {
  if (!canvas_id)  throw new ValidationError('canvas_id is required')
  if (!shape_id)   throw new ValidationError('shape_id is required')

  const shape = getShape(canvas_id, shape_id)
  shape.node.setAttrs(props)
  return { canvas_id, shape_id, attrs: shape.node.getAttrs() }
}

export async function deleteShape({ canvas_id, shape_id } = {}) {
  if (!canvas_id)  throw new ValidationError('canvas_id is required')
  if (!shape_id)   throw new ValidationError('shape_id is required')

  removeShape(canvas_id, shape_id)
  return { canvas_id, shape_id, deleted: true }
}

export async function listShapes({ canvas_id, layer_id } = {}) {
  if (!canvas_id) throw new ValidationError('canvas_id is required')
  const shapes = listShapesFromManager(canvas_id, layer_id)
  return { canvas_id, layer_id: layer_id ?? null, shapes }
}
