var request = require('request')
var config = require('config');

var get = (req, res) => {
  res.send([{
      "$class": "org.tripcontract.network.OfferVoyage",
      voyageType: "Bus",
      voyageName: "Hà Nội - Nam Định",
      voyageDesc: "Xe chất lượng cao Limousine liên tỉnh (X.E Vietnam)",
      costPerPerson: 100000,
      costUnit: '₫',
      stationStops: [{
        "$class": "org.tripcontract.network.StationStop",
        stopStatus: 'RESERVED',
        stationId: "HN01",
        stationAddress: "Siêu Thị Trần Anh, Mỗ Lao, Hà Đông, Hà Nội",
        stationName: "Big C - Hà Đông"
      }, {
        "$class": "org.tripcontract.network.StationStop",
        stopStatus: 'RESERVED',
        stationId: "ND01",
        stationAddress: "Số 85 đường Trần Anh Tông (phường Lộc Vượng, TP. Nam Định) ",
        stationName: "Big C - Nam Định"
      }],
      operator: "resource:org.tripcontract.network.Operator#OPERATOR_ID"
    },
    {
      "$class": "org.tripcontract.network.OfferVoyage",
      voyageType: "Train",
      voyageName: "Hà Nội - Ninh Bình",
      voyageDesc: "Xe chất lượng cao Limousine liên tỉnh (X.E Vietnam)",
      costPerPerson: 145000,
      costUnit: '₫',
      stationStops: [{
        "$class": "org.tripcontract.network.StationStop",
        stopStatus: 'RESERVED',
        stationId: "HN01",
        stationAddress: "Siêu Thị Trần Anh, Mỗ Lao, Hà Đông, Hà Nội",
        stationName: "Big C - Hà Đông"
      }, {
        "$class": "org.tripcontract.network.StationStop",
        stopStatus: 'RESERVED',
        stationId: "NB01",
        stationAddress: "Quốc Lộ 1, Km150, Ninh Bình",
        stationName: "Siêu thị Trần Anh - Ninh Bình"
      }],
      operator: "resource:org.tripcontract.network.Operator#OPERATOR_ID"
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