"use strict";

const
    _ = require('lodash'),
    elixir = require('laravel-elixir'),
    isVersioning = require('../lib/IsVersioning');

const config = elixir.config;

/**
 * Prep the Gulp src and output paths.
 *
 * @param {string|array} src
 * @param {string|null}  baseDir
 * @param {string|null}  output
 */
module.exports.GulpPaths = (src, baseDir, output) => {
    baseDir = baseDir || config.get('assets.js.folder');
    output = output || config.get('public.js.outputFolder');

    if (_.isObject(src)) {
        src = _.values(src);
    }

    if (isVersioning()) {
        output = this.versionPath(output);
    }

    return new elixir.GulpPaths()
        .src(src, baseDir)
        .output(output);
};

module.exports.versionPath = outputPath => outputPath
    // Add leading slash if missing
    .replace(/^\/?/, '/')
    // insert build folder before js output
    .replace(
        new RegExp(config.js.outputFolder),
        `${config.versioning.buildFolder}/${config.js.outputFolder}`
    );