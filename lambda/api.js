const { computeId } = require('./handlers/hash')

/**
 * Get URLs the database given the id.
 * @param id Id of the url
 * @param callback Callback
 */
let getUrl = (id, callback, dynamodb) => {
    const params = {
        TableName: process.env.DDB_TABLE,
        Key: { id: { S: id } }
    }

    console.log('Fetching URL for', id)
    dynamodb.getItem(params, (err, data) => {
        if (err) {
            console.error('getItem error:', err)
            return done(500, JSON.stringify({ error: 'Internal Server Error: ' + err }), 'application/json', callback)
        }

        if (data && data.Item && data.Item.target) {
            let url = data.Item.target.S
            return done(301, url, 'text/plain', callback, { Location: url })
        } else {
            return done(404, '404 Not Found', 'text/plain', callback)
        }
    })
}

// Save the URLs to the database
/**
 * Store URLs in the database and return Id.
 * @param url Url
 * @param callback Callback
 * @param salt Salt
 */
let setUrl = (url, callback, dynamodb, salt) => {
    let id = computeId(url, salt)

    const params = {
        TableName: process.env.DDB_TABLE,
        Item: {
            id: { S: id },
            target: { S: url }
        },
        // Ensure that puts are idempotent
        ConditionExpression: "attribute_not_exists(id) OR target = :url",
        ExpressionAttributeValues: {
            ":url": { S: url }
        }
    }

    dynamodb.putItem(params, (err, data) => {
        if (err) {
            if (err.code === 'ConditionalCheckFailedException') {
                console.warn('Collision on ' + id + ' for ' + url + '; retrying...')
                // Retry with the attempted ID as the salt.
                // Eventually, there will not be a collision.
                return setUrl(url, callback, dynamodb, id)
            } else {
                console.error('Dynamo error on save: ', err)
                return done(
                    500,
                    JSON.stringify({ error: 'Internal Server Error: ' + err }),
                    'application/json',
                    callback
                )
            }
        } else {
            return done(
                200,
                id,
                'text/plain',
                callback
            )
        }
    })
}

/**
 * Treats final response
 * @param statusCode Response status code 
 * @param body Response body
 * @param contentType Headers content type
 * @param callback Callback
 * @param headers Responde headers
 */
let done = (statusCode, body, contentType, callback, headers) => {
    full_headers = {
        'Content-Type': contentType
    }

    if (headers) {
        full_headers = Object.assign(full_headers, headers)
    }

    callback(null, {
        statusCode: statusCode,
        body: body,
        headers: full_headers,
        isBase64Encoded: false,
    })
}

module.exports = {
    done,
    getUrl,
    setUrl
}
