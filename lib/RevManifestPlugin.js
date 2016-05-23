"use strict";

const
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    mkpath = require('./MkPath');

/**
 * Merging with exists manifest file
 *
 * @param manifestObject
 * @param filePath
 * @returns object
 */
const mergeManifestFiles = (manifestObject, filePath) => {
    if (!fs.existsSync(filePath)) {
        return manifestObject;
    }

    try {
        return _.merge(JSON.parse(fs.readFileSync(filePath)), manifestObject);
    } catch (ex) {
        return manifestObject;
    }
};

/**
 * Revision Webpack plugin
 * Extracting hashed assets path to manifest file.
 *
 * @param publicPath
 * @param targetPath
 * @param filename
 * @returns {Function}
 */
module.exports = function (publicPath, targetPath, filename) {
    filename = filename || 'rev-manifest.json';
    publicPath = publicPath.replace(/^\//, '');

    return function () {
        this.plugin('done', stats => {
            let manifest = {},
                filePath = path.join(process.cwd(), targetPath, filename);

            /**
             * Recursively change manifest object
             *
             * @param value
             * @param key
             * @returns {string}
             */
            const buildManifestHandler = (value, key) => {
                if (_.isArray(value)) {
                    _.forEach(value, value => buildManifestHandler(value, key));
                } else {
                    const originalFileName = `${key}${path.extname(value)}`;

                    return manifest[`${publicPath}${originalFileName}`] = `${publicPath}${value}`;
                }
            };

            _.forOwn(stats.toJson().assetsByChunkName, buildManifestHandler);

            manifest = mergeManifestFiles(manifest, filePath);

            mkpath(path.dirname(filePath), 0o755, err => {
                if (err) {
                    throw err;
                }

                fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
            });
        });
    };
};