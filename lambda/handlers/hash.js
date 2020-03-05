const crypto = require('crypto')

/**
 * Compute a unique ID for each URL.
 *
 * To do this, take the MD5 hash of the URL, extract the first 40 bits, and 
 * then return that in Base32 representation.
 *
 * If the salt is provided, prepend that to the URL first. 
 * This resolves hash collisions.
 * 
 */
let computeId = (url, salt) => {
    if (salt) {
        url = salt + '$' + url
    }

    // For demonstration purposes MD5 is fine
    let md5 = crypto.createHash('md5')

    // Compute the MD5, and then use only the first 40 bits
    let h = md5.update(url).digest('hex').slice(0, 10)

    // Return results in Base32 (hence 40 bits, 8*5)
    return parseInt(h, 16).toString(32)
}

module.exports = {
    computeId
}
