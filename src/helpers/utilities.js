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

/**
 * Check if a value is null, undefined, empty string or empty array but not 0. Prevents false positive on 0 using !value
 *
 * @param {any} input
 * @returns true if value is null, undefined, empty string or empty array
 */
export function nullButNot0 (input) {
  return (
    input === undefined || input === null || input === '' || input?.length > 0
  )
}

/**
 * Normalises a value between a min and max value, if floor and ceil are provided, it will return the floor or ceil if the value is outside the [min, max] interval
 *
 * @param {number} input
 * @param {number} min
 * @param {number} max
 * @param {number} floor
 * @param {number} ceil
 * @returns a number in the [min, max] interval
 */
export function normalizeValue (input, min, max, floor, ceil) {
  if (!input) return 0
  if (input > max) return 1
  if (input < min) return 0

  const normalized = (input - min) / (max - min)
  if (floor === undefined || ceil === undefined) return normalized
  if (normalized < min) return floor
  if (normalized > max) return ceil
  return normalized
}

/**
 * Fetches a URL and caches the result in LocalStorage for a given time
 *
 * @param {string} url The URL to fetch
 * @param {string} cacheKey The LocalStorage key to use for cachinng (must be unique)
 * @param {number} cacheTime The time in ms to cache the data for (defaults to one hour)
 * @param {function} selector A selector function to select a part of the data to cache (defaults to the full payload)
 * @returns
 */
export async function fetchAndCache (url, cacheKey, cacheTime = 1000 * 60 * 60 * 24) {
  const cached = localStorage.getItem(cacheKey)
  const now = Date.now()
  if (cached) {
    const { cachedAt, value } = JSON.parse(cached)
    if (now - cachedAt < cacheTime) {
      console.log(`Retrieved ${cacheKey} from cache`)
      return value
    }
  }

  try {
    const data = await fetch(url)
    const value = await data.json()

    const toCache = JSON.stringify({
      cachedAt: now,
      value
    })
    localStorage.setItem(cacheKey, toCache)
  } catch (error) {
    console.error(`Failed to fetch ${url}`, error)
    if(cached) return JSON.parse(cached).value
  }
}

/**
 * Takes a list of github releases and returns the latest, the latest prerelease and a list of outdated versions
 *
 * @param {Array} payload A list of github releases, returned from the API (https://api.github.com/repos/[owner]/[name]/releases)
 * @param {Number} outdatedAfter The time in ms after which a release is considered outdated (defaults to 14 days)
 */
export function getLatestReleases (payload, outdatedAfter = 1000 * 60 * 60 * 24 * 14) {
  const versions = {
    latest: null,
    prerelease: null,
    outdated: null
  }

  let latestReleaseDate = null

  if (!payload) return versions

  for (const item of payload) {
    if (item.prerelease && !versions.prerelease) {
      versions.prerelease = item.tag_name
    }
    if (!item.prerelease && !versions.latest) {
      versions.latest = item.tag_name
      latestReleaseDate = new Date(item.published_at).getTime()
    }
    if (versions.latest && versions.prerelease && !versions.outdated && !item.prerelease && Date.now() - latestReleaseDate < outdatedAfter) {
      versions.outdated = item.tag_name
    }
  }

  return versions
}

/**
 * Strips away the extra commit number and hash from the "git describe --tags" output
 *
 * @param {String} gitTag The output of a "git describe --tags" command
 * @returns The tag name without the extra commit number and hash
 */
export function stripExtraTagDescription (gitTag) {
  return gitTag.replace(/-\d+-g\w{7}$/gi, '')
}
