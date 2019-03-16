'use strict';

// --- import ---
const objectUtils = require('./objectUtils');

// 1 = my opponent
// 2 = my self
const EMPTY = '0';
const OPPONENT = '1';
const CURRENT = '2';
const MAX = 100000;
const values = new Map();

values.set('10', [0, 3]);
values.set('20', [0, 10]); // adjacent to self

values.set('1220', [0, 0, 0, 2000]); // avoid peer capture
values.set('2110', [0, 0, 0, 4000]); // capture peer
values.set('1200', [0, 0, -400, -100]);
values.set('2100', [0, 0, -400, -100]);
values.set('1020', [0, -400, 0, -100]);

values.set('01100', [0, 0, 0, 500, 0]);
values.set('02200', [0, 0, 0, 1000, 0]);
values.set('00020', [0, 5, 0, 0, 0]); // 1 cell away from self

values.set('01110', [3000, 0, 0, 0, 3000]);
values.set('02220', [4000, 0, 0, 0, 4000]);
values.set('22220', [0, 0, 0, 0, MAX]);
values.set('11110', [0, 0, 0, 0, 5000]);
values.set('02202', [200, 0, 0, 3000, 0]);
values.set('22020', [0, 0, 3000, 0, 200]);
values.set('01101', [200, 0, 0, 3000, 0]);
values.set('11010', [0, 0, 3000, 0, 200]);
values.set('02111', [-500, 0, 0, 0, 0]);
values.set('21110', [0, 0, 0, 0, -200]);
values.set('12220', [0, 0, 0, 0, 4000]);

// --- Exported Object ---
(function() {
    values.forEach(function (value, key) {

        let size = key.length;
        if (value.length !== size) {
            throw new Error(key);
        }

        for (let i = 0; i < size; i++) {
            let ch = key.charAt(i);
            if (ch !== EMPTY && value[i] !== 0) {
                throw new Error(`Illegal value for key: ${key}, weights: ${value}`);
            }
        }
    });
    console.log('(value validation: OK)');
})();

/**
 * @param {string} key
 * @return {object} an object containing the array result and a flag if a peer is captured
 */
function getValue(key) {

    let reverse = false;
    let capture = 0;
    let result = null;

    if (!values.has(key)) {
        key = objectUtils.reverseStr(key);
        reverse = true;
    }

    if (values.has(key)) {
        // peer captured ?
        capture = EMPTY;
        capture = (key.indexOf('1220') >= 0) ? OPPONENT : capture;
        capture = (key.indexOf('2110') >= 0) ? CURRENT : capture;

        result = objectUtils.copyArr(values.get(key));
        if (reverse) {
            result = objectUtils.reverseArr(result);
        }
    }
    return {
        arr: result,
        peerCapturer: capture
    };
}

module.exports.getValue = getValue;
module.exports.empty = EMPTY;
module.exports.current = CURRENT;
module.exports.opponent = OPPONENT;

