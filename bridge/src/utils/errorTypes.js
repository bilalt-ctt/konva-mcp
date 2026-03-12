export class KonvaMCPError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'KonvaMCPError'
    this.code = code
  }
}

export class CanvasNotFoundError extends KonvaMCPError {
  constructor(id) { super('CANVAS_NOT_FOUND', `Canvas '${id}' not found`) }
}

export class LayerNotFoundError extends KonvaMCPError {
  constructor(id) { super('LAYER_NOT_FOUND', `Layer '${id}' not found`) }
}

export class ShapeNotFoundError extends KonvaMCPError {
  constructor(id) { super('SHAPE_NOT_FOUND', `Shape '${id}' not found`) }
}

export class ShapeTypeInvalidError extends KonvaMCPError {
  constructor(type) { super('SHAPE_TYPE_INVALID', `Unknown shape type '${type}'`) }
}

export class InvalidOperationError extends KonvaMCPError {
  constructor(op) { super('INVALID_OPERATION', `Unknown transform operation '${op}'`) }
}

export class ActionNotFoundError extends KonvaMCPError {
  constructor(action) { super('ACTION_NOT_FOUND', `Unknown action '${action}'`) }
}

export class ValidationError extends KonvaMCPError {
  constructor(message) { super('VALIDATION_ERROR', message) }
}

export class RenderError extends KonvaMCPError {
  constructor(message) { super('RENDER_ERROR', message) }
}
