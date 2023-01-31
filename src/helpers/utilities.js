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
 * @param {Array} origin An array to copy value from
 * @param {Function} originAccessor A function that retrieves a key in `origin`
 * @param {Array} destination The copy destination
 * @param {Function} destinationAccessor A function that retrieves a key in `replaceTo`
 * @param {Function} joinCallback A function that takes a value with the same key from `origin` and `destination` and outputs an object
 */
export function joinArrays (origin, originAccessor, destination, destinationAccessor, joinCallback) {
  const hashMap = new Map()
  for (const item of origin) {
    const hashMapKey = originAccessor(item)
    hashMap.set(hashMapKey, item)
  }

  return destination.map((x, i) => {
    const hashMapKey = destinationAccessor(x)
    return joinCallback(hashMap.get(hashMapKey), x, hashMapKey, i)
  })
}
