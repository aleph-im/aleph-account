// FIXME
// Potential dupplicate of "text-overflow: ellipsis" property
// https://developer.mozilla.org/en-US/docs/Web/CSS/text-overflow
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

export function convertTimestamp (timestamp) {
  var a = new Date(timestamp * 1000)
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  var year = a.getFullYear()
  var month = months[a.getMonth()]
  var date = a.getDate()
  var hour = a.getHours()
  var min = a.getMinutes()
  var sec = a.getSeconds()
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec
  return time
}

export function ellipseAddress (address, width = 10) {
  return `${address.slice(0, width)}...${address.slice(-width)}`
}

/**
 * Use to copy an element from on array to the other based on a key.
 * Transforms a O(n^2) into a O(2n) operation
 *
 * @param {Array} replaceFrom An array to copy value from
 * @param {Function} accessorFrom A function that retrieves a key in `replaceFrom`
 * @param {Array} replaceInto The copy destination
 * @param {Function} accessorInto A function that retrieves a key in `replaceTo`
 * @param {Function} replacementCallback A function that should output an object
 */
export function hashmapReplace (replaceFrom, accessorFrom, replaceInto, accessorInto, replacementCallback) {
  const hashMap = {}
  for (const i of replaceFrom) {
    const hashMapKey = accessorFrom(i)
    hashMap[hashMapKey] = i
  }

  return replaceInto.map((x, i) => {
    const hashMapKey = accessorInto(x)
    return replacementCallback(hashMap[hashMapKey], x, hashMapKey, i)
  })
}
