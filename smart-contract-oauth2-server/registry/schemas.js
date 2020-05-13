const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uristring = process.env.MONGODB_URI || 'mongodb://localhost/test';

// Makes connection asynchronously. Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, function (err, res) {
    if (err) {
        console.log('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log('Succeeded connected to: ' + uristring);
    }
});

mongoose.model('OAuthKeyVault', new Schema({
    key: {
        type: String
    },
    value: Schema.Types.Mixed,
    expiresAt: {
        type: Number
    }
}));

mongoose.model('OAuthClients', new Schema({
    clientId: {
        type: String
    },
    clientSecret: {
        type: String
    },
    name: {
        type: String
    },
    scope: {
        type: String
    },
    grants: [{
        type: String
    }],
    redirectUris: [{
        type: String
    }],
    accessTokenLifetime: {
        type: Number
    },
    refreshTokenLifetime: {
        type: Number
    }
}));

mongoose.model('OAuthUsers', new Schema({
    emails: [{
        type: String
    }],
    phones: [{
        type: String
    }],
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    password: {
        type: String
    },
    username: {
        type: String
    },
    profile: {
        type: Object
    }
}));
