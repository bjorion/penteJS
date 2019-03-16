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

/**
 * Reverse the given array. The original array is not impacted.
 *
 * @return {Array} new array
 */
function reverseArr(arr) {

    return arr.map((item, index) => arr[arr.length - 1 - index]);
}

/**
 * Copy the given array to a new array.
 *
 * @return {Array} a new array
 */
function copyArr(arr) {

    return arr.map(item => item);
}

module.exports.reverseStr = reverseStr;
module.exports.reverseArr = reverseArr;
module.exports.copyArr = copyArr;