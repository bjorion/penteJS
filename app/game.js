'use strict';

// --- local imports ---
const Cfg = require('./config');
const Value = require('./value');
const Cell = require('./cell');
const Table = require('./table');
const Player = require('./player');

// --- constants ---
const VERSION = 'pente-v1';

/** Length of a sequence for a victory. */
const LEN_MAX = 5;

/** Middle index of a pattern. */
const MID = LEN_MAX - 1;

/** Nbr of peers to be captured for a victory. */
const N_PEER = 5;

/** Min position for the first player second turn. */
const MIN_POS = 4;

const CELL_DEFAULT_VALUE = 100;
const CELL_FORBIDDEN_VALUE = -999;

const DIRS = [[0, 1], [1, 1], [1, 0], [1, -1]]; // E, SE, S, SW
const ALL_DIRS = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];

// --- private methods ---
Game.prototype._checkSequence = function (cell, dy, dx) {

    let player = this.tb.get(cell);
    let count = 1;
    for (let k = 1; k < LEN_MAX; k++) {
        let c = new Cell(cell.getY() + k * dy, cell.getX() + k * dx);
        let val = this.tb.get(c);
        if (val !== player) {
            break;
        }
        count++;
    }
    for (let k = 1; k < LEN_MAX; k++) {
        let c = new Cell(cell.getY() - k * dy, cell.getX() - k * dx);
        let val = this.tb.get(c);
        if (val !== player) {
            break;
        }
        count++;
    }
    return count;
};

Game.prototype._checkAllSequences = function (cell) {

    let win = false;
    for (let dir of DIRS) {
        if (this._checkSequence(cell, dir[0], dir[1]) >= LEN_MAX) {
            win = true;
            break;
        }
    }
    return win;
};

Game.prototype._capturePeer = function (cell, y, x) {

    let player = cell.getPlayer();
    let opponent = this.getOpponent(cell.getPlayer());

    let c1 = new Cell(cell.getY() + y, cell.getX() + x, null);
    if (this.tb.get(c1) === opponent.getNumber()) {
        let c2 = new Cell(cell.getY() + 2 * y, cell.getX() + 2 * x, null);
        if (this.tb.get(c2) === opponent.getNumber()) {
            let c3 = new Cell(cell.getY() + 3 * y, cell.getX() + 3 * x);
            if (this.tb.get(c3) === player.getNumber()) {
                console.log(`Peer captured: ${cell.getY()}-${cell.getX()}`);
                this.tb.set(c1);
                this.tb.set(c2);
                player.incPeerWon();
                opponent.incPeerLost();
            }
        }
    }
};

Game.prototype._capturePeers = function (cell) {

    for (let dir of ALL_DIRS) {
        this._capturePeer(cell, dir[0], dir[1]);
    }
};

Game.prototype._checkWin = function (cell) {

    let win = false;
    if (this._checkAllSequences(cell)) {
        win = true;
    }
    else if (cell.getPlayer().getPeerWon() >= N_PEER) {
        win = true;
    }
    return win;
};

/**
 * @returns {Array}
 * @private
 */
Game.prototype._buildPattern = function (y, x, dir, player, opponent) {

    const pattern = new Array(2 * LEN_MAX - 1);
    for (let k = -LEN_MAX + 1; k < LEN_MAX; k++) {
        let num = this.tb.getYX(y + k * dir[0], x + k * dir[1]);
        let chr = '.';
        if (num === player.getNumber()) {
            chr = Value.current;
        }
        else if (num === opponent.getNumber()) {
            chr = Value.opponent;
        }
        else if (num === 0) {
            chr = Value.empty;
        }
        pattern[LEN_MAX + k - 1] = chr;
    }
    return pattern;
};

