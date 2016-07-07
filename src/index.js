"use strict";

/**
 * Require main dependencies
 */
import _ from 'lodash';
import webpack from 'webpack';
import elixir from 'laravel-elixir';
import webpackConfig from './Config';

/**
 * Built-in modules
 */
import isWatch from './modules/IsWatch';
import { GulpPaths, versionPath } from './modules/GulpPaths';
import isVersion from './modules/IsVersioning';
import prepareEntry from './modules/EntryPaths';

/**
 * Helpers
 */
const
    $ = elixir.Plugins,
    taskName = 'webpack';

/**
 * Webpack spec
 */
elixir.extend(taskName, function (src, options, globalVars) {
    let paths = GulpPaths(src),
        globalConfig = Object.assign({}, webpackConfig),
        entry = prepareEntry(src);

    /**
     * In next major release this will be removed
     * TODO mark as deprecated
     */
    if (_.isPlainObject(globalVars)) {
        webpackConfig.plugins.push(new webpack.ProvidePlugin(globalVars));
    }

    // Merge options
    options = _.mergeWith(
        globalConfig,
        options,
        {entry, watch: isWatch()},
        (objValue, srcValue) => {
            if (_.isArray(objValue)) {
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
    new elixir.Task(taskName, function () {
        this.recordStep('Building js files');

        webpack(options, (err, stats) => {
            if (err) {
                return;
            }

            $.util.log(stats.toString(webpackConfig.stats));
        });
    }, paths);
});