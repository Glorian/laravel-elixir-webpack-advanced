"use strict";

/**
 * Require main dependencies
 */
import {isPlainObject, mergeWith, isArray} from 'lodash';
import gutils from 'gulp-util';
import webpack from 'webpack';

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
        globalConfig.plugins.push(new webpack.ProvidePlugin(globalVars));
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

        webpack(options, (err, stats) => {
            if (err) {
                return;
            }

            gutils.log(stats.toString(options.stats));
    });
    }, paths);
});