"use strict";

const
    _ = require('lodash');

/**
 * Append relative path to entry points
 *
 * @param {string|array|object} src
 * @returns {string|array|object}
 */
module.exports = src => {
    let prependPath = file => `./${file}`;

    if (_.isPlainObject(src)) {
        return _.mapValues(src, script => prependPath(script));
    }

    if (_.isString(src)) {
        return prependPath(src);
    }

    if (_.isArray(src)) {
        return _.map(src, file => prependPath(file));
    }
};