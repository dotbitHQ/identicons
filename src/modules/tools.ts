import emojiRegex from 'emoji-regex'

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
