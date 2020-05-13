/**
 * Parse profile.
 *
 * @param {object|string} json
 * @return {object}
 * @access public
 */
exports.parse = function (json) {
    if ('string' == typeof json) {
        json = JSON.parse(json);
    }
    var profile = {};
    profile.id = String(json._id);
    profile.displayName = json.firstname + ' ' + json.lastname;
    profile.username = json.username;
    if (json.emails) {
        profile.emails = json.emails.map((email) => {
            return {
                value: email
            }
        })
    }
    if (json.phones) {
        profile.phones = json.phones.map((phone) => {
            return {
                value: phone
            }
        })
    }
    if (json.profile.avatar) {
        profile.photos = [{
            value: json.profile.avatar
        }];
    }
    return profile;
};
