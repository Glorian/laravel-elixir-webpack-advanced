"use strict";

const
    elixir = require('laravel-elixir'),
    webpack = require('webpack'),
    _ = require('underscore'),
    root = require('app-root-path'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    path = require('path');

let filename = '[name].js',
    config = elixir.config;

const webpack_config = {
    debug: !config.production,
    context: path.resolve(root.path, config.get('assets.js.folder')),
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(config.production ? 'production' : 'development')
            }
        }),
        new webpack.NoErrorsPlugin(),
        new ExtractTextPlugin('[name].css', {allChunks: true})
    ],
    resolve: {
        extensions: ['', '.js']
    },
    output: {
        path: path.resolve(root.path, config.get('public.js.outputFolder')),
        publicPath: `/${config.js.outputFolder}/`,
        filename
    },
    resolveLoader: {
        root: path.join(root.path, 'node_modules'),
        modulesDirectories: ['node_modules'],
        moduleTemplates: ['*-loader', '*'],
        extensions: ['', '.js']
    },
    devtool: !config.production ? 'cheap-module-source-map' : null,
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
                loader: ExtractTextPlugin.extract(['css', 'autoprefixer?browsers=last 2 versions', 'stylus?resolve url'])
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract(['css', 'autoprefixer?browsers=last 2 versions', 'resolve-url'])
            },
            {
                test: /\.(sass|scss)$/,
                loader: ExtractTextPlugin.extract(['css', 'autoprefixer?browsers=last 2 versions', 'resolve-url', 'sass?sourceMap'])
            },
            {
                test: /\.(png|jpg|svg|ttf|eot|woff|woff2)$/,
                include: /\/(node_modules|bower_components)\//,
                loader: 'url',
                query: {
                    name: '[1].[ext]',
                    limit: 4096,
                    regExp: /(node_modules|bower_components)\/(.*)/
                }
            },
            {
                test: /\.(png|jpg|svg|ttf|eot|woff|woff2)$/,
                exclude: /\/(node_modules|bower_components)\//,
                loader: 'url',
                query: {
                    name: '[path][name].[ext]',
                    limit: 4096
                }
            }
        ]
    }
};

/**
 * Production Environment
 */
if (config.production) {
    webpack_config.plugins.push(
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                drop_console: true,
                unsafe: true
            }
        })
    );
}

module.exports = webpack_config;