angular.module('bc-tripcontract')
  .controller('OfferNewTripCtrl', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {
    $scope.operation = {
      current: 'OFFER_NEW_TRIP',
      next: 'VOYAGE_ROUTE',
      action: 'Setup new route',
      name: function () {
        return ($scope.operation.action || $scope.operation.name).replace(/_/g, ' ');
      },
      nextId: function () {
        return $scope.operation.next.replace(/_/g, '-').toLowerCase();
      }
    }
    var voyageUrl = '/voyages';
    var ignoreTxnsBefore;

    if (supports_html5_storage()) {
      try {
        ignoreTxnsBefore = localStorage.getItem('ignoreTxnsBefore');
        if (ignoreTxnsBefore) {
          ignoreTxnsBefore = Date.parse(ignoreTxnsBefore);
          voyageUrl = '/voyages?notBefore=' + ignoreTxnsBefore;
        }
      } catch (err) {
        console.error('Local storage item not a date', err);
      }
    }
    $scope.getVoyageDeparture = (() => {
      if ($scope.voyages.length) {
        var voyage = $scope.voyages[$scope.selectedVoyageIndex];
        return new Date(voyage.stationStops[0].depatureTime).toLocaleTimeString();
      }
      return '--:--:-- AM';
    });
    $scope.getVoyageArrival = (() => {
      if ($scope.voyages.length) {
        var voyage = $scope.voyages[$scope.selectedVoyageIndex];
        return new Date(voyage.stationStops[1].arrivalTime).toLocaleTimeString();
      }
      return '--:--:-- AM';
    });
    $scope.getVoyageOperatedDate = (() => {
      if ($scope.voyages.length) {
        var voyage = $scope.voyages[$scope.selectedVoyageIndex];
        return new Date(voyage.stationStops[0].depatureTime).toLocaleDateString();
      }
      return '--/--/----';
    });
    $scope.selectedVoyageIndex = -1;
    $scope.onVoyageSelect = ((index) => $scope.selectedVoyageIndex = index);
    $scope.voyages = [];

    $http.get(voyageUrl).then(function (response, err) {
      if (err) {
        console.log(err);
      } else if (response.data.error) {
        console.log(response.data.error.message);
      } else {
        if (Array.isArray(response.data)) {
          $scope.voyages = response.data;
          if ($scope.voyages.length) {
            $scope.selectedVoyageIndex = 0;
          }
        }
      }
    })

    // Websockets
    var placeOrder;
    var updateOrder;
    var destroyed = false;

    function openWebSocket() {
      var webSocketURL = 'ws://' + location.host;
      let websocket = new WebSocket(webSocketURL);
      websocket.onopen = function () {
        console.log('Websocket is open');
      }

      websocket.onclose = function () {
        console.log('Websocket closed');
        if (!destroyed) {
          openWebSocket();
        }
      }

      websocket.onmessage = function (event) {
        if (ignoreTxnsBefore && new Date().getTime() < ignoreTxnsBefore) {
          return;
        }

        var message = JSON.parse(event.data);
        if (message.$class === 'org.tripcontract.network.PlaceOrderEvent') {
          handlePlaceOrderEvent(message);
        } else if (message.$class === 'org.tripcontract.network.UpdateOrderStatusEvent') {
          handleUpdateOrderEvent(message);
        }
      }
    }

    function handlePlaceOrderEvent(newOrder) {
      $scope.voyages.unshift({
        car: {
          id: newOrder.orderId,
          name: newOrder.voyageName,
          serial: 'S/N ' + generateSN(),
          colour: newOrder.vehicleDetails.colour
        },
        stationStops: {
          trim: newOrder.options.trim,
          interior: newOrder.options.interior,
          colour: newOrder.vehicleDetails.colour,
          extras: newOrder.options.extras
        },
        status: $scope.statuses[0],
        placed: Date.now()
      })
      $scope.$apply();
    }

    function handleUpdateOrderEvent(orderEvent) {
      for (var i = 0; i < $scope.voyages.length; ++i) {
        var o = $scope.voyages[i];
        if (o.car.id === orderEvent.order.orderId) {
          o.status = orderEvent.orderStatus;
          var timestamp = Date.parse(orderEvent.timestamp);
          if (orderEvent.orderStatus === $scope.statuses[1]) {
            o.manufacture = {
              chassis: timestamp,
              interior: timestamp,
              paint: timestamp
            };
          } else if (orderEvent.orderStatus === $scope.statuses[2]) {
            o.manufacture.vinIssue = timestamp;
          } else if (orderEvent.orderStatus === $scope.statuses[3]) {
            o.manufacture.vinPrinting = timestamp;
          } else if (orderEvent.orderStatus === $scope.statuses[4]) {
            o.delivery = {
              shipping: timestamp
            };
          }
        }
      }
      $scope.$apply();
    }

    openWebSocket();

    var generateVIN = function () {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }

      function s1() {
        return Math.floor(Math.random() * 10);
      }
      return s4() + s4() + s4() + s4() + s1();
    }

    var generateSN = function () {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }

      function s1() {
        return Math.floor(Math.random() * 10);
      }
      return s4() + s4() + s1() + s1() + s1();
    }

    var updateOrderStatus = function (status, count) {
      if (count === 2) {
        status.vin = generateVIN();
      }
      status.orderStatus = $scope.statuses[count];

      $http.post('updateOrderStatus', status).then(function (response, err) {
        if (err) {
          console.log(err.message);
        }
      });

    }

    $scope.nextSetup = function () {
      var delay = 50;
      $timeout(function () {
        console.log($scope.operation.current, $scope.operation.next);
      }, delay);
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