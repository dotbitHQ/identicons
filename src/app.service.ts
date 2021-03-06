import { Injectable } from '@nestjs/common'
import path from 'path'
import md5 from 'blueimp-md5'
import { polyfill } from 'spritejs/lib/platform/node-canvas'
import { Scene, Rect, Path, Sprite, Ring, ENV } from 'spritejs/lib'
import { Cache } from './decorators/cache.decorator'

polyfill({ ENV })

interface PositionsObject {
  [key: string]: [number, number]
}

const POSITIONS: [number, number][] = [
  [0, 0],
  [20, 0],
  [40, 0],
  [0, 20],
  [20, 20],
  [40, 20],
  [0, 40],
  [20, 40],
  [40, 40]
]

const FIGURE_PATHS: string[] = [
  // square
  'M0 0h20v20H0z',
  // triangle
  'M0 0h20L0 20z',
  'M0 0l20 20H0z',
  'M20 0v20H0z',
  'M0 0h20v20z',
  // arc-shaped
  'M20 0v20H0C0 8.954 8.954 0 20 0z',
  'M0 0c11.046 0 20 8.954 20 20H0V0z',
  'M0 0h20v20C8.954 20 0 11.046 0 0z',
  'M0 0h20c0 11.046-8.954 20-20 20V0z',
  // half-angle
  'M10 0c5.523 0 10 4.477 10 10v10H0V10C0 4.477 4.477 0 10 0z',
  'M10 0h10v20H10C4.477 20 0 15.523 0 10S4.477 0 10 0z',
  'M10 0h10v20H10C4.477 20 0 15.523 0 10S4.477 0 10 0z',
  'M0 0h20v10c0 5.523-4.477 10-10 10S0 15.523 0 10V0z',
  // Other
  'M10 0h10v10c0 5.523-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0z',
  'M0 0h10c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10V0z',
  'M10 0c5.523 0 10 4.477 10 10v10H10C4.477 20 0 15.523 0 10S4.477 0 10 0z',
  'M10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10H0V10C0 4.477 4.477 0 10 0z'
]

const COLORS: string[] = [
  '#338CFF',
  '#FFDA23',
  '#C123FF',
  '#FFC12D',
  '#8221FF',
  '#D49742',
  '#FB23FF',
  '#009CFF',
  '#FF5423',
  '#07BF8B',
  '#2336FF',
  '#DE2E8F',
  '#FF2323',
  '#00C8BB',
  '#6500FF',
  '#DE2E62'
]

function getPositions(domainMd5: string): PositionsObject {
  const _positionArray: string[] = []
  const _positionObject: PositionsObject = {}
  for (let i = 0; i <= 8; i++) {
    _positionArray.push(domainMd5.substr(i * 3, 3))
  }
  _positionArray.sort()
  _positionArray.forEach((position, index) => {
    _positionObject[position] = POSITIONS[index]
  })
  return _positionObject
}

function getColors(domainMd5: string): number[] {
  const _strArray: string[] = []
  let _colorArray: number[] = []
  for (let i = 0; i <= 9; i++) {
    _strArray.push(domainMd5.substr(i * 2, 2))
  }
  _colorArray = _strArray.map((str) => {
    return (str.charCodeAt(0) + str.charCodeAt(1)) % 16
  })
  return _colorArray
}

function getFigurePaths(domainMd5: string): number[] {
  const _strArray: string[] = []
  let _figurePathArray: number[] = []
  for (let i = 0; i <= 8; i++) {
    _strArray.push(domainMd5.substr(i * 2, 2))
  }
  _figurePathArray = _strArray.map((str) => {
    return (str.charCodeAt(0) + str.charCodeAt(1)) % 17
  })
  return _figurePathArray
}

@Injectable()
export class AppService {
  @Cache({ ttl: 30 * 24 * 60 * 60 })
  async identicon(name: string) {
    const nameMd5 = md5(name)
    const _colors: number[] = getColors(nameMd5)
    const _positions: PositionsObject = getPositions(nameMd5)
    const _figurePaths: number[] = getFigurePaths(nameMd5)
    const _size = 60
    const _center = 30

    const scene = new Scene({
      width: _size,
      height: _size,
      displayRatio: 2
    })

    await scene.preload({
      id: 'logoUrl',
      src: path.resolve('./src/img/logo.png')
    })

    const layer = scene.layer()

    // background
    const rect = new Rect({
      normalize: true,
      pos: [_center, _center],
      size: [_size, _size],
      fillColor: COLORS[_colors[8]]
    })
    layer.append(rect)

    // figure
    for (let i = 0; i <= 8; i++) {
      const p = new Path()
      const pos = _positions[nameMd5.substr(i * 3, 3)]
      const d = FIGURE_PATHS[_figurePaths[i]]
      const fillColor = COLORS[_colors[i + 1]]
      p.attr({
        pos,
        d,
        fillColor
      })
      layer.appendChild(p)
    }

    // logo
    const logoSprite = new Sprite('logoUrl')
    logoSprite.attr({
      pos: [0, 0],
      size: [_size, _size]
    })
    layer.appendChild(logoSprite)

    // ring background
    const ringBg = new Ring({
      pos: [_center, _center],
      innerRadius: 29,
      outerRadius: 45,
      fillColor: '#FFFFFF'
    })
    layer.append(ringBg)

    // ring
    const ring = new Ring({
      pos: [_center, _center],
      innerRadius: 29,
      outerRadius: _center,
      fillColor: COLORS[_colors[0]],
      opacity: 0.2
    })
    layer.append(ring)

    const snapshotCanvas = scene.snapshot()
    return snapshotCanvas.toBuffer()
  }
}
