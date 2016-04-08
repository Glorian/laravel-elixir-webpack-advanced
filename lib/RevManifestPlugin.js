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
        return _
            .chain(manifestObject)
            .merge(JSON.parse(fs.readFileSync(filePath)))
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
    publicPath = publicPath.replace(/^\//, '');

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

            mkpath.sync(path.dirname(filePath), 0o755);
            fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
        });
    };
};