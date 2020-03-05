const lambdaLocal = require('lambda-local');
 
var jsonPayload = {
    'key': 1,
    'another_key': "Some text"
}
 
lambdaLocal.execute({
    event: jsonPayload,
    lambdaPath: 'lambda/index.js',
    profilePath: '~/.aws/credentials',
    profileName: 'default',
    timeoutMs: 3000
}).then(function(done) {
    console.log(done);
}).catch(function(err) {
    console.log(err);
});