/** @module misc */
/* global exports */

/**
 * Merge the enumerable attributes of two objects deeply.
 * This is modified from <https://github.com/nrf110/deepmerge>
 *
 * @author Nicholas Fisher
 * @copyright Copyright (c) 2012 Nicholas Fisher
 * @license The MIT License (MIT)
 * @link https://github.com/nrf110/deepmerge
 *
 * @param {object} target
 * @param {object} source
 *
 * @return {object}
 */
exports.deepmerge = function deepmerge(target, source) {
    "use strict";

    let result;

    if (Array.isArray(source)) {
        result = [];
        target = target || [];
        result = result.concat(target);

        source.forEach(function (element, index) {
            if (typeof (result[index]) === "undefined") {
                result[index] = element;
            } else if (typeof (element) === "object") {
                result[index] = deepmerge(target[index], element);
            } else if (target.indexOf(element) === -1) {
                result.push(element);
            }
        });
    } else {
        result = {};

        if (target && typeof (target) === "object") {
            Object.keys(target).forEach(function (key) {
                result[key] = target[key];
            });
        }

        Object.keys(source).forEach(function (key) {
            if (typeof (source[key]) !== "object" || !source[key]) {
                result[key] = source[key];
            } else {
                if (!target[key]) {
                    result[key] = source[key];
                } else {
                    result[key] = deepmerge(target[key], source[key]);
                }
            }
        });
    }

    return result;
};
