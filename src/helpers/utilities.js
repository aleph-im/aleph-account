import { Notify } from 'quasar'

export function ellipseText (text, maxLength = 9999) {
  if (text.length <= maxLength) {
    return text
  }
  const _maxLength = maxLength - 3
  let ellipse = false
  let currentLength = 0
  const result =
      text
        .split(' ')
        .filter(word => {
          currentLength += word.length
          if (ellipse || currentLength >= _maxLength) {
            ellipse = true
            return false
          } else {
            return true
          }
        })
        .join(' ') + '...'
  return result
}

export function ellipseAddress (address, width = 10) {
  return `${address.slice(0, width)}...${address.slice(-width)}`
}

export async function copyToClipboard (text) {
  console.log('function')
  const clipboardPermission = await navigator.permissions.query({ name: 'clipboard-write' })
  const notifyOptions = {
    position: 'top',
    timeout: 5000,
    message: 'Copied to clipboard'
  }

  if (clipboardPermission.state === 'granted' || clipboardPermission.state === 'prompt') {
    await navigator.clipboard.writeText(text)
  } else {
    notifyOptions.message = 'Unable to access the clipboard'
    notifyOptions.color = 'negative'
  }

  console.log(Notify)

  return Notify.create(notifyOptions)
}
