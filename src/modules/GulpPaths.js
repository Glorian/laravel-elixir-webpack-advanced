"use strict";

import {isObject, values} from 'lodash';
import isVersion from './IsVersioning';
import versionPath from './VersionPath';

/**
 * Prep the Gulp src and output paths.
 *
 * @param {string|array} src
 * @param {string|null}  baseDir
 * @param {string|null}  output
 */
export default (src, baseDir, output) => {
    baseDir = baseDir || Elixir.config.get('assets.js.folder');
    output = output || Elixir.config.get('public.js.outputFolder');

    if (isObject(src)) {
        src = values(src);
    }

    if (isVersion()) {
        output = versionPath(output);
    }

    return new Elixir.GulpPaths()
        .src(src, baseDir)
        .output(output);
};