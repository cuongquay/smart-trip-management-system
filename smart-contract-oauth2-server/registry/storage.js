const mongoose = require('mongoose');
const schemas = require('./schemas');
const OAuthKeyVaultModel = mongoose.model('OAuthKeyVault');

module.exports = function MongoPersistentStore(options) {
    if (!(this instanceof MongoPersistentStore)) {
        return new MongoPersistentStore(options);
    }

    function isExpired(item, curTime) {
        curTime = curTime ? curTime : new Date().getTime();
        return item && item.expiresAt && item.expiresAt <= curTime;
    }

    /**
     * Remove all saved values in the store.
     * Note: use with caution.
     */
    function clear() {}

    /**
     * Retrieve an object previously stored.
     * @param {String} key - specify the key of the object to be retrieve
     * @return {Any} the object stored with the specified key
     */
    function get(key) {
        return new Promise(function (resolve, reject) {
            OAuthKeyVaultModel.findOne({
                key: key
            }, (err, data) => {
                if (!err) resolve(data.value);
                else reject(err);
            }).lean();
        })
    }
    /**
     * Remove the object specified by the key from the store.
     * @param {String} key - specify the key
     * @return {Boolean} returns true when an object with the specified key is found and deleted, and returns false otherwise
     */
    function remove(key) {
        return new Promise(function (resolve, reject) {
            OAuthKeyVaultModel.remove({
                key: key
            }, (err) => {
                if (!err) resolve({
                    key: key
                });
                else reject(err);
            });
        })
    }

    /**
     * Save an object with a specific key.  
     * Note: if the key has already been used, then original value saved with the key will be overrided by the new value.
     * @param {String} key - specify the key
     * @param {Any} value - sepcify the value to be saved
     * @return {Boolean} always returns true
     */
    function set(key, object) {
        return new Promise(function (resolve, reject) {
            OAuthKeyVaultModel.findOne({
                key: key
            }, (error, data) => {
                if (!error) {
                    if (!data) {
                        new OAuthKeyVaultModel({
                            key: key,
                            value: object.value,
                            expiresAt: object.expiresAt
                        }).save((error, data) => {
                            if (!error) {
                                resolve(data);
                            } else {
                                reject(error);
                            }
                        });
                    } else {
                        OAuthKeyVaultModel.update({
                            key: key
                        }, {
                            $set: object
                        }, {
                            multi: false
                        }, (error, data) => {
                            if (!error) {
                                resolve(data);
                            } else {
                                reject(error);
                            }
                        });
                    }
                } else {
                    reject(error);
                }
            }).lean();
        })
    }

    /**
     * Save an object with a specific key and specify when to expire the object.
     * Note: if the store instance option 'checkExpiration' is set to true, then calling this method will start the expiration checking if it's not already started. 
     * Thus, the checking procedure is deffered utils the first object with an expiration is saved.
     * @param {String} key - specify the key
     * @param {Any} value - specify the value to be saved
     * @param {Date} exp - specify a Date object indicating when to expire the object
     * @return {Boolean} always returns true
     */
    function save(key, value, exp) {
        const objValue = {
            'value': value,
            'expiresAt': exp instanceof Date ? exp.getTime() : exp
        };
        return set(key, objValue);
    }

    return {
        get: get,
        set: set,
        clear: clear,
        remove: remove,
        key: (n) => {},
        length: () => {
            return new Promise(function (resolve, reject) {
                OAuthKeyVaultModel.count({}, (err) => {
                    if (!err) resolve({
                        key: key
                    });
                    else reject(err);
                });
            })
        },
        save: save
    };
};
