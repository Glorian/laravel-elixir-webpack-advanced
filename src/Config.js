"use strict";

// Main modules
import path from 'path';
import rimraf from 'rimraf';
import webpack from 'webpack';
import root from 'app-root-path';
import elixir from 'laravel-elixir';
import AutoPrefixer from 'autoprefixer';
import WebpackNotifierPlugin from 'webpack-notifier';
import BowerWebpackPlugin from 'bower-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

// Built-in modules
import isWatch from './modules/IsWatch';
import isWindows from  './modules/isWindows';
import isVersion from './modules/IsVersioning';
import ManifestRevisionPlugin from './modules/RevManifestPlugin';

const
    config = elixir.config,
    $ = elixir.Plugins,
    filenamePattern = isVersion()
        ? '[name]-[hash]'
        : '[name]';

const webpack_config = {
    debug: !config.production,
    context: path.resolve(root.path, config.get('assets.js.folder')),
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: `${filenamePattern}.js`
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(config.production ? 'production' : 'development')
            }
        }),
        new ProgressBarPlugin(),
        new webpack.NoErrorsPlugin(),
        new ExtractTextPlugin(`${filenamePattern}.css`, {allChunks: true}),
        new BowerWebpackPlugin({
            excludes: [/.*\.less$/, /^.+\/[^\/]+\/?\*$/]
        }),
        new WebpackNotifierPlugin({
            excludeWarnings: true,
            title: 'Laravel Elixir',
            contentImage: path.resolve(root.path, 'node_modules', 'laravel-elixir', 'icons', 'laravel.png')
        })
    ],
    resolve: {
        extensions: ['', '.js']
    },
    output: {
        path: path.resolve(root.path, config.get('public.js.outputFolder')),
        publicPath: `/${config.js.outputFolder}/`,
        filename: `${filenamePattern}.js`
    },
    resolveLoader: {
        root: path.join(root.path, 'node_modules'),
        modulesDirectories: ['node_modules'],
        moduleTemplates: ['*-loader', '*'],
        extensions: ['', '.js']
    },
    watchOptions: {
        aggregateTimeout: 100
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    presets: ['es2015'],
                    plugins: ['transform-runtime']
                }
            },
            {
                test: /\.styl$/,
                loader: ExtractTextPlugin.extract(['css', 'postcss', 'stylus?resolve url'])
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract(['css', 'postcss', 'resolve-url'])
            },
            {
                test: /\.(sass|scss)$/,
                loader: ExtractTextPlugin.extract(['css', 'postcss', 'resolve-url', 'sass?sourceMap'])
            },
            {
                test: /\.html$/,
                loader: 'vue-html'
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|ttf|eot|woff|woff2)(\?.+)?$/,
                include: /(\/|\\)(node_modules|bower_components)(\/|\\)/,
                loader: 'file',
                query: {
                    name: isWindows() ? `[path]${filenamePattern}.[ext]` : '[2]',
                    regExp: '(node_modules|bower_components)/(.*)'
                }
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|ttf|eot|woff|woff2)(\?.+)?$/,
                exclude: /(\/|\\)(node_modules|bower_components)(\/|\\)/,
                loader: 'file',
                query: {
                    name: `[path]${filenamePattern}.[ext]`
                }
            }
        ]
    },
    stats: {
        colors: $.util.colors.supportsColor
    },
    postcss() {
        return [AutoPrefixer({browsers: ['last 2 versions']})];
    }
};

/**
 * Production Environment
 */
if (config.production) {
    webpack_config.devtool = null;

    // Output stats
    webpack_config.stats = Object.assign(
        webpack_config.stats,
        {
            hash: false,
            timings: false,
            chunks: false,
            chunkModules: false,
            modules: false,
            children: false,
            cached: false,
            cachedAssets: false,
            reasons: false,
            source: false,
            errorDetails: false
        }
    );

    // Optimization plugins
    webpack_config.plugins.push(
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                drop_console: true,
                unsafe: true
            }
        })
    );
}

/**
 * Development mode only
 */
if (!config.production) {
    webpack_config.devtool = 'cheap-module-eval-source-map';
}

/**
 * If versioning is enabled then change destination path
 */
if (isVersion()) {
    // Versioning files should be in version build folder
    webpack_config.output.path = path.resolve(
        root.path,
        config.publicPath,
        config.versioning.buildFolder,
        config.js.outputFolder
    );

    // Versioning plugin
    webpack_config.plugins.push(
        new ManifestRevisionPlugin(
            webpack_config.output.publicPath,
            config.get('public.versioning.buildFolder')
        )
    );
}

/**
 * Switching on specific plugin(s) when webpack task
 * triggered in standalone mode "gulp webpack" or simple "gulp"
 */
if (!isWatch()) {
    // [should be the first in plugins array]
    webpack_config.plugins.unshift(
        // AutoClean plugin
        {
            apply: compiler => {
                rimraf.sync(compiler.options.output.path)
            }
        }
    );
}

export default webpack_config;