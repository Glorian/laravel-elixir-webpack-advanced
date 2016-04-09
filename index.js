"use strict";

/**
 * Require main dependencies
 */
const
    _ = require('lodash'),
    path = require('path'),
    webpack = require('webpack'),
    elixir = require('laravel-elixir'),
    webpack_config = require('./conf/webpack');

/**
 * Helpers
 */
const
    $ = elixir.Plugins,
    config = elixir.config,
    taskName = 'webpack';

/**
 * Built-in modules
 */
const
    prepGulpPaths = require('./lib/GulpPaths'),
    isVersioning = require('./lib/IsVersioning'),
    prepareEntry = require('./lib/EntryPaths'),
    saveFiles = require('./lib/SaveFiles'),
    isWatch = require('./lib/IsWatch');

/**
 * Webpack spec
 */
elixir.extend(taskName, function (src, options, globalVars) {
    let paths = prepGulpPaths(src),
        entry = prepareEntry(src);

    /**
     * In next major release this will be removed
     * TODO mark as deprecated
     */
    if (_.isPlainObject(globalVars)) {
        webpack_config.plugins.push(new webpack.ProvidePlugin(globalVars));
    }

    // Merge options
    options = _.mergeWith(
        webpack_config,
        options,
        {entry, watch: isWatch()},
        (objValue, srcValue) => {
            if (_.isArray(objValue)) {
                return objValue.concat(srcValue);
            }
        }
    );

    if (isVersioning()) {
        options.output.publicPath = options.output.publicPath

            // Add leading slash if missing
            .replace(/^\/?/, '/')

            // insert build folder before js output
            .replace(
                new RegExp(config.js.outputFolder),
                `${config.versioning.buildFolder}/${config.js.outputFolder}`
            );
    }

    /**
     * Webpack task
     */
    new elixir.Task(taskName, function () {
        this.log(paths.src, saveFiles(src, paths));

        webpack(options, (err, stats) => {
            if (err) {
                return;
            }

            $.util.log(stats.toString(webpack_config.stats));
        });
    });

    /**
     * If watch task is triggered, then we should start webpack task only once
     * in watch mode
     */
    isWatch() && elixir.Task.find(taskName).run();
});