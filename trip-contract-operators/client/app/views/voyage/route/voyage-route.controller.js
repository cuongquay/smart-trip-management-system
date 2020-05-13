angular.module('bc-tripcontract')
  .controller('VoyageRouteCtrl', ['$scope', '$http', '$timeout', '$window', function ($scope, $http, $timeout, $window) {
    $scope.user = {
      id: '1307'
    };
    $scope.loading = false;
    $scope.operation = {
      next: 'VIN_ASSIGN',
      action: 'Create A Trip',
      name: function () {
        return ($scope.operation.action || $scope.operation.name).replace(/_/g, ' ');
      },
      nextId: function () {
        return $scope.operation.next.replace(/_/g, '-').toLowerCase();
      }
    }
    String.prototype.getShortTime = function () {
      return new Date(this).toTimeString().substr(0, 8);
    }
    $scope.timetable = [
      {value: '05:00'},{value: '05:30'},{value: '06:00'},{value: '06:30'},{value: '07:00'},{value: '07:45'},{value: '08:00'},{value: '08:30'},
      {value: '09:00'},{value: '09:30'},{value: '10:00'},{value: '10:30'},{value: '11:00'},{value: '11:30'},{value: '12:00'},{value: '12:30'},
      {value: '13:00'},{value: '13:30'},{value: '14:00'},{value: '14:30'},{value: '15:00'},{value: '15:30'},{value: '16:00'},{value: '16:30'},
      {value: '17:00'},{value: '17:30'},{value: '18:00'},{value: '18:30'},{value: '19:00'},{value: '19:30'},{value: '20:00'},{value: '20:30'}
    ];
    $scope.datetable = [
      {value: 'today'},{value: 'today+1'},{value: 'today+2'},{value: 'today+3'},{value: 'today+4'}
    ]
    $scope.selectedRouteIndex = 0;
    $scope.selectedTimeIndex = 0;
    $scope.selectedDateIndex = 0;
    $scope.onRouteSelect = ((index) => $scope.selectedRouteIndex = index);
    $scope.onTimeSelect = ((index) => $scope.selectedTimeIndex = index);
    $scope.onDateSelect = ((index) => $scope.selectedDateIndex = index);
    $scope.getVoyageTime = ((time, mins) => {
      var timeArray = time.split(':');
      var estimatedDate = new Date();
      estimatedDate.setHours(timeArray[0]);
      estimatedDate.setMinutes(timeArray[1] + mins);
      estimatedDate.setSeconds(0);
      return estimatedDate.toLocaleTimeString();
    });
    $scope.getVoyageDate = ((date) => {
      var dateArray = date.split('+');
      var estimatedDate = new Date();
      var advanceDate = dateArray.length >1 ? parseInt(dateArray[1]):0; 
      estimatedDate.setDate(estimatedDate.getDate() + advanceDate);
      estimatedDate.setHours(0);
      estimatedDate.setMinutes(0);
      estimatedDate.setSeconds(0);
      return estimatedDate.toLocaleDateString();
    });
    $scope.getVoyageDateTime = ((date, time, mins) => {
      var dateArray = date.split('+');
      var timeArray = time.split(':');
      var estimatedDate = new Date();
      var advanceDate = dateArray.length >1 ? parseInt(dateArray[1]):0; 
      estimatedDate.setDate(estimatedDate.getDate() + advanceDate);
      estimatedDate.setHours(timeArray[0]);
      estimatedDate.setMinutes(timeArray[1] + mins);
      estimatedDate.setSeconds(0);
      return estimatedDate.toISOString();
    });
    $scope.routes = []

    $scope.nextSetup = function () {
      var newVoyage = $scope.routes[$scope.selectedRouteIndex];
      var depatureTime = $scope.getVoyageDateTime($scope.datetable[$scope.selectedDateIndex].value, $scope.timetable[$scope.selectedTimeIndex].value, 0);
      var arrivalTime = $scope.getVoyageDateTime($scope.datetable[$scope.selectedDateIndex].value, $scope.timetable[$scope.selectedTimeIndex].value, 90);
      newVoyage.voyageId = new Date().getTime();
      newVoyage.stationStops[0].depatureTime = depatureTime;
      newVoyage.stationStops[0].arrivalTime = depatureTime;
      newVoyage.stationStops[1].depatureTime = arrivalTime;
      newVoyage.stationStops[1].arrivalTime = arrivalTime;
      newVoyage.operator = "resource:org.tripcontract.network.Operator#" + $scope.user.id;
      if (!$scope.loading) {
        $scope.loading = true;
        $http.post('/voyages', newVoyage).then(function(response, err) {
          if(err) {
            console.log(err.message);
          } else {
            $window.location.href = "/operation/" + $scope.operation.nextId() + "/" + response.data.voyageId;
          }
          $scope.loading = false;
        });
      }
    }

    $scope.$on('$destroy', function () {
      destroyed = true;
    });
  }])

  .filter('relativeDate', function () {
    return function (input, start) {
      if (input) {
        var diff = input - start;
        diff = diff / 1000
        diff = Math.round(diff);

        var result = '+' + diff + ' secs'

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