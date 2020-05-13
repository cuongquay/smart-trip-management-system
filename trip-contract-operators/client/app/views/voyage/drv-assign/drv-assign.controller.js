angular.module('bc-tripcontract')

.controller('DrvAssignCtrl', ['$scope', '$http', '$timeout', '$stateParams', function ($scope, $http, $timeout, $stateParams) {
  $scope.operation = {
    next: 'READY_FOR_SALE',
    action: 'Setect Driver',
    name: function() {
      return ($scope.operation.action || $scope.operation.name).replace(/_/g, ' ');
    },
    nextId: function() {
      return $scope.operation.next.replace(/_/g, '-').toLowerCase();
    }
  }
  $scope.voyageId = $stateParams.voyageId;
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