export function accountColor(account: string): string {
  const colors = [
    '#9692E6',
    '#40C3F0',
    '#FF9895',
    '#FEC165',
    '#E96565',
    '#3370FF',
    '#FF4F6E',
    '#6957ED',
    '#22C4C6',
    '#BC51EC',
    '#FFA86A',
    '#22C68D'
  ]

  let index = 0
  for (let i = 0; i < account.length; i++) {
    index += account.charCodeAt(i)
  }
  index = index % colors.length
  const color = colors[index]

  return color
}
