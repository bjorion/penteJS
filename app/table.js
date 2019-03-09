'use strict';

const Screen = require('./screen');

// --- public methods ---
function TableBuilder(data)
{
    let arr = data.split(';');
    let index = 0;
    let n = parseInt(arr[index++]);
    let table = new Table(n);
    for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
            table.setYX(y, x, parseInt(arr[index++]));
        }
    }
    return table;
}

function Table(n) {

    this.n = n;
    this.middle = (this.n - 1) / 2;
    this.matr = new Array(n);
    for (let j = 0; j < n; j++) {
        this.matr[j] = new Array(n);
        for (let i = 0; i < n; i++) {
            this.matr[j][i] = 0;
        }
    }
}

Table.prototype.printScreen = function () {

    let cx = '    ';
    for (let i = 0; i < this.n; i++) {
        cx += (" " + String.fromCharCode(65 + i) + ' ');
    }
    Screen.println(cx);

    const POINT = 4;
    let cy = '';
    for (let j = 0; j < this.n; j++) {
        cy = j.toString().padStart(3) + " ";
        for (let i = 0; i < this.n; i++) {
            let chr;
            switch (this.matr[j][i]) {
                case 0:
                    chr = ' . ';
                    break;
                case 1:
                    chr = ' O ';
                    break;
                case 2:
                    chr = ' X ';
                    break;
                default:
                    chr = ' ? ';
            }

            if (Math.abs(i - this.middle) === POINT && Math.abs(j - this.middle) === POINT) {
                if (this.matr[j][i] === 0) {
                    chr = ' _ ';
                }
            }

            cy += chr;
        }
        Screen.println(cy);
    }
};

Table.prototype.set = function (cell) {

    let y = cell.getY();
    let x = cell.getX();
    let player = (cell.getPlayer() != null) ? cell.getPlayer().getNumber() : 0;

    let curr = this.matr[y][x];
    if (player > 0 && curr > 0) {
        throw new Error("Already occupied: " + curr);
    }
    if (player == 0 && curr == 0) {
        throw new Error("This space is already empty");
    }

    this.matr[y][x] = player;
};

Table.prototype.save = function() {

    let line = this.n.toString() + ';';
    for (let y = 0; y < this.n; y++) {
        let row = '';
        for (let x = 0; x < this.n; x++) {
            row += this.matr[y][x].toString() + ';';
        }
        line += row;
    }
    return line;
};

/**
 * @returns {number} the player value (1 or 2), 0 if empty, -1 if out-of-bound
 */
Table.prototype.get = function (cell) {

    let y = cell.getY();
    let x = cell.getX();
    return this.getYX(y, x);
};

/**
 * @returns {number} the player value (1 or 2), 0 if empty, -1 if out-of-bound
 */
Table.prototype.getYX = function (y, x) {

    let player = -1;
    if (x >= 0 && x < this.n && y >= 0 && y < this.n) {
        player = this.matr[y][x];
    }
    return player;
};

Table.prototype.setYX = function (y, x, val) {

    if (x >= 0 && x < this.n && y >= 0 && y < this.n) {
        this.matr[y][x] = val;
    }
};

module.exports = Table;
module.exports.TableBuilder = TableBuilder;

