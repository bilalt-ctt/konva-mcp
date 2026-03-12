import { nanoid } from 'nanoid'

export const genCanvasId = () => 'c' + nanoid(11)
export const genLayerId  = () => 'l' + nanoid(11)
export const genShapeId  = () => 's' + nanoid(11)
