import { Injectable } from '@nestjs/common'
import { Das } from 'das-sdk'
import { accountColor } from 'das-ui-shared'
import { ethers } from 'ethers'
import * as fs from 'fs'
import path from 'path'
import { AppService } from '../app.service'
import abi from './abi.json'
const cheerio = require('cheerio') // requiring in cjs to avoid ts error

// testnet
// const config = {
//   indexer: 'https://test-indexer-not-use-in-production-env.did.id/',
//   contract: '0x7eCBEE03609f353d041942FF50CdA2A120ABddd9',
//   network: 'goerli',
// }

// mainnet
const config = {
  indexer: 'https://indexer-not-use-in-production-env.did.id/',
  contract: '0x60eB332Bd4A0E2a9eEB3212cFdD6Ef03Ce4CB3b5',
  network: 'homestead',
}

const das = new Das({
  url: config.indexer,
})

const provider = ethers.getDefaultProvider(config.network)
const contract = new ethers.Contract(config.contract, abi, provider)

const svgTemplate = fs.readFileSync(path.resolve(__dirname, '../../static/erc721-card.svg'), 'utf8')

interface Format {
  min: number,
  max: number,
  fontSize: number,
  lines: number,
}

const accountFormats: Format[] = [{
  min: 0,
  max: 9,
  fontSize: 66,
  lines: 1,
}, {
  min: 10,
  max: 10,
  fontSize: 60,
  lines: 1,
}, {
  min: 11,
  max: 13,
  fontSize: 48,
  lines: 1
}, {
  min: 14,
  max: 17,
  fontSize: 36,
  lines: 1
}, {
  min: 18,
  max: 24,
  fontSize: 48,
  lines: 2
}, {
  min: 25,
  max: 32,
  fontSize: 36,
  lines: 2
}, {
  min: 33,
  max: 48,
  fontSize: 36,
  lines: 3
}, {
  min: 49,
  max: 75,
  fontSize: 24,
  lines: 3
}, {
  min: 76,
  max: 1000,
  fontSize: 24,
  lines: 4,
}]

function getCharWeight (char: string) {
  return char.match(/\ud83d[\ude00-\ude4f]/g) ? 2 : 1
}

function calcAccountWeight (account: string) {
  let weight = 0
  for (const accountElement of account) {
    weight += getCharWeight(accountElement)
  }

  return weight
}

interface Display {
  lines: string[],
  format: Format,
}

function generateNameDisplay (name: string): Display {
  const weight = calcAccountWeight(name)
  const format = accountFormats.find(format => weight >= format.min && weight <= format.max)

  const singleLineWeight = weight / format.lines
  const lines: string[] = []

  let currentLineWeight = 0
  let currentLine = 0

  for (const accountElement of name) {
    if (!lines[currentLine]) {
      lines.push('')
    }

    currentLineWeight += getCharWeight(accountElement)
    lines[currentLine] += accountElement

    if (currentLineWeight >= singleLineWeight) {
      currentLineWeight = 0
      currentLine++
    }
  }

  return {
    lines,
    format,
  }
}

function generateNameSvg (display: Display) {
  const tspan = '<tspan x="250"></tspan>'
  const text = '<text fill="white" font-size="66" font-weight="900" x="250" y="235" style="dominant-baseline:middle;text-anchor:middle;" font-family="\'SF Pro Display\',system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Ubuntu,Helvetica,Arial,\'Apple Color Emoji\',\'Noto Color Emoji\',\'Segoe UI Emoji\'"></text>'
  const format = display.format

  const $text = cheerio.load(text)('text')

  $text.attr('font-size', String(format.fontSize))

  for (let i = 0; i < display.lines.length; i++) {
    const $tspan = cheerio.load(tspan)('tspan')
    $tspan.text(display.lines[i])

    if (display.lines.length > 1) {
      if (i === 0) {
        $tspan.attr('dy', String(-format.fontSize / 2 * (format.lines - 1)))
      }
      else {
        $tspan.attr('dy', String(format.fontSize))
      }
    }

    $text.append($tspan)
  }

  return $text
}

@Injectable()
export class Erc721Service {
  constructor (
    readonly appService: AppService,
  ) {
  }

  async erc721Metadata (tokenId: string) {
    const tokenIdHex = '0x' + BigInt(tokenId).toString(16)
    const account = await das.accountById(tokenIdHex)
    const name = account.account.replace(/\.bit$/, '')

    const expireAt = await contract.getExpires(account.account_id_hex)

    return {
      name: account.account,
      description: `${account.account}, Web3.0 identity for you and your community.\n https://did.id`,
      image: `https://display.did.id/erc721/card/${tokenId}`,
      external_url: 'https://did.id',
      attributes: [{
        display_type: 'date',
        trait_type: 'Expiration Date',
        value: expireAt.toNumber() * 1000 // seconds to milliseconds
      }, {
        display_type: 'date',
        trait_type: 'Registration Date',
        value: account.create_at_unix * 1000,
      }, {
        display_type: 'number',
        trait_type: 'Length',
        value: name.length
      }],
    }
  }

  async erc721Card (tokenId: string) {
    let account = ''

    // we can handle both account and account_id here
    if (tokenId.match(/\.bit$/)) {
      account = tokenId
    }
    else {
      const tokenIdHex = '0x' + BigInt(tokenId).toString(16)
      const accountInfo = await das.accountById(tokenIdHex)
      account = accountInfo.account
    }

    const name = account.replace(/\.bit$/, '')
    const nameDisplay = generateNameDisplay(name)
    const $nameText = generateNameSvg(nameDisplay)

    const avatarBuffer = await this.appService.identiconBuffer(account)
    const avatar = avatarBuffer.toString('base64')

    const color = accountColor(account)

    const $ = cheerio.load(svgTemplate)
    $('#account').prepend($nameText)
    $('#avatarImage').attr('xlink:href', `data:image/png;base64,${avatar}`)
    $('#rounded_square').attr('fill', color.color)

    return $('body').html()
  }

  test () {
    return `
<html>
  <body>
    <img>
    <pre>${JSON.stringify(accountFormats, null, 2)}</pre>
    <script type="module">
    let account = ''
    let search = document.location.search.replace('?', '')
    for (let i =0; i < 100; i++) {
        account += search ? search : String.fromCharCode(97+i%26)
        document.querySelector('img').src=window.location.origin + "/erc721/card/" + account + ".bit"
        await new Promise(resolve => setTimeout(resolve, 500))
        console.log(i)
    }
    </script>
  </body>    
</html>`
  }
}
