import { getShape } from '../canvasManager.js'
import { ValidationError, InvalidOperationError } from '../utils/errorTypes.js'

export async function transformShape({ canvas_id, shape_id, operation, ...params } = {}) {
  if (!canvas_id)  throw new ValidationError('canvas_id is required')
  if (!shape_id)   throw new ValidationError('shape_id is required')
  if (!operation)  throw new ValidationError('operation is required')

  const shape = getShape(canvas_id, shape_id)
  const node = shape.node

  switch (operation) {
    case 'move':
      if (params.x !== undefined) node.x(params.x)
      if (params.y !== undefined) node.y(params.y)
      break

    case 'rotate':
      if (params.degrees === undefined) throw new ValidationError('degrees is required for rotate')
      node.rotation(params.degrees)
      break

    case 'scale':
      if (params.scaleX !== undefined) node.scaleX(params.scaleX)
      if (params.scaleY !== undefined) node.scaleY(params.scaleY)
      break

    case 'flip':
      if (!params.axis) throw new ValidationError('axis ("horizontal" or "vertical") is required for flip')
      if (params.axis === 'horizontal') node.scaleX(node.scaleX() * -1)
      else if (params.axis === 'vertical') node.scaleY(node.scaleY() * -1)
      else throw new ValidationError('axis must be "horizontal" or "vertical"')
      break

    default:
      throw new InvalidOperationError(operation)
  }

  return { canvas_id, shape_id, operation, attrs: node.getAttrs() }
}
