angular.module('bc-tripcontract')

.controller('VinAssignCtrl', ['$scope', '$http', '$timeout', '$stateParams', function ($scope, $http, $timeout, $stateParams) {
  $scope.operation = {
    next: 'DRV_ASSIGN',
    action: 'Select Vehicle',
    name: function() {
      return ($scope.operation.action || $scope.operation.name).replace(/_/g, ' ');
    },
    nextId: function() {
      return $scope.operation.next.replace(/_/g, '-').toLowerCase();
    }
  }
  $scope.voyageId = $stateParams.voyageId;
  $scope.isEnterpriseOwner = ((vehicle) => {
    return "resource:org.tripcontract.network.Owner#2856" == vehicle.owner;
  });
  $scope.getCountRange = ((count, max) => {
    var input = [];
    count = max ? max - Math.ceil(count): Math.ceil(count);
    for (i=0; i< Math.ceil(count); i++) input.push(i);
    return input;
  });
  $scope.getVehicleMetaInfo = (() => {
    var vehicleId = $scope.vehicles[$scope.selectedVehicleIndex].vehicleId;
    var vehicleMetaInfo = {};
    switch (vehicleId) {
      case "0001":
        vehicleMetaInfo = {    
          "ratings": {
            "average": 3.4,
            "count": 345
          },
          "feedbacks": {
            "count": 4318
          }
        }
        break;
      default:
        vehicleMetaInfo = {    
          "ratings": {
            "average": 4.0,
            "count": 21
          },
          "feedbacks": {
            "count": 31221
          }
        }
        break;
    }
    return vehicleMetaInfo;
  });
  $scope.selectedVehicleIndex = 0;
  $scope.onVehicleSelect = ((index) => $scope.selectedVehicleIndex = index);
  $scope.vehicles = [
    {
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
  ]  
  $scope.nextSetup = function() {
    var delay = 50;
    $timeout(function() {
    }, delay);
  }

  $scope.$on('$destroy', function () {
    destroyed = true;
  });
}])

.filter('relativeDate', function() {
  return function(input, start) {
    if (input) {
      var diff = input - start;
      diff = diff / 1000
      diff = Math.round(diff);

      var result = '+' + diff +  ' secs'

      return result;
    }
  };
})

function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}