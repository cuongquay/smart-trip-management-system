const mongoose = require('mongoose');
const schemas = require('./schemas');
const OAuthClientsModel = mongoose.model('OAuthClients');

const OAUTH2_ALLOWED_SCOPES = {
	'user_info:read': {
		'desc': 'Access to email, profile information'
	},
	'user_info:write': {
		'desc': 'Modify your user profile information'
	}
};

function getClientById(clientId) {
	return new Promise(function (resolve, reject) {
        OAuthClientsModel.findOne({
            clientId: clientId
        }, (err, data) => {
            if (!err) resolve(data);
            else reject(err);
        }).lean();
    })
}

getClientById('443a43d6-227b-4a77-a444-c9e2549767d1').then(data => {
    if (!data) {
        var newClient = new OAuthClientsModel({
			'clientId': '443a43d6-227b-4a77-a444-c9e2549767d1',
			'clientSecret': '3y5QwtLxajYeACqzAMKBWjSqV3T8Rp5s',
			'name': 'OAuth2 Server Demos',
			'scope': 'user_info:read',
			'grants': [ 'authorization_code', 'refresh_token', 'password' ],
			'redirectUris': [ process.env.REDIRECT_URI_DEMO_APP || 'http://localhost:3000/auth/oauth2/callback' ],
			'accessTokenLifetime': 7200, //not required, default is 3600,
			'refreshTokenLifetime': 3600 * 24 * 30 //not required, default is 2 weeks
		});
        newClient.save((err, data) => console.log(!err? 'Created': 'Error', data));
    } else {
        console.log(data);
    }
});

module.exports = {
	getClientById: getClientById,
	scopes: OAUTH2_ALLOWED_SCOPES
};