"use strict";

// Main modules
const
    path = require('path'),
    rimraf = require('rimraf'),
    webpack = require('webpack'),
    root = require('app-root-path'),
    elixir = require('laravel-elixir'),
    AutoPrefixer = require('autoprefixer'),
    WebpackNotifierPlugin = require('webpack-notifier'),
    BowerWebpackPlugin = require('bower-webpack-plugin'),
    ProgressBarPlugin = require('progress-bar-webpack-plugin'),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

// Built-in modules
const
    isVersioning = require('../lib/IsVersioning'),
    ManifestRevisionPlugin = require('../lib/RevManifestPlugin');

const
    config = elixir.config,
    $ = elixir.Plugins,
    filenamePattern = isVersioning()
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
                include: path.resolve(root.path, config.get('assets.js.folder')),
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
                test: /\.(png|jpg|jpeg|gif|svg|ttf|eot|woff|woff2)$/,
                include: /\/(node_modules|bower_components)\//,
                loader: 'file',
                query: {
                    name: '[2]',
                    regExp: '(node_modules|bower_components)/(.*)'
                }
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|ttf|eot|woff|woff2)$/,
                exclude: /\/(node_modules|bower_components)\//,
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

    webpack_config.plugins.push(
        new ProgressBarPlugin()
    );
}

/**
 * If versioning is enabled then change destination path
 */
if (isVersioning()) {
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
if (!elixir.isWatching()) {
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

module.exports = webpack_config;