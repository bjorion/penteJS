'use strict';

// --- local imports ---
const Cfg = require('./config');

// --- private methods ---
function toNumber(val) {

    const ASCII_A = 65;

    let num = null;
    if (typeof val === 'number') {
        num = val;
    }
    else if (typeof val === 'string') {
        num = parseInt(val);
        if (isNaN(num)) {
            num = val.toUpperCase().charCodeAt(0) - ASCII_A;
        }
    }
    return num;
}

function toLetter(val) {

    let letter = null;
    if (typeof val === 'number') {
        letter = String.fromCharCode(val + 65);
    }
    else if (typeof val === 'string') {
        letter = val;
    }
    return letter;
}

// --- public methods ---
function Cell(y, x, player, val) {

    this.y = toNumber(y);
    this.x = toNumber(x);
    this.player = (!!player) ? player : null;
    this.val = (!!val) ? val : 0;
}

Cell.prototype.getX = function () {
    return this.x;
};

Cell.prototype.getY = function () {
    return this.y;
};

Cell.prototype.getPlayer = function () {
    return this.player;
};

Cell.prototype.getVal = function () {
    return this.val;
};

Cell.prototype.toString = function () {
    return `(y=${this.y}, x=${toLetter(this.x)}), p=${this.player}, val=${this.val}`;
};

Cell.prototype.isValidCoord = function () {

    let ok = true;
    if (this.getX() === null || this.getY() === null) {
        ok = false;
    }
    else if (this.getX() < 0 || this.getY() < 0) {
        ok = false;
    }
    else if (this.getX() >= Cfg.config.TB_SIZE || this.getY() >= Cfg.config.TB_SIZE) {
        ok = false;
    }
    return ok;
};

module.exports = Cell;