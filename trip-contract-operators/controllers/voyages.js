'use strict';

var utils = require('../utils/writer.js');
var voyages = require('../services/voyages');

module.exports.getVoyageById = ((req, res, next) => {
  voyages.getVoyageById(req, res)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
})

module.exports.updateVoyageById = ((req, res, next) => {
  voyages.updateVoyageById(req, res)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
})

module.exports.deleteVoyagesById = ((req, res, next) => {
  voyages.deleteVoyagesById(req, res)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
})

module.exports.getVoyages = ((req, res, next) => {
  voyages.getVoyages(req, res)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
})

module.exports.createVoyages = ((req, res, next) => {
  voyages.createVoyages(req, res)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
})
