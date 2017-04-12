'use strict';

angular.module('myApp.freedom', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/freedom', {
    templateUrl: 'freedomView/view.html',
    controller: 'FreedomViewCtrl'
  });
}])

.controller('FreedomViewCtrl', [function() {

}]);