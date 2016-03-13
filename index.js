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
    taskName = 'webpack';

const statsOptions = {
    colors: $.util.colors.supportsColor,
    hash: false,
    timings: false,
    chunks: false,
    chunkModules: false,
    modules: false,
    children: true,
    version: true,
    cached: false,
    cachedAssets: false,
    reasons: false,
    source: false,
    errorDetails: false
};

let prepGulpPaths = require('./lib/GulpPaths'),
    prepareEntry = require('./lib/EntryPaths'),
    saveFiles = require('./lib/SaveFiles'),
    isWatch = require('./lib/IsWatch');

elixir.extend(taskName, function (src, options, globalVars) {
    let paths = prepGulpPaths(src),
        entry = prepareEntry(src);

    if (_.isPlainObject(globalVars)) {
        webpack_config.plugins.push(new webpackCompiler.ProvidePlugin(globalVars));
    }

    options = _.merge(webpack_config, options, {entry, watch: isWatch(), stats: {colors: true}});

    new elixir.Task(taskName, function () {
        this.log(paths.src, saveFiles(src, paths));

        webpack(options, (err, stats) => {
            if (err) {
                return;
            }

            $.util.log(stats.toString(options.stats));
        });
    });


    /**
     * If watch task is triggered, then we should start webpack task only once
     * in watch mode
     */
    isWatch() && elixir.Task.find(taskName).run();

});