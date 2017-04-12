'use strict';

angular.module('myApp.start', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/start', {
    templateUrl: 'startView/view.html',
    controller: 'StartCtrl'
  });
}])

.controller('StartCtrl', function($scope) {
    $scope.builtWith = [{
        name: 'Angular.JS',
        desc: 'Fulfills the hipster quota.'
    },
    {
        name: 'GoLang',
        desc: 'Handles the hosting.'
    }];

    $scope.sensibleModel = false;

    $scope.isThisSensible = function () {
        $scope.sensibleModel = !$scope.sensibleModel;
        $scope.sensible = ($scope.sensibleModel) ? "No, of course not." : '';
    };

});