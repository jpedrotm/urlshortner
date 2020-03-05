const { done, getUrl, setUrl } = require("./api")

const AWS = require('aws-sdk')
const AmazonDaxClient = require('amazon-dax-client')

// Store this at file level so that it is preserved between Lambda executions
var dynamodb

exports.handler = function (event, context, callback) {
    event.headers = event.headers || []
    main(event, context, callback)
}

/**
 * Main method to handle the process of an event.
 * @param event Event
 * @param context Context
 * @param callback Callback
 */
let main = (event, context, callback) => {
    // Initialize the 'dynamodb' variable if it has not already been done. This 
    // allows the initialization to be shared between Lambda runs to reduce 
    // execution time. This will be rerun if Lambda has to recycle the container 
    // or use a new instance.
    if (!dynamodb) {
        if (process.env.DAX_ENDPOINT) {
            console.log('Using DAX endpoint', process.env.DAX_ENDPOINT)
            dynamodb = new AmazonDaxClient({ endpoints: [process.env.DAX_ENDPOINT] })
        } else {
            // DDB_LOCAL can be set if using lambda-local with dynamodb-local or another local
            // testing environment
            if (process.env.DDB_LOCAL) {
                console.log('Using DynamoDB local')
                dynamodb = new AWS.DynamoDB({ endpoint: 'http://localhost:8000', region: 'ddblocal' })
            } else {
                console.log('Using DynamoDB')
                dynamodb = new AWS.DynamoDB()
            }
        }
    }

    eventHandler(event, callback)
}

/**
 * Event handler.
 * @param event Event
 * @param callback  Callback
 */
let eventHandler = (event, callback) => {
    // Depending on the HTTP method, save or return the URL
    if (event.httpMethod == 'GET') {
        return getUrl(event.pathParameters.id, callback, dynamodb)
    } else if (event.httpMethod == 'POST' && event.body) {
        return setUrl(event.body, callback, dynamodb)
    } else {
        return done(
            400,
            JSON.stringify({ error: 'Missing or invalid HTTP Method' }),
            'application/json',
            callback
        )
    }
}
