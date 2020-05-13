module.exports = function (app) {
  'use strict'

  app.use('/voyages', require('./api/voyages'))
  app.use('/updateOrderStatus', require('./api/updateOrderStatus'))
}
