'use strict';

// --- imports ---
const fs = require('fs');
const Screen = require('./screen');
const Cell = require('./cell');
const Game = require('./game');

// --- global ---
const FILENAME = 'pente.txt';
const UTF8 = 'utf8';

// --- start ---
let game = new Game();
game.start();
game.displayBoard();
prompt();

let stdin = process.openStdin();

stdin.addListener("data", function (d) {

    d = d.toString().trim();
    if (!parseInput(d)) {
        prompt();
        return;
    }

    let coords = d.split(" ", 2);
    let cell = new Cell(coords[0], coords[1], game.getCurrentPlayer());
    if (!cell.isValidCoord()) {
        Screen.println('Invalid coordinates: ' + cell.toString() + '. Try ".help"');
        return;
    }

    // human plays
    if (game.isCellAvailable(cell)) {
        game.play(cell);
    }
    else {
        Screen.println('Unavailable case');
        return;
    }
    game.displayBoard();

    // human winner ?
    let winner = game.getWinner();
    if (winner !== null) {
        Screen.println(`Player ${winner} won with move ${cell}`);
        process.exit();
    }

    // computer plays
    let bestMove = game.computeBestMove();
    Screen.println(`Best move found for ${game.getCurrentPlayer()}: ${bestMove.toString()}`);
    prompt();
});

function prompt() {

    Screen.println('\n--> ' + game.getTurn() + ': ' + game.getCurrentPlayer().toString() + ': Enter [digit] [letter]: ');
}

function parseInput(d) {

    let cont = false;
    // exit
    if (d === '.x' || d === '.exit') {
        process.exit();
    }
    // status
    else if (d === '.st' || d === '.status') {
        Screen.println('Current : ' + game.getCurrentPlayer().debug());
        Screen.println('Opponent: ' + game.getOpponent().debug());
    }
    // save
    else if (d === '.sv' || d === '.save') {
        let data = game.save();
        fs.writeFileSync(FILENAME, data, UTF8);
        Screen.println('Current game saved');
    }
    // load
    else if (d === '.ld' || d === '.load') {
        let data = fs.readFileSync(FILENAME, UTF8);
        game = Game.GameBuilder(data);
        Screen.println('Game loaded');
    }
    // score
    else if (d === '.sc' || d === '.score') {
        game.displayScore();
    }
    // hint
    else if (d === '.hi' || d === '.hint') {
        let bestMove = game.computeBestMove();
        Screen.println(`Best move found for ${game.getCurrentPlayer()}: ${bestMove.toString()}`);
    }
    else if (d === '.aa') {
    }
    else if (d === '.bo' || d === '.board') {
        game.displayBoard();
    }
    // help
    else if (d === '?' || d === '.help') {
        Screen.println('.bo\tDisplay the board');
        Screen.println('.hi\tGive a hint');
        // Screen.println('.aa\tPlay the advised move');
        Screen.println('.ld\tLoad the game');
        Screen.println('.sc\tDisplay the score for each cell');
        Screen.println('.st\tDisplay the status');
        Screen.println('.sv\tSave the game');
        Screen.println('.x \tExit the game');
    }
    // other command
    else if (d.charCodeAt(0) === 46) {
        Screen.println('Unknown command: try ".help"');
    }
    else {
        cont = true;
    }
    return cont;
}







