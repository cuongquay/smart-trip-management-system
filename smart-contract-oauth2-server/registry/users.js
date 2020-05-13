const mongoose = require('mongoose');
const schemas = require('./schemas');
const OAuthUsersModel = mongoose.model('OAuthUsers');

function findUserByUserName(username) {
    return new Promise(function (resolve, reject) {
        OAuthUsersModel.findOne({
            username: username
        }, (err, data) => {
            if (!err) resolve(data);
            else reject(err);
        }).lean();
    })
}

function updateUserByUserName(username, userdata) {
    return new Promise(function (resolve, reject) {
        OAuthUsersModel.update({
            username: username
        }, {
            $set: userdata
        }, {
            multi: false
        }, (error, data) => {
            if (!error) {
                resolve(data);
            } else {
                reject(error);
            }
        });
    })
}

function createUserWithData(userdata) {
    return new Promise(function (resolve, reject) {
        new OAuthUsersModel(userdata).save((error, data) => {
            if (!error) {
                resolve(data);
            } else {
                reject(error);
            }
        });
    })
}

/* Setup default user */
findUserByUserName('demo').then(data => {
    if (!data) {
        var newUser = new OAuthUsersModel({
            username: 'demo',
            password: 'test',
            firstname: 'Demo',
            lastname: 'User',
            emails: ['demo@gmail.com'],
            phones: [],
            profile: {
                avatar: 'https://'
            }
        });
        newUser.save((err, data) => console.log(!err? 'Created': 'Error', data));
    } else {
        console.log(data);
    }
});

/**
 * Using mongodb for OAuth2Users
 */
module.exports = {
    get: findUserByUserName,
    set: updateUserByUserName,
    new: createUserWithData
};
