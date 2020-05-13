var OAuth2Strategy = require('passport-oauth2')
  , util = require('util')
  , Profile = require('./profile')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError
  , APIError = require('./errors/apierror');

function Strategy(options, verify) {
  options = options || {};
  console.log('Strategy', options);
  options.authorizationURL = process.env.AUTHORIZATION_URL || options.server.authorizationURL;
  options.tokenURL = process.env.AUTHORIZATION_TOKEN_URL || options.server.tokenURL;
  options.scopeSeparator = options.scope.join(',') || 'user_info:read';
  options.customHeaders = options.customHeaders || {};
  options.state = options.state || new Date().getTime();

  if (!options.customHeaders['User-Agent']) {
    options.customHeaders['User-Agent'] = options.userAgent || 'passport-koa-oauth';
  }

  OAuth2Strategy.call(this, options, verify);
  this.name = 'koa-oauth';
  this._userProfileURL = process.env.USER_PROFILE_URL || options.server.userProfileURL;
  this._oauth2.useAuthorizationHeaderforGET(true);
  
  var self = this;
  var _oauth2_getOAuthAccessToken = this._oauth2.getOAuthAccessToken;
  this._oauth2.getOAuthAccessToken = function(code, params, callback) {
    _oauth2_getOAuthAccessToken.call(self._oauth2, code, params, function(err, accessToken, refreshToken, params) {
      if (err) { return callback(err); }
      if (!accessToken) {
        return callback({
          statusCode: 400,
          data: JSON.stringify(params)
        });
      }
      callback(null, accessToken, refreshToken, params);
    });
  }
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function(accessToken, done) {
  var self = this;
  this._oauth2.get(this._userProfileURL, accessToken, function (err, body, res) {
    var json;
    
    if (err) {
      if (err.data) {
        try {
          json = JSON.parse(err.data);
        } catch (_) {}
      }
      
      if (json && json.message) {
        return done(new APIError(json.message));
      }
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }
    
    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }
    
    var profile = Profile.parse(json.result);
    profile.provider  = 'koa-oauth';
    profile._raw = body;
    profile._json = json;
    done(null, profile);
  });
}

module.exports = Strategy;
