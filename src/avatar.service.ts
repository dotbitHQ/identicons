import blake2b from '@bitgo/blake2b'
import { Injectable } from '@nestjs/common'
import { CanvasRenderingContext2D, createCanvas, Image, loadImage } from 'canvas'
import { accountColor } from 'das-ui-shared'
import path from 'path'
import { Das } from 'das-sdk'
import { Cache, LocalCache } from './decorators/cache.decorator'
import { ethers } from 'ethers'
import { fetchJson } from '@ethersproject/web'
import { BigNumber } from '@ethersproject/bignumber'
import { hexConcat, hexDataSlice, hexZeroPad } from '@ethersproject/bytes'
import { toUtf8String } from '@ethersproject/strings'

const das = new Das({
  url: 'https://indexer-not-use-in-production-env.did.id',
})

const provider = new ethers.providers.AnkrProvider()

function unitIndexes (length: number): string[] {
  const maxLength = Math.max(length.toString().length, 2)

  return Array.from(new Array(length)).map((_, i) => {
    return (i + 1).toString().padStart(maxLength, '0')
  })
}

function blake2bHash (text: string): string {
  const output = new Uint8Array(32)
  const input = Buffer.from(text)

  return blake2b(
    output.length,
    undefined,
    undefined,
    Buffer.from('ckb-default-hash')
  )
    .update(input)
    .digest('hex')
}

async function loadUnitImage (layer: Layer, index: string): Promise<Image> {
  return await loadImage(
    path.resolve(
      __dirname,
      '../src',
      `imgs/avatar/layer${layer.layer}-${layer.name}/${layer.name}-${index}.png`
    )
  )
}

function getWeight (hash: string, layer: Layer): number {
  const hex = layer.fromBytes.map(byteIndex => hash[byteIndex]).join('')
  return parseInt(hex, 16)
}

const layers = [
  {
    layer: '01',
    name: 'headset',
    units: unitIndexes(14),
    fromBytes: [0, 1]
  },
  {
    layer: '02',
    name: 'mask',
    units: unitIndexes(3),
    fromBytes: [2, 3],
  },
  {
    layer: '03',
    name: 'coupler',
    units: unitIndexes(5),
    fromBytes: [4, 5],
  },
  {
    layer: '04',
    name: 'armour',
    units: ['null', ...unitIndexes(3)],
    fromBytes: [6, 7],
  },
  {
    layer: '05',
    name: 'widget',
    units: ['null', ...unitIndexes(12)],
    fromBytes: [8, 9],
  },
  {
    layer: '06',
    name: 'badge',
    units: ['null', ...unitIndexes(11)],
    fromBytes: [10, 11],
  },
  {
    layer: '07',
    name: 'chest',
    units: unitIndexes(4),
    fromBytes: [12, 13],
  },
  {
    layer: '08',
    name: 'head',
    units: unitIndexes(3),
    fromBytes: [14],
  },
  {
    layer: '09',
    name: 'body',
    units: unitIndexes(11),
    fromBytes: [15, 16],
  },
  {
    layer: '10',
    name: 'back',
    units: ['null', ...unitIndexes(1)],
    fromBytes: [17, 18],
  },
  {
    layer: '11',
    name: 'texture',
    units: unitIndexes(2),
    fromBytes: [19],
  }
]

enum AvatarSize {
  xxs = 'xxs', // 50
  xs = 'xs', // 100
  sm = 'sm', // 200
  md = 'md', // 300
  lg = 'lg', // 500
  xl = 'xl', // 800
  xxl = 'xxl', // 1000
}

const AvatarSizeMap = {
  [AvatarSize.xxs]: 50,
  [AvatarSize.xs]: 100,
  [AvatarSize.sm]: 200,
  [AvatarSize.md]: 300,
  [AvatarSize.lg]: 500,
  [AvatarSize.xl]: 800,
  [AvatarSize.xxl]: 1000,
}

const matcherIpfs = /^(ipfs):\/\/(.*)$/i

const matchers = [
  /^(https):\/\/(.*)$/i,
  /^(data):(.*)$/i,
  matcherIpfs,
  /^eip155:[0-9]+\/(erc[0-9]+):(.*)$/i,
]

