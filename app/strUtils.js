'use strict';

/**
 * Reverse the given string
 *
 * @param {string} str the string to reverse
 * @return {string} the reversed string
 */
function reverseStr(str) {

    return str.split('').reverse().join('');
}

module.exports.reverseStr = reverseStr;