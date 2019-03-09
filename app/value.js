'use strict';

// --- import ---
const StrUtils = require('./strUtils');

// 1 = my opponent
// 2 = my self
const values = new Map();

values.set('1220', [0, 0, 0, 200]);
values.set('2110', [0, 0, 0, 400]);
values.set('1200', [0, 0, -40, -10]);
values.set('2100', [0, 0, -40, -10]);
values.set('1020', [0, -40, 0, -10]);

values.set('01110', [200, 0, 0, 0, 300]);
values.set('02220', [200, 0, 0, 0, 300]);
values.set('22220', [0, 0, 0, 0, 1000]);
values.set('11110', [0, 0, 0, 0, 500]);
values.set('02202', [20, 0, 0, 300, 0]);
values.set('22020', [0, 0, 300, 0, 20]);
values.set('01101', [20, 0, 0, 300, 0]);
values.set('11010', [0, 0, 300, 0, 20]);
values.set('02111', [-50, 0, 0, 0, 0]);
values.set('21110', [0, 0, 0, 0, -20]);
values.set('12220', [0, 0, 0, 0, 300]);

// --- Exported Object ---
(function() {
    console.log('(value validation: OK)');
    values.forEach(function (value, key, map) {

        let size = key.length;
        if (value.length != size) {
            throw new Error(key);
        }

        for (let i = 0; i < size; i++) {
            let error = false;
            let ch = key.charAt(i);
            if (ch !== '0' && value[i] !== 0) {
                error = true;
            }
            if (ch === '0' && value[i] === 0) {
                error = true;
            }
            if (error) {
                throw new Error('Illegal value for key: ' + key + ', weights: ' + value);
            }
        }
    });
})();

/**
 * @param {string} key
 * @return {array} the array corresponding to the key
 */
function getValue(key) {

    let reverse = false;
    let result = null;
    if (!values.has(key)) {
        key = StrUtils.reverseStr(key);
        reverse = true;
    }

    if (values.has(key)) {
        result = values.get(key);
        if (reverse) {
            result = result.reverse();
        }
    }
    return result;
}

module.exports.getValue = getValue;
