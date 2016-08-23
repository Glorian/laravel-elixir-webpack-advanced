"use strict";

/**
 * Require main dependencies
 */
import {isPlainObject, mergeWith, isArray} from 'lodash';
import webpack from 'webpack-stream';
import compiler from 'webpack';

/**
 * Built-in modules
 */
import GulpPaths from './modules/GulpPaths';
import isVersion from './modules/IsVersioning';
import versionPath from './modules/VersionPath';
import prepareEntry from './modules/EntryPaths';
import webpackConfig from './Config';

/**
 * Helpers
 */
const taskName = 'webpack';

/**
 * Webpack spec
 */
Elixir.extend(taskName, function (src, options, globalVars) {
    let paths = GulpPaths(src),
        globalConfig = Object.assign({}, webpackConfig),
        entry = prepareEntry(src);

    /**
     * In next major release this will be removed
     * TODO mark as deprecated
     */
    if (isPlainObject(globalVars)) {
        webpackConfig.plugins.push(new compiler.ProvidePlugin(globalVars));
    }

    // Merge options
    options = mergeWith(
        globalConfig,
        options,
        {entry, watch: Elixir.isWatching()},
        (objValue, srcValue) => {
            if (isArray(objValue)) {
                return objValue.concat(srcValue);
            }
        }
    );

    if (isVersion()) {
        options.output.publicPath = versionPath(options.output.publicPath);
    }

    /**
     * Webpack task
     */
    new Elixir.Task(taskName, function () {
        this.recordStep !== undefined && this.recordStep('Building js files');

        this.output.baseDir = options.output.path;

        return (
            gulp
                .src(this.src.path)
                .pipe(webpack(options))
                .on('error', this.onError())
                .pipe(this.saveAs(gulp))
                .pipe(this.onSuccess())
        );
    }, paths);
});