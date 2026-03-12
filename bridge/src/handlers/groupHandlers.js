import Konva from 'konva'
import { getCanvas, getLayer, getShape, registerShape } from '../canvasManager.js'
import { ValidationError } from '../utils/errorTypes.js'

export async function createGroup({ canvas_id, layer_id, shape_ids, ...props } = {}) {
  if (!canvas_id)               throw new ValidationError('canvas_id is required')
  if (!layer_id)                throw new ValidationError('layer_id is required')
  if (!Array.isArray(shape_ids) || shape_ids.length === 0)
    throw new ValidationError('shape_ids must be a non-empty array')

  const layer = getLayer(canvas_id, layer_id)
  const group = new Konva.Group(props)
  layer.add(group)

  // Re-parent each shape into the group
  for (const sid of shape_ids) {
    const shape = getShape(canvas_id, sid)
    shape.node.moveTo(group)
    // Update layer_id reference to point to group context
    shape.layer_id = layer_id
  }

  const group_id = registerShape(canvas_id, layer_id, group, 'group')
  return { canvas_id, layer_id, group_id, shape_ids, attrs: group.getAttrs() }
}
