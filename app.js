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
    $mdThemingProvider.theme('default')
        .primaryPalette('light-green', {
            default: '500'
        })
        .accentPalette('grey', {
            default: '500'
        })
        .backgroundPalette('lime', {
            default: '50'
        });
})
.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({
        redirectTo: '/start'
    });
}])
.run(['$rootScope', '$location', '$routeParams', function($rootScope, $location, $routeParams) {
    $rootScope.$on('$routeChangeSuccess', function(e, current, pre) {
        // Update the navbar link.
        $rootScope.currentNavItem = $location.path().split('/')[1];
    });
}])
// Top level controller.
.controller('AppCtrl', function($scope) {
    // Empty for now.
});