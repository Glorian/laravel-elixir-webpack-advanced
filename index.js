"use strict";

const
    _ = require('lodash'),
    path = require('path'),
    gulp = require('gulp'),
    elixir = require('laravel-elixir'),
    webpack = require('webpack-stream'),
    webpackCompiler = require('webpack'),
    webpack_config = require('./conf/webpack');

const
    $ = elixir.Plugins,
    taskName = 'webpack';

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

    options = _.merge(webpack_config, options, {entry, watch: isWatch()});

    new elixir.Task(taskName, function () {
        let taskName = _.capitalize(this.name);

        this.log(paths.src, saveFiles(src, paths));

        return (
            gulp
                .src(paths.src.path)
                .pipe(webpack(options, null, (err, stats) => {
                    $.util.log(this.name, stats.toString({
                        colors: true
                    }));
                }))
                .on('error', function (e) {
                    new elixir
                        .Notification()
                        .error(e, `${taskName} Compilation Failed!`);

                    this.emit('end');
                })
                .pipe(gulp.dest(paths.output.baseDir))
                .pipe(new elixir.Notification(`${taskName} Compiled!`))
        );
    });


    /**
     * If watch task is triggered, then we should start webpack task only once
     * in watch mode
     */
    isWatch() && elixir.Task.find(taskName).run();

});