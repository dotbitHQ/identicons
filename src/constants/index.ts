export const TIME_30D = 30 * 24 * 60 * 60
export const TIME_1D = 24 * 60 * 60
export const TIME_1H = 60 * 60
export const TIME_10S = 10

export const IsMainnet = process.env.NET_ENV === 'production'

console.log('==========')
console.log(`isMainnet: ${IsMainnet}`)
console.log('==========')

export const MainNet = {
  indexer: 'https://indexer-not-use-in-production-env.did.id/',
  contract: '0x60eB332Bd4A0E2a9eEB3212cFdD6Ef03Ce4CB3b5',
  network: 'homestead'
}

export const TestNet = {
  indexer: 'https://test-indexer-not-use-in-production-env.did.id/',
  contract: '0x7eCBEE03609f353d041942FF50CdA2A120ABddd9',
  network: 'goerli'
}

export const NetConfig = IsMainnet ? MainNet : TestNet

export const Domain = IsMainnet ? 'display.did.id' : 'testdisplay.did.id'
