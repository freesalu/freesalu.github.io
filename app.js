'use strict';

// Include underscore as a factory.
var underscore = angular.module('underscore', []);
underscore.factory('_', ['$window', function($window) {
  return $window._; // assumes underscore has already been loaded on the page
}]);

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngMaterial',
  'underscore',
  'ngRoute',
  'myApp.start',
  'myApp.life',
  'myApp.freedom',
  'myApp.version'
])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('light-blue')
    .primaryPalette('pink')
    .accentPalette('orange');
})
.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/start'});
}]);

