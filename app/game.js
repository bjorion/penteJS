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

/** Nbr of peers to be captured for a victory. */
const N_PEER = 5;

/** Min position for the first player second turn. */
const MIN_POS = 4;

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
                console.log('Peer captured');
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

Game.prototype._buildPattern = function (y, x, dir, player, opponent) {

    const pattern = new Array(2 * LEN_MAX - 1);
    for (let k = -LEN_MAX + 1; k < LEN_MAX; k++) {
        let num = this.tb.getYX(y + k * dir[0], x + k * dir[1]);
        let chr = '.';
        if (num === player.getNumber()) {
            chr = '2';
        }
        else if (num === opponent.getNumber()) {
            chr = '1';
        }
        else if (num === 0) {
            chr = '0';
        }
        pattern[LEN_MAX + k - 1] = chr;
    }
    return pattern;
};

Game.prototype._computeVal = function (pattern, len) {

    let val = 0;
    const mid = 4;
    for (let k = 0; k < len; k++) {
        let key = pattern.slice(mid - len + k + 1, mid + k + 1).join('');
        // skip any key containing '.' (out-of-bound index)
        if (key.indexOf('.') === -1) {
            let arr = Value.getValue(key);
            if (arr != null) {
                // console.log(`pattern: ${pattern}, key: ${key}, k: ${k}, val: ${arr[len - k -1]}`);
                val += arr[len - k - 1];
            }
        }
    }
    return val;
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
 * @return the cell with the highest value
 */
Game.prototype._findHighestValue = function(lowest) {

    let bestValue = lowest;
    let bestCell = null;
    for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
            let val = this.vals[y][x];
            if (val > bestValue) {
                bestCell = new Cell(y, x, null, val);
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
    game.tb = Table.TableBuilder(arr[4]);
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
        console.log("Error: data not yet initialized");
        return;
    }

    for (let y = 0; y < this.size; y++) {
        let cx = y.toString().padStart(2);
        for (let x = 0; x < this.size; x++) {
            let val = this.vals[y][x];
            val = Math.max(0, val);
            cx += val.toString().padStart(6);
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
        throw new Error("Game is Over");
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

    let ok = (this.tb.get(cell) == 0);
    if (this.getTurn() == 3) {
        ok = (Math.abs(cell.getX() - this.middle) >= MIN_POS) || (Math.abs(cell.getY() - this.middle) >= MIN_POS);
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

/**
 * Compute the best move possible for the given player.
 * The values for each cell are saved in the array matr[][].
 */
Game.prototype.computeBestMove = function () {

    const defaultValue = 500;
    const forbidden = -1000;
    const player = this.getCurrentPlayer();

    // second turn = random next to the center
    if (this.turn === 2) {
        let x = 0, y = 0;
        let bestCell = null;
        do {
            x = this.middle + Math.floor(Math.random() * 3) - 1;
            y = this.middle + Math.floor(Math.random() * 3) - 1;
            bestCell = new Cell(y, x, player, defaultValue);
        } while (x === this.middle && y === this.middle);
        return bestCell;
    }

    // third turn = on the square
    if (this.turn === 3) {
        let cell = this.history[1];
        console.log("cell: " + cell);
    }

    // initialize
    let opponent = this.getOpponent();
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
            let cellSum = forbidden;
            let cellPlayer = this.tb.getYX(y, x);
            // check if the case is empty
            if (cellPlayer == 0) {
                cellSum = defaultValue;
                for (let dir of DIRS) {
                    // compute the pattern for the current cell and direction
                    const pattern = this._buildPattern(y, x, dir, player, opponent);

                    // compute the value of the current cell
                    let val = 0;
                    val += this._computeVal(pattern, 4);
                    val += this._computeVal(pattern, 5);

                    // console.log("pattern: " + pattern);
                    cellSum += val;
                }
            }
            matr[y][x] = cellSum;
        }
    }
    this.vals = matr;
    return this._findHighestValue(forbidden);
};

module.exports = Game;
module.exports.GameBuilder = GameBuilder;