import { Injectable } from '@nestjs/common'
import { Das } from 'das-sdk'
import { accountColor } from 'das-ui-shared'
import { ethers } from 'ethers'
import * as fs from 'fs'
import path from 'path'
import { AppService } from '../app.service'
import { LocalCache } from '../decorators/cache.decorator'
import { getCategory, getCharacterSet, tokenIdToAccountId } from '../modules/tools'
import abi from './abi.json'
import { Domain, NetConfig } from '../constants'
import { getTextWidth } from './text-width'
const cheerio = require('cheerio') // requiring in cjs to avoid ts error

const das = new Das({
  url: NetConfig.indexer,
})

const provider = ethers.getDefaultProvider(NetConfig.network)
const contract = new ethers.Contract(NetConfig.contract, abi, provider)

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

const suffix2Logo = {
  '.max': 'static/suffix/logo.max.png',
  // '.max': 'static/suffix/logo.max.black.png',
}

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

  @LocalCache({
    dir: 'erc721Metadata',
    key: function (tokenId: string) {
      return `${tokenId}.json`
    }
  })
  async erc721Metadata (tokenId: string) {
    if (!tokenId.match(/^\d{30,50}$/)) {
      throw new Error(`${tokenId} is not valid`)
    }
    const accountId = tokenIdToAccountId(tokenId)
    const account = await das.accountById(accountId)
    const name = account.account.replace(/\.bit$/, '')

    const expireAt = await contract.getExpires(account.account_id_hex)

    return JSON.stringify({
      name: account.account,
      description: `${account.account}, Web3 identity for you and your community.\n https://did.id\n More about ${account.account}: https://bit.ly/3te6SOP`,
      image: `https://${Domain}/erc721/card/${tokenId}`,
      external_url: 'https://did.id',
      attributes: [{
        trait_type: 'Expiration Date',
        display_type: 'date',
        value: expireAt.toNumber() * 1000 // seconds to milliseconds
      }, {
        trait_type: 'Registration Date',
        display_type: 'date',
        value: account.create_at_unix * 1000,
      }, {
        trait_type: 'Length',
        display_type: 'number',
        value: name.length
      }, {
        trait_type: 'Character Set',
        value: getCharacterSet(name),
      }, ...getCategory(name)],
    })
  }

  @LocalCache({
    dir: 'erc721card',
    key: function (tokenId: string) {
      return `${tokenId}.${arguments.length}.svg`
    }
  })
  async erc721Card (tokenId: string, textDesc = 'Web3 Identity', textLoc: string) {
    let account = ''
    let suffix = '.bit'

    // we can handle both account and account_id here
    if (tokenId.match(/\.bit$/)) {
      account = tokenId
    }
    else if (tokenId.includes('.')) {
      account = tokenId
      suffix = tokenId.match(/\.[^.]+$/)[0]
    }
    else {
      const accountId = tokenIdToAccountId(tokenId)
      const accountInfo = await das.accountById(accountId)
      account = accountInfo.account
    }

    let avatarBuffer: Buffer

    if (suffix2Logo[suffix]) {
      avatarBuffer = fs.readFileSync(suffix2Logo[suffix])
    }
    // .bit or no logo
    else {
      avatarBuffer = await this.appService.identiconBuffer(account)
    }

    const avatar = avatarBuffer.toString('base64')

    const name = account.replace(suffix, '')
    const nameDisplay = generateNameDisplay(name)
    const $nameText = generateNameSvg(nameDisplay)

    const bgColor = accountColor(account)
    const suffixWidth = getTextWidth(suffix, 66) + 80

    const $ = cheerio.load(svgTemplate)

    if (suffix !== '.bit') {
      $('#rounded_square').attr('height', 420)
      $('#bit-logo').remove()
      // can not figure out why we can only remove it, while can not set a empty text like .text('')
      $('#text-desc').remove()
      $('#text-loc')
        .attr('x', (500 - 30 - getTextWidth(account, 18)) / 2)
        .attr('y', 472)
        .text(`d.id/${account}`)
    }
    else {
      $('#text-desc').text('Web3 Identity')
    }

    $('#rounded_square').attr('fill', bgColor.color)
    $('#avatarImage').attr('xlink:href', `data:image/png;base64,${avatar}`)
    $('#account').prepend($nameText)
    $('#account_suffix').text(suffix)
    $('#account_suffix_container')
      .attr('width', suffixWidth)
      .attr('x', (500 - suffixWidth) / 2)
    $('#text-desc').text(textDesc)
    $('#text-loc').text(textLoc)

    return $('body').html()
  }

  async test () {
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
