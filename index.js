"use strict";

const
    _ = require('lodash'),
    path = require('path'),
    gulp = require('gulp'),
    webpack = require('webpack'),
    elixir = require('laravel-elixir'),
    webpack_config = require('./conf/webpack');

const
    $ = elixir.Plugins,
    config = elixir.config,
    taskName = 'webpack';

let prepGulpPaths = require('./lib/GulpPaths'),
    isVersioning = require('./lib/IsVersioning'),
    prepareEntry = require('./lib/EntryPaths'),
    saveFiles = require('./lib/SaveFiles'),
    isWatch = require('./lib/IsWatch');

elixir.extend(taskName, function (src, options, globalVars) {
    let paths = prepGulpPaths(src),
        entry = prepareEntry(src);

    if (_.isPlainObject(globalVars)) {
        webpack_config.plugins.push(new webpack.ProvidePlugin(globalVars));
    }

    options = _.mergeWith(webpack_config, options, {entry, watch: isWatch()}, (objValue, srcValue) => {
        if (_.isArray(objValue)) {
            return objValue.concat(srcValue);
        }
    });

    if (isVersioning()) {
        options.output.publicPath = options.output.publicPath

            // Add leading slash if missing
            .replace(/^\/?/, '/')

            // prepend build folder to public path
            .replace(/^/, `/${config.versioning.buildFolder}`);
    }

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