import { Injectable } from '@nestjs/common'
import { CanvasRenderingContext2D } from 'canvas'
import { Canvas, createCanvas } from 'node-canvas-webgl'
import QRCode from 'qrcode'
import path from 'path'
import md5 from 'blueimp-md5'
import { polyfill } from 'spritejs/lib/platform/node-canvas'
import { Scene, Rect, Path, Sprite, Ring, ENV } from 'spritejs/lib'
import { TIME_30D } from './constants/index'
import { Cache } from './decorators/cache.decorator'
import { accountColor } from 'das-ui-shared'

polyfill({ ENV })

interface PositionsObject {
  [key: string]: [number, number],
}

const POSITIONS: Array<[number, number]> = [
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

function renderTextToCanvas (
  ctx: CanvasRenderingContext2D,
  text: string,
  { x, y, font, color }
) {
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
}

function generateQrCode (text): Promise<Canvas> {
  return new Promise((resolve, reject) => {
    const canvas = createCanvas(400, 400)

    QRCode.toCanvas(canvas, text, { margin: 0 }, function (err) {
      console.log(err, canvas)
      if (err) {
        reject(err)
      }
      else {
        resolve(canvas)
      }
    })
  })
}

function drawRoundImage (
  ctx: CanvasRenderingContext2D,
  img: Canvas,
  x: number,
  y: number,
  d: number
) {
  const r = d / 2
  const centerX = x + r
  const centerY = y + r
  ctx.save()
  ctx.arc(centerX, centerY, r, 0, 2 * Math.PI)
  ctx.clip()
  ctx.drawImage(img, x, y, d, d)
  ctx.restore()
}

function getPositions (domainMd5: string): PositionsObject {
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

function getColors (domainMd5: string): number[] {
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

function getFigurePaths (domainMd5: string): number[] {
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
  @Cache({ ttl: TIME_30D })
  async seo (account: string, saleTag?: boolean): Promise<Buffer> {
    const width = 900
    const height = 473
    const widthCenter = width / 2

    const scene = new Scene({
      width: width,
      height: height,
      displayRatio: 1
    })

    const layer = scene.layer()

    // background
    layer.append(
      new Rect({
        normalize: true,
        pos: [widthCenter, height / 2],
        size: [width, height],
        fillColor: accountColor(account).color
      })
    )

    // decoration
    const seoCardDecorationId = 'seo-card-decoration'
    await scene.preload({
      id: seoCardDecorationId,
      src: path.resolve('./src/imgs/seo-card-decoration.png')
    })
    const backgroundSprite = new Sprite(seoCardDecorationId)
    backgroundSprite.attr({
      pos: [199, 107],
      size: [502, 319]
    })
    layer.appendChild(backgroundSprite)

    layer.append(
      new Sprite({
        pos: [widthCenter - 89.5, 284],
        size: [179, 80],
        borderRadius: 40,
        bgcolor: 'rgba(0, 0, 0, 0.1)'
      })
    )

    if (saleTag) {
      // sale tag
      const saleTagId = 'sale-tag'
      await scene.preload({
        id: saleTagId,
        src: path.resolve(`./src/imgs/${saleTagId}.png`)
      })
      const logoSprite = new Sprite(saleTagId)
      logoSprite.attr({
        pos: [615, 340],
        size: [120, 120]
      })
      layer.appendChild(logoSprite)
    }

    const snapshotCanvas = scene.snapshot()
    const snapshotCanvasCtx = snapshotCanvas.getContext('2d')

    // avatar
    const avatarCanvas = await this.identicon(account)
    drawRoundImage(snapshotCanvasCtx, avatarCanvas, 395, 50, 110)

    const accountArray = account.split('.')
    const accountName = accountArray[0]
    let fontSize = 76
    if (accountName.length >= 32) {
      fontSize = 26
    }
    else if (accountName.length >= 28) {
      fontSize = 30
    }
    else if (accountName.length >= 18) {
      fontSize = 44
    }
    else if (accountName.length >= 14) {
      fontSize = 56
    }
    else if (accountName.length >= 10) {
      fontSize = 62
    }

    // account name
    renderTextToCanvas(snapshotCanvasCtx, accountName, {
      font: `bold ${fontSize}px Arial`,
      x: widthCenter,
      y: 250,
      color: 'white'
    })

    renderTextToCanvas(snapshotCanvasCtx, '.bit', {
      font: 'bold 76px Arial',
      x: widthCenter,
      y: 350,
      color: 'white'
    })

    return snapshotCanvas.toBuffer()
  }

  @Cache({ ttl: TIME_30D })
  async identiconBuffer (account: string): Promise<Buffer> {
    const canvas = await this.identicon(account)
    return canvas.toBuffer()
  }

  async identicon (name: string): Promise<Canvas> {
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
      src: path.resolve('./src/imgs/logo.png')
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
    return snapshotCanvas
  }

  @Cache({ ttl: TIME_30D })
  async bestDasCard (account: string) {
    const url = `bestdas.com/account/${account}`

    const buffer = await this.card(
      account,
      'BestDAS',
      'Scan QR Code or visit it directly',
      url
    )
    return buffer
  }

  @Cache({ ttl: TIME_30D })
  async bitccCard (account: string, referer: string) {
    let url = `${account}.cc`

    if (referer?.includes('bit.host')) {
      url = `${account}.host`
    }

    const buffer = await this.card(
      account,
      'NFT Page',
      'Scan QR Code or visit it directly',
      url
    )
    return buffer
  }

  async card (
    account: string,
    title: string,
    text: string,
    url: string
  ): Promise<Buffer> {
    const link = `https://${url}`

    const width = 750
    const height = 1126

    const widthCenter = width / 2

    const scene = new Scene({
      width,
      height,
      displayRatio: 1
    })

    const cardLogoId = 'card-logo'
    const cardDecorationId = 'card-decoration'
    const cardNftsId = 'card-nfts'

    const layer = scene.layer()

    // background
    layer.append(
      new Rect({
        normalize: true,
        pos: [width / 2, height / 2],
        size: [width, height],
        fillColor: accountColor(account).color
      })
    )

    // logo
    await scene.preload({
      id: cardLogoId,
      src: path.resolve('./src/imgs/card-logo.png')
    })
    const logoSprite = new Sprite(cardLogoId)
    logoSprite.attr({
      pos: [36, 36],
      size: [108, 43]
    })
    layer.appendChild(logoSprite)

    // decoration
    await scene.preload({
      id: cardDecorationId,
      src: path.resolve('./src/imgs/card-decoration.png')
    })
    const backgroundSprite = new Sprite(cardDecorationId)
    backgroundSprite.attr({
      pos: [521, 0],
      size: [230, 240]
    })
    layer.appendChild(backgroundSprite)

    // card
    layer.append(
      new Sprite({
        // anchor: 0.5,
        pos: [36, 198],
        size: [678, 892],
        bgcolor: '#ffffff',
        borderRadius: 27
      })
    )

    // avatar background
    layer.append(
      new Sprite({
        anchor: 0.5,
        pos: [widthCenter, 198],
        size: [170, 170],
        bgcolor: '#ffffff',
        border: [10, '#ffffff'],
        borderRadius: 150
      })
    )

    // lines
    layer.append(
      new Rect({
        normalize: true,
        pos: [widthCenter, 445],
        size: [562, 1],
        fillColor: '#f0f0f0'
      })
    )

    layer.append(
      new Rect({
        normalize: true,
        pos: [widthCenter, 853],
        size: [562, 1],
        fillColor: '#f5f5f5'
      })
    )

    // nfts
    await scene.preload({
      id: cardNftsId,
      src: path.resolve('./src/imgs/card-nfts.png')
    })
    const nftsSprite = new Sprite(cardNftsId)
    nftsSprite.attr({
      anchor: 0.5,
      pos: [widthCenter, 957],
      size: [678, 146]
    })
    layer.appendChild(nftsSprite)

    const snapshotCanvas = scene.snapshot()
    const snapshotCanvasCtx = snapshotCanvas.getContext('2d')

    // avatar
    const avatarCanvas = await this.identicon(account)
    drawRoundImage(snapshotCanvasCtx, avatarCanvas, 290, 115, 170)

    // account name
    renderTextToCanvas(snapshotCanvasCtx, account, {
      font: 'bold 48px Arial',
      x: widthCenter,
      y: 340,
      color: 'black'
    })

    // NFT page
    renderTextToCanvas(snapshotCanvasCtx, title, {
      font: '28px Arial',
      x: widthCenter,
      y: 388,
      color: '#979797'
    })

    // scan code or QR code
    renderTextToCanvas(snapshotCanvasCtx, text, {
      font: '28px',
      x: widthCenter,
      y: 740,
      color: '#6F7684'
    })

    // domain
    renderTextToCanvas(snapshotCanvasCtx, url, {
      font: 'bold 36px Arial',
      x: widthCenter,
      y: 790,
      color: '#49B4C1'
    })

    // qrcode
    const qrcodeCanvas = await generateQrCode(link)
    snapshotCanvasCtx.drawImage(qrcodeCanvas, 270, 490, 200, 200)

    return snapshotCanvas.toBuffer()
  }
}
