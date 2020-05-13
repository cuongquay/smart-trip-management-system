angular.module('bc-tripcontract')

.directive('bcManActionTile', [function () {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'tripcontract/app/directives/action-tile/action-tile.html',
		scope: {
			title : '=',
			description : '=',
			action : '='
		}
	};
}]);
