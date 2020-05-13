'use strict';
var request = require('request')
var config = require('config');


/**
 * Get voyage object by client id.
 *
 * id string The voyage id of a voyage object.
 * returns ErrorResponse
 **/
exports.getVoyageById = (req, res) => {
  var id = req.swagger.params['id'].value;
  var restServerConfig = req.app.get('config').restServer;
  var composerBaseURL = restServerConfig.httpURL;
  var serviceEndpoint = composerBaseURL + '/voyages';

  var filter = {};
  var notBefore = req.query.notBefore;
  if(notBefore) {
    var date = new Date();
    date.setTime(notBefore);
    filter = {
      "where": {
        "timestamp": {
          "gt": date.toISOString()
        }
      }
    }
  }
  return new Promise((resolve, reject) => {
    request.get({
      url: `${serviceEndpoint}?filter=${JSON.stringify(filter)}`,
      json: true
    }, (err, response, data) => {
      if (err) {
        reject(err.message);
        return;
      } else {
        resolve(data);
      }
    })
  })
}


/**
 * Update voyage object by client id.
 *
 * id string The voyage id of a voyage object.
 * body object The object contains voyage request. (optional)
 * returns ErrorResponse
 **/
exports.updateVoyageById = (req, res) => {
  var id = req.swagger.params['id'].value;
  var restServerConfig = req.app.get('config').restServer;
  var composerBaseURL = restServerConfig.httpURL;
  var serviceEndpoint = composerBaseURL + '/voyages';

  var filter = {};
  var notBefore = req.query.notBefore;
  if(notBefore) {
    var date = new Date();
    date.setTime(notBefore);
    filter = {
      "where": {
        "timestamp": {
          "gt": date.toISOString()
        }
      }
    }
  }
  return new Promise((resolve, reject) => {
    request.put({
      url: `${serviceEndpoint}?filter=${JSON.stringify(filter)}`,
      json: true
    }, (err, response, data) => {
      if (err) {
        reject(err.message);
        return;
      } else {
        resolve(data);
      }
    })
  })
}


/**
 * Delete the voyage object by client id. All the voyages will be deleted forever.
 *
 * id string The client id of a voyage object.
 * returns ErrorResponse
 **/
exports.deleteVoyagesById = (req, res) => {
  var id = req.swagger.params['id'].value;
  var restServerConfig = req.app.get('config').restServer;
  var composerBaseURL = restServerConfig.httpURL;
  var serviceEndpoint = composerBaseURL + '/voyages';

  var filter = {};
  var notBefore = req.query.notBefore;
  if(notBefore) {
    var date = new Date();
    date.setTime(notBefore);
    filter = {
      "where": {
        "timestamp": {
          "gt": date.toISOString()
        }
      }
    }
  }
  return new Promise((resolve, reject) => {
    request.delete({
      url: `${serviceEndpoint}?filter=${JSON.stringify(filter)}`,
      json: true
    }, (err, response, data) => {
      if (err) {
        reject(err.message);
        return;
      } else {
        resolve(data);
      }
    })
  })
}


/**
 * Get voyages object by client id.
 *
 * name string The voyage name of a voyage object.
 * returns ErrorResponse
 **/
exports.getVoyages = (req, res) => {
  var name = req.query['name'];
  var restServerConfig = req.app.get('config').restServer;
  var composerBaseURL = restServerConfig.httpURL;
  var serviceEndpoint = composerBaseURL + '/voyages';

  var filter = {};
  var notBefore = req.query.notBefore;
  if(notBefore) {
    var date = new Date();
    date.setTime(notBefore);
    filter = {
      "where": {
        "timestamp": {
          "gt": date.toISOString()
        }
      }
    }
  }
  return new Promise((resolve, reject) => {
    request.get({
      url: `${serviceEndpoint}?filter=${JSON.stringify(filter)}`,
      json: true
    }, (err, response, data) => {
      if (err) {
        reject(err.message);
        return;
      } else {
        resolve(data);
      }
    })
  })
}


/**
 * Create voyage object bases on voyage id.
 *
 * body object The object contains voyage request.
 * returns ErrorResponse
 **/
exports.createVoyages = (req, res) => {
  var restServerConfig = req.app.get('config').restServer;
  var composerBaseURL = restServerConfig.httpURL;
  var serviceEndpoint = composerBaseURL + '/voyages';

  var filter = {};
  var notBefore = req.query.notBefore;
  if(notBefore) {
    var date = new Date();
    date.setTime(notBefore);
    filter = {
      "where": {
        "timestamp": {
          "gt": date.toISOString()
        }
      }
    }
  }
  return new Promise((resolve, reject) => {
    request.post({
      url: `${serviceEndpoint}?filter=${JSON.stringify(filter)}`,
      json: true
    }, (err, response, data) => {
      if (err) {
        reject(err.message);
        return;
      } else {
        resolve(data);
      }
    })
  })
}

