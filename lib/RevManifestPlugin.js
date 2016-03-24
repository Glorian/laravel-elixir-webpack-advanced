"use strict";

const
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path');

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
        const
            fileJson = JSON.parse(fs.readFileSync(filePath)),
            handler = value => {
                return !_.startsWith(value, '/')
                    ? `/${value}`
                    : value;
            };

        return _
            .chain(manifestObject)
            .merge(fileJson)
            .mapKeys((value, key) => handler(key))
            .mapValues(handler)
            .value();
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

    return function () {
        this.plugin('done', stats => {
            stats = stats.toJson();

            let
                manifest = {},
                filePath = path.join(process.cwd(), targetPath, filename);

            const buildManifestHandler = (value, key) => {
                const originalFileName = `${key}${path.extname(value)}`;

                if (_.isArray(value)) {
                    _.forEach(value, value => buildManifestHandler(value, key));
                } else {
                    return manifest[`${publicPath}${originalFileName}`] = `${publicPath}${value}`;
                }
            };

            _.forOwn(stats.assetsByChunkName, buildManifestHandler);

            manifest = mergeManifestFiles(manifest, filePath);

            fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
        });
    };
};