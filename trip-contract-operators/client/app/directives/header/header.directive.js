angular.module('bc-tripcontract')

.directive('bcManHeader', [function () {
	return {
		restrict: 'E',
		templateUrl: 'tripcontract/app/directives/header/header.html',
		link: function (scope, element, attrs) {

		}
	};
}])