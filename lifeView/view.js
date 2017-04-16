'use strict';

angular.module('myApp.life', ['ngRoute'])
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/life', {
        templateUrl: 'lifeView/view.html',
        controller: 'LifeCtrl'
    });
}])
.factory('game', ['$timeout', function($timeout) {
    return new GameOfLife($timeout);
}])
.controller('LifeCtrl', ['$scope', '$timeout', '$mdSidenav', 'game', function($scope, $timeout, $mdSidenav, game) {

    var canvas = document.getElementById('canvas');

    // Logic handler.
    $scope.gol = game;
    var mouseState = {isRotating: false, rx: 0, ry: 0, rz: 0};

    // Visuals using Isomer.
    var iso = new Isomer(canvas);

    var Point = Isomer.Point;
    var Shape = Isomer.Shape;
    var Color = Isomer.Color;
    var Path = Isomer.Path;

    // Center of the cube encompassing all the cells.
    var gameCenter = new Point();

    $scope.rotX = 0;
    $scope.rotY = 0;
    $scope.rotZ = 0;

    $scope.transX = 0;
    $scope.transY = 0;
    $scope.transZ = 0;

    var initialZoom = 0.6;
    $scope.zoom = initialZoom;

    $scope.toggleLeft = buildToggler('left');

    // Used for resizing the canvas.
    // FIXME We shouldn't have to know what the DOM is here.
    var navbarHeight = document.getElementById('indexNavbar').firstChild.clientHeight;

    // Side bar for generating new worlds.
    function buildToggler(componentId) {
        return function() {
            $mdSidenav(componentId).toggle();
        };
    }

    $scope.changeZoom = function(amount) {
        this.zoom += amount;
        updateGameCenter();
        draw();
    }

    $scope.changeTranslation = function(tx, ty, tz) {
        $scope.transX += tx;
        $scope.transY += ty;
        $scope.transZ += tz;
        updateGameCenter();
        if (!game.running) draw();
    }

    function rotateLoop() {
        if (!mouseState.isRotating) return;
        $timeout(function () {
            $scope.changeRotation(mouseState.rx, mouseState.ry, mouseState.rz);
            rotateLoop();
        }, 100)
    }

    /* Start rotating continuously until stopped. */
    $scope.startRotating = function (rx, ry, rz) {
        mouseState.isRotating = true;
        mouseState.rx = rx;
        mouseState.ry = ry;
        mouseState.rz = rz;
        rotateLoop();
    }

    /* Update rotation and re-draw. Very expensive to redraw all the time. 
    TODO Keep a running tab on rotation and redraw every once in a while.
    */
    $scope.changeRotation = function(rx, ry, rz) {
        $scope.rotX += rx;
        $scope.rotY += ry;
        $scope.rotZ += rz;
        updateGameCenter();
        if (!game.running) draw();
    }

    /* Resetting is good sometimes. */
    $scope.resetTransforms = function() {
        $scope.rotX = 0;
        $scope.rotY = 0;
        $scope.rotZ = 0;
        $scope.transX = 0;
        $scope.transY = 0;
        $scope.transZ = 0;
        $scope.zoom = initialZoom;
        updateGameCenter();
        if (!game.running) draw();

    }

    /* Mouse listeners on our canvas. */
    $scope.mouseMove = function($event) {
        // Left click drag means pan.
        if ($event.which == 1) {
            var dx = $event.movementX,
                dy = -$event.movementY; 

            $scope.changeTranslation(dx/40, -dx/40, dy/40)
        }
    }

    $scope.resetMouseState = function($event) {
        mouseState = {isRotating: false, rx: 0, ry: 0, rz: 0};
    }

    $scope.generateBoard = function() {
        $scope.gol.generate();
        draw();
    }

    /* The center moves due to scaling, so we need to recalculate when zoom changes. */
    function updateGameCenter() {
        gameCenter = (new Point(game.width / 2, game.height / 2, game.depth / 2))
            .scale(Point.ORIGIN, $scope.zoom, $scope.zoom, $scope.zoom);
    }

    /* Apply the different view changes that the user has set. */
    function applyViewTransforms(isoObj) {
        return isoObj
            .scale(Point.ORIGIN, $scope.zoom, $scope.zoom, $scope.zoom)
            .rotateX(gameCenter, $scope.rotX)
            .rotateY(gameCenter, $scope.rotY)
            .rotateZ(gameCenter, $scope.rotZ)
            .translate($scope.transX, $scope.transY, $scope.transZ);
    }

    /* Generate a grid sourrounding all the cells. */
    function getGrid() {
        var paths = [];
        for (var z = 0; z < game.depth + 1; z++) {
            for (var x = 0; x < game.width + 1; x++) {
                paths.push(new Path([
                    new Point(x, 0, z),
                    new Point(x, game.width, z),
                    new Point(x, 0, z)
                ]));
            }
            for (var y = 0; y < game.height + 1; y++) {
                paths.push(new Path([
                    new Point(0, y, z),
                    new Point(game.height, y, z),
                    new Point(0, y, z)
                ]));
            }
        }
        for (var x = 0; x < game.width + 1; x++) {
            for (var y = 0; y < game.height + 1; y++) {
                paths.push(new Path([
                    new Point(x, y, 0),
                    new Point(x, y, game.depth),
                    new Point(x, y, 0)
                ]));
            }
        }
        return _.map(paths, applyViewTransforms);
    }

    function draw() {
        var aliveShapes = [];
        // Reset context transforms before clearing.
        iso.canvas.clear();
        _.map(game.board, function(cell) {
            if (cell.alive) {
                aliveShapes.push({
                    cell: cell,
                    shape: applyViewTransforms(
                        Shape.Prism(new Point(cell.x, cell.y, cell.z))
                    )
                });
            }
        });
        _.map(aliveShapes, function(obj) {
            // The more neighbours we have the darker we get.
            var intColor = 200 - 10 * obj.cell.aliveNeighbours;
            var color = new Color(intColor, intColor, intColor);
            iso.add(obj.shape, color);
        });
        iso.add(getGrid(), new Color(110, 100, 100, 0.1));
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - (canvas.offsetTop + navbarHeight);
        draw();
    }

    /* Keep drawing! */
    function drawLoop() {
        if (game.running) draw();
        // Loop using RAF.
        requestAnimationFrame(drawLoop);
    }

    // Let's get started!
    updateGameCenter();
    $scope.generateBoard();
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
    drawLoop();
}]);