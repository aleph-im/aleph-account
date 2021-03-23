/*
Code taken from https://github.com/ipfs-shipyard/ipfs-companion/add-on/src/lib/ipfs-path.js
Originally under Creative Commons Zero v1.0 Universal license which should be compatible with MIT
*/

const isIPFS = require('is-ipfs')

function dnsLabelToFqdn (label) {
  if (label && !label.includes('.') && label.includes('-') && !isIPFS.cid(label)) {
    // no '.' means the subdomain name is most likely an inlined DNSLink into single DNS label
    // en-wikipedia--on--ipfs-org → en.wikipedia-on-ipfs.org
    // (https://github.com/ipfs/in-web-browsers/issues/169)
    label = label.replace(/--/g, '@').replace(/-/g, '.').replace(/@/g, '-')
  }
  return label
}

function subdomainPatternMatch (url) {
  if (typeof url === 'string') {
    url = new URL(url)
  }
  const match = url.toString().match(isIPFS.subdomainGatewayPattern)
  if (!match || match.length < 3) return false
  const id = match[1]
  const ns = match[2]
  return { id, ns }
}

// Turns URL or URIencoded path into a content path
export function ipfsContentPath (urlOrPath, opts) {
  opts = opts || {}

  // ipfs:// → /ipfs/
  if (urlOrPath && urlOrPath.toString().startsWith('ip')) {
    urlOrPath = urlOrPath.replace(/^(ip[n|f]s):\/\//, '/$1/').replace('/ipfs/ipfs/', '/ipfs/')
  }

  console.log(urlOrPath)

  // Fail fast if no content path can be extracted from input
  if (!isIPFS.urlOrPath(urlOrPath)) return null

  // Turn path to URL (hostname does not matter, let's use localhost)
  if (isIPFS.path(urlOrPath)) urlOrPath = `https://localhost${urlOrPath}`

  // Create URL
  let url = typeof urlOrPath === 'string' ? new URL(urlOrPath) : urlOrPath

  if (isIPFS.subdomain(urlOrPath)) {
    // Move CID-in-subdomain to URL pathname
    let { id, ns } = subdomainPatternMatch(url)
    id = dnsLabelToFqdn(id)
    url = new URL(`https://localhost/${ns}/${id}${url.pathname}${url.search}${url.hash}`)
  }

  // To get IPFS content path we need to reverse URI encoding of special
  // characters (https://github.com/ipfs/ipfs-companion/issues/303)
  const contentPath = decodeURI(url.pathname)

  // End if not a content path
  if (!isIPFS.path(contentPath)) return null

  // Attach suffix with query parameters or hash if explicitly asked to do so
  if (opts.keepURIParams) return `${contentPath}${url.search}${url.hash}`

  // Else, return content path as-is
  return contentPath
}
