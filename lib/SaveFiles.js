"use strict";

const
    _ = require('lodash'),
    path = require('path');

/**
 * Get relative paths to output files
 *
 * @param src
 * @param paths
 * @returns {*}
 */
module.exports = (src, paths) => {
    if (_.isArray(src)) {
        return _.map(paths.src.path, file => {
            return path.join(paths.output.baseDir, `${path.basename(file, path.extname(file))}.js`)
        });
    }

    if (_.isPlainObject(src)) {
        return _.map(_.keys(src), file => {
            return path.join(paths.output.baseDir, `${file}.js`);
        });
    }

    return paths.output;
};