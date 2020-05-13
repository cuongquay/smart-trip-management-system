'use strict';

/**
 * Module dependencies.
 */

var InvalidArgumentError = require('oauth2-server/lib/errors/invalid-argument-error');
var NodeOAuthServer = require('oauth2-server');
var Request = require('oauth2-server').Request;
var Response = require('oauth2-server').Response;
var UnauthorizedRequestError = require('oauth2-server/lib/errors/unauthorized-request-error');

/**
 * Constructor.
 */

function KoaOAuthServer(options) {
	options = options || {};

	if (!options.model) {
		throw new InvalidArgumentError('Missing parameter: `model`');
	}

	this.useErrorHandler = options.useErrorHandler ? true : false;
	delete options.useErrorHandler;

	this.continueMiddleware = options.continueMiddleware ? true : false;
	delete options.continueMiddleware;

	this.server = new NodeOAuthServer(options);
}

/**
 * Authentication Middleware.
 *
 * Returns a middleware that will validate a token.
 *
 * (See: https://tools.ietf.org/html/rfc6749#section-7)
 */

KoaOAuthServer.prototype.authenticate = function(options) {
	var that = this;

	return async function(ctx, next) {
		var request = new Request(ctx.request);
		var response = new Response(ctx.response);
		var token;

		try{
			token = await that.server.authenticate(request, response, options);
			ctx.state.oauth = { token: token };
		}catch(e){
			await handleError.call(that, e, ctx, null, next);
			return;
		}

		await next();
	};
};

/**
 * Authorization Middleware.
 *
 * Returns a middleware that will authorize a client to request tokens.
 *
 * (See: https://tools.ietf.org/html/rfc6749#section-3.1)
 */

KoaOAuthServer.prototype.authorize = function(options) {
	var that = this;

	return async function(ctx, next){
		var request = new Request(ctx.request);
		var response = new Response(ctx.request);
		var code;

		try{
			code = await that.server.authorize(request, response, options);
			ctx.state.oauth = { code: code };
		}catch(e){
			await handleError.call(that, e, ctx, response, next);
			return;
		}

		if(that.continueMiddleware){
			await next();
		}

		await handleResponse.call(that, ctx, response);
	};
};

/**
 * Grant Middleware.
 *
 * Returns middleware that will grant tokens to valid requests.
 *
 * (See: https://tools.ietf.org/html/rfc6749#section-3.2)
 */

KoaOAuthServer.prototype.token = function(options) {
	var that = this;

	return async function(ctx, next){
		var request = new Request(ctx.request);
		var response = new Response(ctx.response);
		var token;

		try{
			token = await that.server.token(request, response, options);
			ctx.state.oauth = { token: token };
		}catch(e){
			await handleError.call(that, e, ctx, response, next);
			return;
		}

		if(that.continueMiddleware){
			await next();
		}

		await handleResponse.call(that, ctx, response);
	};
};

/**
 * Handle response.
 */
var handleResponse = async function(ctx, response) {
	if (response.status === 302) {
		var location = response.headers.location;
		delete response.headers.location;
		ctx.set(response.headers);
		ctx.redirect(location);
	} else {
		ctx.set(response.headers);
		ctx.status = response.status;
		ctx.body = response.body;
	}
};

/**
 * Handle error.
 */

var handleError = async function(e, ctx, response, next) {
	if (this.useErrorHandler === true) {
		ctx.state.oauth = { error: e };
		await next();
	} else {
		if (response) {
			ctx.set(response.headers);
		}

		ctx.status = e.code;

		if (e instanceof UnauthorizedRequestError) {
			ctx.body = "";
			return;
		}

		ctx.body = { error: e.name, error_description: e.message };
	}
};

/**
 * Export constructor.
 */

module.exports = KoaOAuthServer;