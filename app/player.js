'use strict';

// --- private methods ---

// --- public methods ---
/**
 * Helper method to build an instance of {Player}.
 *
 * @param line
 * @returns {Player}
 */
function PlayerBuilder(line) {

    var arr = line.split(';');
    let player = new Player(parseInt(arr[0]), arr[1]);
    player.peerWon = parseInt(arr[2]);
    player.peerLost = parseInt(arr[3]);
    return player;
}

function Player(number, name) {

    if (number !== 1 && number !== 2) {
        throw new Error('invalid number: ' + number);
    }

    this.number = number;
    this.name = name;
    this.peerWon = 0;
    this.peerLost = 0;
    this.symbol = (number === 1) ? 'O' : 'X';
}

Player.prototype.toString = function () {

    return `${this.name} (${this.symbol})`;
};

Player.prototype.debug = function () {

    return `${this.name} (${this.symbol}): captured=${this.peerWon}, lost=${this.peerLost}`;
};

Player.prototype.save = function () {

    return `${this.number};${this.name};${this.peerWon};${this.peerLost}`;
};

Player.prototype.incPeerWon = function () {

    this.peerWon++;
};

Player.prototype.incPeerLost = function () {

    this.peerLost++;
};

Player.prototype.getPeerWon = function () {

    return this.peerWon;
};

Player.prototype.getPeerLost = function () {

    return this.peerLost;
};

Player.prototype.getNumber = function () {

    return this.number;
};

module.exports = Player;
module.exports.PlayerBuilder = PlayerBuilder;