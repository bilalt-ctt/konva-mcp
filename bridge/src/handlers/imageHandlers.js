import fs from 'fs'
import path from 'path'
import { createCanvas, loadImage } from 'canvas'
import Konva from 'konva'
import { getLayer, registerShape } from '../canvasManager.js'
import { ValidationError } from '../utils/errorTypes.js'

const SUPPORTED_RASTER = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'])
const SUPPORTED_SVG    = new Set(['.svg'])
const ALL_SUPPORTED    = new Set([...SUPPORTED_RASTER, ...SUPPORTED_SVG])

export async function getImageInfo({ file_path } = {}) {
  if (!file_path) throw new ValidationError('file_path is required')

  const ext = path.extname(file_path).toLowerCase()
  if (!ALL_SUPPORTED.has(ext)) {
    throw new ValidationError(`Unsupported file type "${ext}". Supported: ${[...ALL_SUPPORTED].join(', ')}`)
  }
  if (!fs.existsSync(file_path)) {
    throw new ValidationError(`File not found: ${file_path}`)
  }

  const { size: size_bytes } = fs.statSync(file_path)
  const img = await loadImage(file_path)

  return {
    file_path,
    width: img.width,
    height: img.height,
    format: ext.replace('.', ''),
    size_bytes,
    aspect_ratio: +(img.width / img.height).toFixed(4),
  }
}

export async function addImage({ canvas_id, layer_id, file_path, x = 0, y = 0, width, height, opacity } = {}) {
  if (!canvas_id)  throw new ValidationError('canvas_id is required')
  if (!layer_id)   throw new ValidationError('layer_id is required')
  if (!file_path)  throw new ValidationError('file_path is required')

  const ext = path.extname(file_path).toLowerCase()
  const isSvg    = SUPPORTED_SVG.has(ext)
  const isRaster = SUPPORTED_RASTER.has(ext)

  if (!isSvg && !isRaster) {
    throw new ValidationError(`Unsupported file type "${ext}". Supported: ${[...SUPPORTED_RASTER, ...SUPPORTED_SVG].join(', ')}`)
  }

  if (!fs.existsSync(file_path)) {
    throw new ValidationError(`File not found: ${file_path}`)
  }

  // loadImage from the 'canvas' package handles PNG, JPEG, GIF, WebP, and SVG
  const img = await loadImage(file_path)

  const imgWidth  = width  ?? img.width
  const imgHeight = height ?? img.height

  // For SVG or when explicit dimensions differ from natural size, rasterise into
  // an offscreen canvas so Konva gets a pixel-perfect bitmap at the target size.
  let source
  if (isSvg || (width && width !== img.width) || (height && height !== img.height)) {
    const offscreen = createCanvas(imgWidth, imgHeight)
    const ctx = offscreen.getContext('2d')
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight)
    source = offscreen
  } else {
    source = img
  }

  const layer = getLayer(canvas_id, layer_id)
  const node  = new Konva.Image({ x, y, image: source, width: imgWidth, height: imgHeight })
  if (opacity != null) node.opacity(opacity)
  layer.add(node)

  const shape_id = registerShape(canvas_id, layer_id, node, 'image')
  return {
    canvas_id,
    layer_id,
    shape_id,
    shape_type: 'image',
    file_path,
    attrs: { x, y, width: imgWidth, height: imgHeight, opacity: node.opacity() },
  }
}