Game.prototype._computeVal = function (pattern, len) {

    let val = 0;
    for (let k = 0; k < len; k++) {
        let key = pattern.slice(MID - len + k + 1, MID + k + 1).join('');
        // skip any key containing '.' (out-of-bound index)
        if (key.indexOf('.') === -1) {
            let resp = Value.getValue(key);
            if (resp.arr !== null) {
                // console.log(`pattern: ${pattern}, key: ${key}, k: ${k}, val: ${arr[len - k -1]}`);
                val += resp.arr[len - k - 1];
            }
            // peer captured: each peer has an increasing worth
            if (resp.peerCapturer !== Value.empty) {
                if (resp.peerCapturer === Value.current) {
                    let won = this.getCurrentPlayer().getPeerWon();
                    console.log("bonus added for capturing a peer: " + won);
                    val += won * 500;
                }
                if (resp.peerCapturer === Value.opponent) {
                    let won = this.getCurrentPlayer().getPeerWon();
                    console.log("bonus added for avoiding losing a peer: " + won);
                    val += won * 300;
                }
            }
        }
    }
    return val;
};

Game.prototype._computeValYX = function (y, x, debug) {

    let cellSum = CELL_FORBIDDEN_VALUE;
    let cellPlayer = this.tb.getYX(y, x);
    // check if the case is empty
    if (cellPlayer === 0) {
        cellSum = CELL_DEFAULT_VALUE;
        for (let dir of DIRS) {
            // compute the pattern for the current cell and direction
            let pattern = this._buildPattern(y, x, dir, this.getCurrentPlayer(), this.getOpponent());

            // compute the value of the current cell
            let val = 0;
            val += this._computeVal(pattern, 2);
            val += this._computeVal(pattern, 4);
            val += this._computeVal(pattern, 5);
            if (debug) {
                pattern[MID] = '_';
                console.log(`pattern: ${pattern}, val: ${val}`);
            }
            cellSum += val;
        }
    }
    return cellSum;
};

Game.prototype._findPlayerByNum = function (number) {

    let player = null;
    let num = parseInt(number);
    if (num === 1) {
        player = this.p1;
    }
    else if (num === 2) {
        player = this.p2;
    }
    return player;
};

/**
 * @return {Cell} the cell with the highest value
 */
Game.prototype._findHighestValue = function (lowest) {

    let bestValue = lowest;
    let bestCell = null;
    for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
            let val = this.vals[y][x];
            if (val > bestValue) {
                bestCell = new Cell(y, x, this.currentPlayer, val);
                bestValue = val;
            }
        }
    }
    return bestCell;
};

// --- public methods ---
/**
 * Helper method to build a new instance of Game.
 *
 * @param {String} data
 * @returns {Game} a new instance of a game
 */
function GameBuilder(data) {

    let game = new Game();
    let arr = data.split('\n');
    if (VERSION !== arr[0]) {
        throw new Error('Could not load the game, incorrect version: ' + arr[0]);
    }

    game.p1 = Player.PlayerBuilder(arr[1]);
    game.p2 = Player.PlayerBuilder(arr[2]);
    let infos = arr[3].split(';');
    let index = 0;
    game.turn = parseInt(infos[index++]);
    game.currentPlayer = game._findPlayerByNum(infos[index++]);
    game.winner = game._findPlayerByNum(infos[index++]);
    game.gameOver = (infos[index] === 'true');
    let size = arr[4];
    let str = '';
    for (let i = 5; i < 5 + size; i++) {
        str += arr[i];
    }
    game.tb = Table.TableBuilder(size, str);
    return game;
}

/**
 * @constructor
 */
function Game() {

    this.tb = new Table(Cfg.config.TB_SIZE);
    this.size = Cfg.config.TB_SIZE;
    this.middle = (this.size - 1) / 2;
    this.turn = 1;
    this.p1 = new Player(1, 'computer');
    this.p2 = new Player(2, 'human');
    this.currentPlayer = this.p1;
    this.winnerPlayer = null;
    this.gameOver = false;
    this.vals = null;
    this.history = [];
}

Game.prototype.displayBoard = function () {

    this.tb.printScreen();
};

