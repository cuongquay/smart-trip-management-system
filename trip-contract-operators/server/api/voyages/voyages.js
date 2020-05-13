var request = require('request')
var config = require('config');

var get = (req, res) => {

  var restServerConfig = req.app.get('config').restServer;
  var composerBaseURL = restServerConfig.httpURL;
  var offerVoyageEndpoint = composerBaseURL + '/Voyage';

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

  var updateVoyageEndpoint = composerBaseURL + '/UpdateVoyageStatus'

  request.get({
    url: `${offerVoyageEndpoint}?filter=${JSON.stringify(filter)}`,
    json: true
  }, (err, response, offeredVoyages) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    request.get({
      url: `${updateVoyageEndpoint}?filter=${JSON.stringify(filter)}`,
      json: true
    }, (err, response, updates) => {
      if (Array.isArray(offeredVoyages) && Array.isArray(updates)) {
        offeredVoyages.forEach((order) => {
            order.statusUpdates = [];
            for (var i = updates.length - 1; i >= 0; i--) {
              var update = updates[i];
              var updatingId;
              if (typeof update.order === 'string') {
                updatingId = update.order.replace('resource:org.tripcontract.network.Order#', '');
              } else if (typeof update.order === 'object') {
                // order has been resolved
                updatingId = update.order.orderId;
              }

              if (updatingId === order.orderId) {
                order.statusUpdates.push(update);
                updates.splice(i, 1);
              }
            }
            if (order.statusUpdates.length === 0) {
              delete order.statusUpdates;
            }
        });
        res.send(offeredVoyages)
      } else {
        res.status(500).send('Response from rest server was not in format expected.')
      }
    });
  })
}

var post = (req, res) => {
  var restServerConfig = req.app.get('config').restServer;
  var composerBaseURL = restServerConfig.httpURL;
  var offerVoyageEndpoint = composerBaseURL + '/OfferVoyage';
  request.post({
    url: `${offerVoyageEndpoint}`,
    json: req.body
  }, (err, response, data) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.send({
      voyageId: data.voyageId,
      transactionId: data.transactionId
    })
  })
}

module.exports = {
  get: get,
  post: post
}
