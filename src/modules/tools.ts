import emojiRegex from 'emoji-regex'
import wordList from 'word-list-json'

export enum CharacterSet {
  ALPHANUMERIC = 'alphanumeric',
  DIGIT= 'digit',
  EMOJI= 'emoji',
  LETTER= 'letter',
  MIXED= 'mixed',
}

/**
 * Get the correct charset
 * Forked from ens-metadata-service
 * @param label
 */
export function getCharacterSet (label: string): CharacterSet {
  // digits
  if (/^\d+$/.test(label)) return CharacterSet.DIGIT
  // latin letters
  if (/^[a-zA-Z]+$/.test(label)) return CharacterSet.LETTER
  // regex unicode mode, alphanumeric
  // \p{L} or \p{Letter}: any kind of letter from any language.
  // \p{N} or \p{Number}: any kind of numeric character in any script.
  if (/^[\p{L}\p{N}]*$/u.test(label)) return CharacterSet.ALPHANUMERIC
  // regex emoji only
  const emojiRxp = emojiRegex()
  const newEmojiRxp = new RegExp(`^(${emojiRxp.source})+$`, emojiRxp.flags)
  if (newEmojiRxp.test(label)) return CharacterSet.EMOJI

  return CharacterSet.MIXED
}

/**
 * Transform digital tokenId to hex accountId
 * @param tokenId
 */
export function tokenIdToAccountId (tokenId: string): string {
  return '0x' + BigInt(tokenId).toString(16).padStart(40, '0')
}

export function getCategory (name: string) {
  const categories = []
  // With Lucky number
  if (/6|8/.test(name) && /^\d+$/.test(name)) {
    categories.push({
      trait_type: `${name.length}D`,
      value: 'Lucky'
    })
  }
  // 3D account
  if (name.length === 3 && /^\d+$/.test(name)) {
    const category = { trait_type: '3D', value: '999 club' }
    categories.push(category)
    return categories
  }

  if (name.length === 5 && name.startsWith('0x') && /^\d+$/.test(name.slice(2))) {
    return [{
      trait_type: '3D',
      value: '0x999'
    }]
  }

  // 4D account
  if (name.length === 4 && /^\d+$/.test(name)) {
    const category = { trait_type: '4D', value: '' }
    category.value = '10k club'
    categories.push(category)

    const values = ['AAAA', 'ABBB', 'AAAB', 'AABA', 'ABAA', 'AABB', 'ABAB', 'ABBA', 'AABC', 'ABCC']
    const value = getReduplicationValue(values, name)
    if (value !== '') {
      categories.push({
        trait_type: '4D',
        value
      })
    }

    // MMDD: month and day
    const month = name.slice(0, 2)
    const day = name.slice(2)
    if (month >= '01' && month <= '12' && day >= '01' && day <= '31') {
      categories.push({
        trait_type: '4D',
        value: 'MMDD'
      })
    }

    // ABCD
    if (isContinus(name, false)) {
      categories.push({
        trait_type: '4D',
        value: 'ABCD'
      })
    }

    // DCBA
    if (isContinus(name, true)) {
      categories.push({
        trait_type: '4D',
        value: 'DCBA'
      })
    }
    return categories
  }

  if (name.length === 6 && name.startsWith('0x') && /^\d+$/.test(name.slice(2))) {
    return [{
      trait_type: '4D',
      value: '0x10k'
    }]
  }

  // 5D account
  if (name.length === 5 && /^\d+$/.test(name)) {
    const category = { trait_type: '5D', value: '100k club' }
    categories.push(category)
    const values = ['AAAAA', 'AABAA', 'ABBBB', 'AAAAB', 'ABAAA', 'AAABB', 'AABBB', 'AAABA', 'ABBBA', 'ABCCC', 'ABBBC', 'AAABC', 'ABABA', 'ABCBA']
    const value = getReduplicationValue(values, name)
    if (value !== '') {
      categories.push({
        trait_type: '5D',
        value
      })
    }

    // ABCDE
    if (isContinus(name, false)) {
      categories.push({
        trait_type: '5D',
        value: 'ABCDE'
      })
    }

    // EDCBA
    if (isContinus(name, true)) {
      categories.push({
        trait_type: '5D',
        value: 'EDCBA'
      })
    }
    return categories
  }

  if (name.length === 7 && name.startsWith('0x') && /^\d+$/.test(name.slice(2))) {
    return [{
      trait_type: '5D',
      value: '0x100k'
    }]
  }

  // Letter
  if (/^[a-zA-Z]+$/.test(name)) {
    const values = ['AAAA', 'ABBBA', 'AABB', 'ABAB', 'ABABA']
    const value = getReduplicationValue(values, name)
    if (value !== '') {
      categories.push({
        trait_type: 'Letter',
        value
      })
    }
    if (wordList.includes(name)) {
      categories.push({
        trait_type: 'Letter',
        value: `Word${name.length}L`
      })
    }
    return categories
  }
  return []
}

function isContinus (str: string, descend: boolean): boolean {
  for (let i = 1; i < str.length; i++) {
    if (str.charCodeAt(i) !== (str.charCodeAt(i - 1) + (descend ? -1 : 1))) {
      return false
    }
  }
  return true
}

function getReduplicationValue (values: string[], name: string) {
  for (const value of values) {
    const used = new Map()
    const reg = value.split('').reduce((pre, next) => {
      if (!used.has(next)) {
        used.set(next, 1)
        return `${pre}(?<${next}>\\S)`
      }
      else {
        return `${pre}\\k<${next}>`
      }
    }, '')
    if (new RegExp(`^${reg}$`).test(name)) {
      return value
    }
  }
  return ''
}
