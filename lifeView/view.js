'use strict';

angular.module('myApp.life', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/life', {
    templateUrl: 'lifeView/view.html',
    controller: 'LifeCtrl'
  });
}])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('light-blue')
    .primaryPalette('pink')
    .accentPalette('orange');
})
.factory('game', ['$timeout', function($timeout) {
    return new GameOfLife($timeout);
}])
.controller('LifeCtrl', ['$scope', '$timeout', '$mdSidenav', 'game', function($scope, $timeout, $mdSidenav, game) {
    $scope.toggleLeft = buildToggler('left');
    $scope.toggleRight = buildToggler('right');

    function buildToggler(componentId) {
      return function() {
        $mdSidenav(componentId).toggle();
      };
    }

    // View controllers.
    var initialZoom = 0.8;
    $scope.zoom = initialZoom;
    $scope.changeZoom = function (amount) {
        this.zoom += amount;
        updateGameCenter();
        draw();
    } 
    $scope.rotX = 0;
    $scope.rotY = 0;
    $scope.rotZ = 0;



    /* Update rotation and re-draw. Very expensive to redraw all the time. 
    TODO Keep a running tab on rotation and redraw every once in a while.
    */
    $scope.changeRotation = function (rx, ry, rz) {
        $scope.rotX += rx;
        $scope.rotY += ry;
        $scope.rotZ += rz;
        updateGameCenter();
        if (!game.running) draw();     
    }

    /* Resetting is good sometimes. */
    $scope.resetTransforms = function () {
        $scope.rotX = 0;
        $scope.rotY = 0;
        $scope.rotZ = 0;
        $scope.zoom = initialZoom;
        updateGameCenter();
        if (!game.running) draw();  

    }

    var angularSpeed = 0.1;

    /* Mouse listeners on our canvas. */
    var mouseState = {};
    $scope.mouseMove = function ($event) {
        // Disable for now.
        return;
        // Left click drag means rotate.
        if ($event.which == 1) {
            // $event.movementX/Y => -1, 0, 1

            /* How do we rotate?

             Isomer grid:
                 z 
              x \|/ y
             => 
             left, right => rotZ
             up,down + left => rotZ + rotX
             up,down + right => rotZ + rotY
             up,down => 1/2 ( rotX + rotY )
             */
             console.log($event);

            // Just do a very simple constant rotation based on direction.
            var dx = Math.sign($event.movementX),
                dy = Math.sign($event.movementY),
                rx = 0,
                ry = 0,
                rz = 0;
            if (Math.abs(dy) > 0) {
                if (dx == 0) {
                } else if (dx < 0) {
                    rx = dy;
                } else {
                    ry = dy;
                }
            } else {
                rz = dx;
            }
            $scope.changeRotation(angularSpeed * rx, angularSpeed * ry,  angularSpeed * rz);
            
        } else if ($event.which == 2) {
            // Scroller clicked and move.
            console.log(2)
        }
    }
    $scope.resetMouseState = function ($event) {
        mouseState = {};
    }

    // Logic handler.
    $scope.gol = game;

    $scope.generateBoard = function () {
        $scope.gol.generate();
        draw();
    }
    // Visuals using Isomer.
    var canvas = document.getElementById('canvas');
    var iso = new Isomer(canvas);
    
    var Point = Isomer.Point;
    var Shape = Isomer.Shape;
    var Color = Isomer.Color;

    // Center of the cube encompassing all the cells.
    var gameCenter = new Point();
    /* The center moves due to scaling, so we need to recalculate when zoom changes. */
    function updateGameCenter() {
        gameCenter = (new Point(game.width / 2, game.height / 2, game.depth / 2))
            .scale(Point.ORIGIN, $scope.zoom, $scope.zoom, $scope.zoom);
    }
    updateGameCenter();

    // Start with something.
    $scope.generateBoard();


    /* Apply the scaling and rotation that the user has set.  
    */
    function applyViewTransforms(isoObj) {
        return isoObj
            .scale(Point.ORIGIN, $scope.zoom, $scope.zoom, $scope.zoom)
            .rotateX(gameCenter, $scope.rotX)
            .rotateY(gameCenter, $scope.rotY)
            .rotateZ(gameCenter, $scope.rotZ);
    } 

    function draw() {
        var aliveShapes = [];
        // Reset context transforms before clearing.
        iso.canvas.clear();
        _.map(game.board, function (cell) {
            if (cell.alive) {
                aliveShapes.push(
                    applyViewTransforms(
                        Shape.Prism(new Point(cell.x, cell.y, cell.z))
                    )
                );
            }
        });
        iso.add(aliveShapes, new Color(200, 200, 200));
    }

    /* Keep drawing! */
    function drawLoop() {
        if (game.running) draw();
        // Loop using RAF.
        requestAnimationFrame(drawLoop); 
    }
    drawLoop()
}])