Game.prototype.displayScore = function () {

    if (this.vals === null) {
        console.log('Error: data not yet initialized');
        return;
    }

    let cx = '    ';
    for (let i = 0; i < this.size; i++) {
        cx += ('     ' + String.fromCharCode(65 + i));
    }
    console.log(cx);

    for (let y = 0; y < this.size; y++) {
        let cx = y.toString().padStart(3) + ':';
        for (let x = 0; x < this.size; x++) {
            let val = Math.max(0, this.vals[y][x]);
            let player = this.tb.getYX(y, x);
            cx += (player === 0) ? val.toString().padStart(6) : this.tb.getIcon(player).padStart(6);
        }
        console.log(cx);
    }
};

/**
 * Start the game. First move is in the middle of the board.
 */
Game.prototype.start = function () {

    this.play(new Cell(this.middle, this.middle, this.p1));
};

Game.prototype.play = function (cell) {

    if (this.gameOver) {
        throw new Error('Game is Over');
    }

    this.vals = null;
    this.tb.set(cell);
    this.history.push(cell);
    this._capturePeers(cell);

    if (this._checkWin(cell)) {
        this.winnerPlayer = this.currentPlayer;
        this.gameOver = true;
    }
    else {
        this.turn++;
        this.currentPlayer = (this.turn % 2 === 1) ? this.p1 : this.p2;
    }
};

Game.prototype.isCellAvailable = function (cell) {

    let ok = (this.tb.get(cell) === 0);
    if (this.getTurn() === 3) {
        // ok = (Math.abs(cell.getX() - this.middle) >= MIN_POS) || (Math.abs(cell.getY() - this.middle) >= MIN_POS);
    }
    return ok;
};

Game.prototype.save = function () {

    let data = '';
    data += VERSION + '\n';
    data += this.p1.save() + '\n';
    data += this.p2.save() + '\n';
    let winner = (this.winnerPlayer === null) ? 0 : this.winnerPlayer.getNumber();
    data += this.turn + ';' + this.currentPlayer.getNumber() + ';' + winner + ';' + this.gameOver + '\n';
    data += this.tb.save();
    return data;
};

Game.prototype.getWinner = function () {

    return this.winnerPlayer;
};

Game.prototype.getCurrentPlayer = function () {

    return this.currentPlayer;
};

Game.prototype.getTurn = function () {

    return this.turn;
};

Game.prototype.getOpponent = function (player) {

    let current = (!!player) ? player : this.getCurrentPlayer();
    return (current === this.p1) ? this.p2 : this.p1;
};

Game.prototype.computeValYX = function (y, x) {

    return this._computeValYX(y, x, true);
};

/**
 * Compute the best move possible for the given player.
 * The values for each cell are saved in the array matr[][].
 *
 * @return {Cell} the best move found
 */
Game.prototype.computeBestMove = function () {

    // second turn = random next to the center
    if (this.turn === 2) {
        let x = 0, y = 0;
        let bestCell = null;
        do {
            x = this.middle + Math.floor(Math.random() * 3) - 1;
            y = this.middle + Math.floor(Math.random() * 3) - 1;
            bestCell = new Cell(y, x, this.getCurrentPlayer(), CELL_DEFAULT_VALUE);
        } while (x === this.middle && y === this.middle);
        return bestCell;
    }

    // third turn = on the square
    if (this.turn === 3) {
        // let cell = this.history[1];
        // console.log('cell: ' + cell);
    }

    // initialize
    let matr = new Array(this.size);
    for (let y = 0; y < this.size; y++) {
        matr[y] = new Array(this.size);
        for (let x = 0; x < this.size; x++) {
            matr[y][x] = 0;
        }
    }

    // loop through all the cells and compute their value
    for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
            matr[y][x] = this._computeValYX(y, x, false);
        }
    }
    this.vals = matr;
    return this._findHighestValue(CELL_FORBIDDEN_VALUE);
};

module.exports = Game;
module.exports.GameBuilder = GameBuilder;
