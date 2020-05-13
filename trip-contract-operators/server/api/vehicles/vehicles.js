var request = require('request')
var config = require('config');

var get = (req, res) => {
  res.send([{
      "$class": "org.tripcontract.network.Vehicle",
      "vehicleId": "0001",
      "costPerDistanceUnit": 5000,
      "costUnit": "₫",
      "distanceUnit": "km",
      "withDriver": true,
      "maxCapacityPersons": 9,
      "vehicleStatus": "AVAILABLE",
      "vehicleType": "Bus",
      "vehicleDetails": {
        "$class": "org.tripcontract.network.VehicleDetails",
        "cabinSeats": [],
        "modelType": "DCAR Limousine",
        "plateNumber": "29E - 301.12",
        "surfaceColour": "Orange Black",
        "manufacture": "Mercedes",
        "id": "000111"
      },
      "owner": "resource:org.tripcontract.network.Owner#2856"
    },
    {
      "$class": "org.tripcontract.network.Vehicle",
      "vehicleId": "0002",
      "costPerDistanceUnit": 12000,
      "costUnit": "₫",
      "distanceUnit": "km",
      "maxCapacityPersons": 4,
      "vehicleStatus": "AVAILABLE",
      "vehicleType": "Car",
      "ratings": {
        "average": 0.0,
        "count": 0
      },
      "vehicleDetails": {
        "$class": "org.tripcontract.network.VehicleDetails",
        "cabinSeats": [],
        "modelType": "C250 Exclusive",
        "plateNumber": "30E - 191.56",
        "surfaceColour": "Orange Black",
        "manufacture": "Mercedes",
        "id": "000111"
      },
      "owner": "resource:org.tripcontract.network.Owner#2156",
      "driver": "resource:org.tripcontract.network.Driver#2156"
    }
  ]);
}

var post = (req, res) => {
  res.status(500).send({
    error: "Not implemented yet!"
  });
}

module.exports = {
  get: get,
  post: post
}