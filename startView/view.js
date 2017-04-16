'use strict';

angular.module('myApp.start', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/start', {
        templateUrl: 'startView/view.html',
        controller: 'StartCtrl'
    });
}])
.controller('StartCtrl', ['$scope', function($scope) {
    $scope.builtWith = [{
        name: 'Angular',
        desc: 'Fulfills the hipster quota (and Angular Material for an easier life.)',
        iconLink: "https://angular.io/resources/images/logos/angular/angular.svg",
        link: "https://angularjs.org"
    }, {
        name: "Node/NPM",
        desc: 'Packaging and development server.',
        iconLink: 'https://github.com/npm/logos/raw/master/%22npm%22%20lockup/npm-logo-simplifed-with-white-space.png',
        link: 'https://github.com/npm/'
    }, {
        name: 'Bower',
        desc: 'UI package management',
        iconLink: 'https://bower.io/img/bower-logo.svg',
        link: 'https://bower.io'

    }, {
        name: 'Isomer',
        desc: 'Nice way to play around with simple isometric graphics!',
        iconLink: 'https://kenoleon.github.io/Front-End-Web-Dev-UI-UX/assets/images/Isomerjs.jpg',
        link: 'https://github.com/jdan/isomer'
    }];
}]);