// Trim off the ipfs:// prefix and return the default gateway URL
function getIpfsLink (link: string): string {
  if (link.match(/^ipfs:\/\/ipfs\//i)) {
    link = link.substring(12)
  }
  else if (link.match(/^ipfs:\/\//i)) {
    link = link.substring(7)
  }
  else {
    throw new Error(`unsupported IPFS format '${link}'`)
  }

  return `https://gateway.ipfs.io/ipfs/${link}`
}

function _parseBytes (result: string, start: number): null | string {
  if (result === '0x') {
    return null
  }

  const offset: number = BigNumber.from(hexDataSlice(result, start, start + 32)).toNumber()
  const length: number = BigNumber.from(hexDataSlice(result, offset, offset + 32)).toNumber()

  return hexDataSlice(result, offset + 32, offset + 32 + length)
}
function _parseString (result: string, start: number): null | string {
  try {
    return toUtf8String(_parseBytes(result, start))
  }
  catch (error) { }
  return null
}

type Layer = typeof layers[0]

export interface AvatarOptions {
  size?: AvatarSize,
}

function drawPlainBackground (account: string, ctx: CanvasRenderingContext2D, size: number): void {
  const color = accountColor(account)
  ctx.fillStyle = color.color
  ctx.fillRect(0, 0, size, size)
}

@Injectable()
export class AvatarService {
  @LocalCache({
    dir: 'avatar',
    key: (account: string, options: AvatarOptions = {}) => `${account}.${options.size || AvatarSize.md}.jpg`
  })
  async avatar (account: string, options: AvatarOptions = {}): Promise<Buffer> {
    const name = account.replace(/\.bit$/, '')
    const hash = blake2bHash(name)

    const size = (options.size && AvatarSizeMap[options.size]) || AvatarSizeMap[AvatarSize.md]

    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d')

    // apply units backwards
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i]

      const variantWeight = getWeight(hash, layer)

      if (layer.name === 'texture' && variantWeight > layer.units.length) {
        drawPlainBackground(account, ctx, size)
      }
      else {
        const unitIndex = layer.units[variantWeight % layer.units.length]

        const image = await loadUnitImage(layer, unitIndex)

        ctx.drawImage(image, 0, 0, size, size)
      }
    }

    return canvas.toBuffer('image/jpeg', { quality: 0.9 })
  }

  @Cache({ key: 'resolve', ttl: 3600 })
  async resolve (accountName: string) {
    const result = await this._resolve(accountName)

    if (!result) {
      return {
        linkage: [{
          type: 'account',
          content: 'phone.bit',
        }, {
          type: 'fallback',
          content: 'identicon',
        }, {
          type: 'url',
          content: `https://identicons.did.id/identicon/${accountName}`
        }],
        // url: `https://identicons.did.id/avatar/${accountName}`,
        url: `https://identicons.did.id/identicon/${accountName}`
      }
    }

    return result
  }

  /**
   * resolve avatar on-chain
   * forked from ethers.js
   * @param accountName
   */
  async _resolve (accountName: string) {
    const linkage: Array<{ type: string, content: string }> = [{ type: 'account', content: accountName }]
    try {
      const account = await das.account(accountName)
      if (!account?.owner_key) {
        return null
      }
      // test data for jeffx.bit
      // const avatar = "eip155:1/erc721:0x265385c7f4132228A0d54EB1A9e7460b91c0cC68/29233";
      const avatarRecord = await das.records(accountName, 'profile.avatar')
      const avatar = avatarRecord[0]?.value
      if (!avatar) {
        return null
      }

      for (let i = 0; i < matchers.length; i++) {
        const match = avatar.match(matchers[i])
        if (match == null) {
          continue
        }

        const scheme = match[1].toLowerCase()

        switch (scheme) {
          case 'https':
            linkage.push({ type: 'url', content: avatar })
            return { linkage, url: avatar }

          case 'data':
            linkage.push({ type: 'data', content: avatar })
            return { linkage, url: avatar }

          case 'ipfs':
            linkage.push({ type: 'ipfs', content: avatar })
            return { linkage, url: getIpfsLink(avatar) }

          case 'erc721':
          case 'erc1155': {
            // Depending on the ERC type, use tokenURI(uint256) or url(uint256)
            const selector = (scheme === 'erc721') ? '0xc87b56dd' : '0x0e89341c'
            linkage.push({ type: scheme, content: avatar })

            // The owner of this name
            // todo: only use under eth
            const owner = account.owner_key

            const comps = (match[2] || '').split('/')
            if (comps.length !== 2) {
              return null
            }

            const addr = provider.formatter.address(comps[0])
            const tokenId = hexZeroPad(BigNumber.from(comps[1]).toHexString(), 32)

            // Check that this account owns the token
            if (scheme === 'erc721') {
              // ownerOf(uint256 tokenId)
              const tokenOwner = provider.formatter.callAddress(await provider.call({
                to: addr, data: hexConcat(['0x6352211e', tokenId])
              }))
              if (owner !== tokenOwner) {
                return null
              }
              linkage.push({ type: 'owner', content: tokenOwner })
            }
            else if (scheme === 'erc1155') {
              // balanceOf(address owner, uint256 tokenId)
              const balance = BigNumber.from(await provider.call({
                to: addr, data: hexConcat(['0x00fdd58e', hexZeroPad(owner, 32), tokenId])
              }))
              if (balance.isZero()) {
                return null
              }
              linkage.push({ type: 'balance', content: balance.toString() })
            }

            // Call the token contract for the metadata URL
            const tx = {
              to: provider.formatter.address(comps[0]),
              data: hexConcat([selector, tokenId])
            }

            let metadataUrl = _parseString(await provider.call(tx), 0)
            if (metadataUrl == null) {
              return null
            }
            linkage.push({ type: 'metadata-url-base', content: metadataUrl })

            // ERC-1155 allows a generic {id} in the URL
            if (scheme === 'erc1155') {
              metadataUrl = metadataUrl.replace('{id}', tokenId.substring(2))
              linkage.push({ type: 'metadata-url-expanded', content: metadataUrl })
            }

            // Transform IPFS metadata links
            if (metadataUrl.match(/^ipfs:/i)) {
              metadataUrl = getIpfsLink(metadataUrl)
            }

            linkage.push({ type: 'metadata-url', content: metadataUrl })

            // Get the token metadata
            const metadata = await fetchJson(metadataUrl)
            if (!metadata) {
              return null
            }
            linkage.push({ type: 'metadata', content: JSON.stringify(metadata) })

            // Pull the image URL out
            let imageUrl = metadata.image
            if (typeof (imageUrl) !== 'string') {
              return null
            }

            if (imageUrl.match(/^(https:\/\/|data:)/i)) {
              // Allow
            }
            else {
              // Transform IPFS link to gateway
              const ipfs = imageUrl.match(matcherIpfs)
              if (ipfs == null) {
                return null
              }

              linkage.push({ type: 'url-ipfs', content: imageUrl })
              imageUrl = getIpfsLink(imageUrl)
            }

            linkage.push({ type: 'url', content: imageUrl })

            return { linkage, url: imageUrl }
          }
        }
      }
    }
    catch (error) { }

    return null
  }
}
