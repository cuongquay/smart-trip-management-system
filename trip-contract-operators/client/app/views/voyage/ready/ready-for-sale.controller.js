angular.module('bc-tripcontract')

.controller('ReadyForSaleCtrl', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {
  $scope.operation = {
    next: 'OFFER NEW TRIP',
    name: function() {
      return $scope.operation.next.replace(/_/g, ' ');
    },
    nextId: function() {
      return $scope.operation.next.replace(/_/g, '-').toLowerCase();
    }
  }
  
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