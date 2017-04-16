/* Game of Life, data structures and logic */
function Cell(x, y, z, alive) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.alive = alive;
    this.neighbours = [];
    this.aliveNeighbours = 0;
};

Cell.prototype.addNeighbour = function(cell) {
    this.neighbours.push(cell);
}

Cell.prototype.finalize = function() {
    this.checkNeighbours();
    this.aliveNext = this.isAliveNext(this.alive);
}

Cell.prototype.checkNeighbours = function() {
    var status = _.map(this.neighbours, function(e) {
        return (e.alive) ? 1 : 0;
    });
    this.aliveNeighbours = _.reduce(status, function(m, n) {
        return m + n;
    }, 0);
}

/*
 * 2333 Rule for 3D GoL
 * A living cell remains living if it has between 2 and 3 living neighbors,
 * A dead cell will become alive if it has between 3 and 3 living neighbors.
 */
Cell.prototype.isAliveNext = function(aliveNow) {
    // Condensed rules.
    return (aliveNow && this.aliveNeighbours == 2) || (this.aliveNeighbours == 3);
}

Cell.prototype.update = function() {
    var aliveNow = this.alive;
    this.alive = this.aliveNext;
    this.checkNeighbours();
    this.aliveNext = this.isAliveNext(aliveNow);
}

function GameOfLife(delayFunction) {
    this.width = 5;
    this.height = 5;
    this.depth = 5;
    this.initialAlive = 50;
    this.running = false;
    this.board = {};
    this.currentStep = 0;
    this.stepDelay = 500;
    this.delayFunction = delayFunction;
}

GameOfLife.prototype.play = function() {
    this.running = true;
    this.runner();
}

GameOfLife.prototype.stop = function() {
    this.running = false;
}

GameOfLife.prototype.runner = function() {
    var gol = this;
    gol.delayFunction(function() {
        if (gol.running) {
            gol.update();
            gol.runner();
        }
    }, gol.stepDelay);
}

/* Apply fun to all indices in the board. */
GameOfLife.prototype.applyToAll = function(fun) {
    var gol = this;
    _.each(_.range(gol.width), function(x) {
        _.each(_.range(gol.height), function(y) {
            _.each(_.range(gol.depth), function(z) {
                fun(x, y, z)
            });
        });
    });
}

GameOfLife.prototype.generate = function() {
    var gol = this;
    // 3D board (FIXME uses hacky [x,y,z] to string index)
    gol.board = {};
    gol.currentStep = 0;
    gol.running = false;
    // Add all the cells.
    gol.applyToAll(function(x, y, z) {
        gol.board[[x, y, z]] = new Cell(x, y, z, 100 * Math.random() < gol.initialAlive);
    });
    // Find the neighbours for each cell.
    gol.applyToAll(function(x, y, z) {
        _.each([-1, 0, 1], function(dx) {
            _.each([-1, 0, 1], function(dy) {
                _.each([-1, 0, 1], function(dz) {
                    var nx = x + dx,
                        ny = y + dy,
                        nz = z + dz,
                        invalid = (dx == 0 && dy == 0 && dz == 0) ||
                        (nx < 0 || nx == gol.width) ||
                        (ny < 0 || ny == gol.height) ||
                        (nz < 0 || nz == gol.depth);
                    if (!invalid) {
                        gol.board[[x, y, z]].addNeighbour(gol.board[[nx, ny, nz]])
                    }
                });
            });
        });
        // We're ready to finalize this cell.
        gol.board[[x, y, z]].finalize();
    });
}

GameOfLife.prototype.update = function() {
    var gol = this;
    // Update each cell.
    _.map(gol.board, function(cell) {
        return cell.update();
    });
    gol.currentStep += 1;
    console.log(gol.currentStep);
}