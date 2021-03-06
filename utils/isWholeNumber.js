/**
 * @typedef {Function} isWholeNumber
 * Check if the given number is a whole number
 * @param {number|string} number - The number to check if its a whole number or not
 * @returns {boolean} A boolean representing whether it is a whole number or not
 */
const isWholeNumber = (number) => {
    if (typeof number !== 'string') {
        // @ts-ignore
        number = new String(number);
    }
    // @ts-ignore
    return new RegExp(/[^0-9]/gi).test(number) ? false : true;
};

module.exports = isWholeNumber;