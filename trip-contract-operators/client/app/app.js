angular.module('bc-tripcontract', [
    'bc-vehicle-table',
    'ui.router',
    'ui-notification'
  ])
  .config(function ($urlRouterProvider, $stateProvider, $locationProvider, NotificationProvider) {
    'use strict';

    $locationProvider.html5Mode({
      enabled: true
    });

    $urlRouterProvider.otherwise('/operation/voyages');

    $stateProvider
      .state('operation', {
        url: '/operation/voyages',
        templateUrl: 'tripcontract/app/views/voyage/manage/offer-new-trip.html',
        controller: 'OfferNewTripCtrl'
      }).state('operation/voyage-route', {
        url: '/operation/voyage-route',
        templateUrl: 'tripcontract/app/views/voyage/route/voyage-route.html',
        controller: 'VoyageRouteCtrl'
      }).state('operation/vin-assign', {
        url: '/operation/vin-assign/:voyageId',
        templateUrl: 'tripcontract/app/views/voyage/vin-assign/vin-assign.html',
        controller: 'VinAssignCtrl'
      }).state('operation/drv-assign', {
        url: '/operation/drv-assign/:voyageId',
        templateUrl: 'tripcontract/app/views/voyage/drv-assign/drv-assign.html',
        controller: 'DrvAssignCtrl'
      }).state('operation/ready-for-sale', {
        url: '/operation/ready-for-sale',
        templateUrl: 'tripcontract/app/views/voyage/ready/ready-for-sale.html',
        controller: 'ReadyForSaleCtrl'
      }).state('onsalenow', {
        url: '/onsalenow',
        controller: 'OnSaleNowCtrl'
      });

    NotificationProvider.setOptions({
      delay: 5000,
      startTop: 10,
      startRight: 10,
      verticalSpacing: 20,
      horizontalSpacing: 20,
      positionX: 'right',
      positionY: 'bottom'
    });
  })

  .controller('AppCtrl', [function () {
    'use strict';
  }]);