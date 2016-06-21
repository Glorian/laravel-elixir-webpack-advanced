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
    taskName = 'webpack';

/**
 * Built-in modules
 */
const
    {GulpPaths, versionPath} = require('./lib/GulpPaths'),
    isVersioning = require('./lib/IsVersioning'),
    prepareEntry = require('./lib/EntryPaths');

/**
 * Webpack spec
 */
elixir.extend(taskName, function (src, options, globalVars) {
    let paths = GulpPaths(src),
        globalConfig = Object.assign({}, webpack_config),
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
        globalConfig,
        options,
        {entry, watch: elixir.isWatching()},
        (objValue, srcValue) => {
            if (_.isArray(objValue)) {
                return objValue.concat(srcValue);
            }
        }
    );

    if (isVersioning()) {
        options.output.publicPath = versionPath(options.output.publicPath);
    }

    /**
     * Webpack task
     */
    new elixir.Task(taskName, function () {
        this.recordStep('Building js files');

        webpack(options, (err, stats) => {
            if (err) {
                return;
            }

            $.util.log(stats.toString(webpack_config.stats));
        });
    }, paths);
});