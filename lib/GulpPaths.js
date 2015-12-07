"use strict";

const
    _ = require('lodash'),
    elixir = require('laravel-elixir');

/**
 * Prep the Gulp src and output paths.
 *
 * @param {string|array} src
 * @param {string|null}  baseDir
 * @param {string|null}  output
 */
module.exports = (src, baseDir, output) => {
    baseDir = baseDir || config.get('assets.js.folder');
    output = output || config.get('public.js.outputFolder');

    if (_.isObject(src)) {
        src = _.values(src);
    }

    return new elixir.GulpPaths()
        .src(src, baseDir)
        .output(output, 'app.js');
};