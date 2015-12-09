"use strict";

const
    _ = require('lodash'),
    path = require('path'),
    gulp = require('gulp'),
    elixir = require('laravel-elixir'),
    webpack = require('webpack-stream'),
    webpackCompiler = require('webpack'),
    sourcemaps = require('gulp-sourcemaps'),
    webpack_config = require('./conf/webpack');

const
    $ = elixir.Plugins,
    config = elixir.config,
    taskName = 'webpack';

let prepGulpPaths = require('./lib/GulpPaths'),
    prepareEntry = require('./lib/EntryPaths'),
    saveFiles = require('./lib/SaveFiles'),
    isWatch = require('./lib/IsWatch');

elixir.extend(taskName, function (src, options, vendorLibs, globalVars) {
    let paths = prepGulpPaths(src),
        entry = prepareEntry(src);

    if (_.isArray(vendorLibs)) {
        entry.vendor = vendorLibs;
    }

    if (_.isPlainObject(globalVars)) {
        webpack_config.plugins.push(new webpackCompiler.ProvidePlugin(globalVars));
    }

    options = _.assign(webpack_config, options, {entry, watch: isWatch()});

    new elixir.Task(taskName, function () {
        let taskName = _.capitalize(this.name);

        this.log(paths.src, saveFiles(src, paths));

        return (
            gulp
                .src(paths.src.path)
                .pipe($.if(config.sourcemaps, sourcemaps.init()))
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
                .pipe($.if(config.sourcemaps, sourcemaps.write('.')))
                .pipe(gulp.dest(paths.output.baseDir))
                .pipe(new elixir.Notification(`${taskName} Compiled!`))
        );
    })
        .watch(path.join(paths.src.baseDir, '**/*'));
});