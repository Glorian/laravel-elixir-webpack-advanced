/**
 * @author Jonathan Rajavuori <jrajav@gmail.com>
 * @licence MIT
 *
 * Repository: https://github.com/jrajav/mkpath
 */

const
    fs = require('fs'),
    path = require('path');

/**
 * Asynchronous creating dir
 *
 * @param dirpath
 * @param mode
 * @param callback
 */
const mkpath = (dirpath, mode, callback) => {
    dirpath = path.resolve(dirpath);

    if (typeof mode === 'function' || typeof mode === 'undefined') {
        callback = mode;
        mode = 0o777 & (~process.umask());
    }

    if (!callback) {
        callback = () => {};
    }

    fs.stat(dirpath, (err, stats) => {
        if (err) {
            if (err.code === 'ENOENT') {
                mkpath(path.dirname(dirpath), mode, err => {
                    if (err) {
                        callback(err);
                    } else {
                        fs.mkdir(dirpath, mode, err => {
                            if (!err || err.code == 'EEXIST') {
                                callback(null);
                            } else {
                                callback(err);
                            }
                        });
                    }
                });
            } else {
                callback(err);
            }
        } else if (stats.isDirectory()) {
            callback(null);
        } else {
            callback(new Error(dirpath + ' exists and is not a directory'));
        }
    });
};

/**
 * Synchronous creating dir
 *
 * @param dirpath
 * @param mode
 */
mkpath.sync = (dirpath, mode) => {
    dirpath = path.resolve(dirpath);

    if (typeof mode === 'undefined') {
        mode = 0o777 & (~process.umask());
    }

    try {
        if (!fs.statSync(dirpath).isDirectory()) {
            throw new Error(dirpath + ' exists and is not a directory');
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            mkpath.sync(path.dirname(dirpath), mode);
            fs.mkdirSync(dirpath, mode);
        } else {
            throw err;
        }
    }
};

module.exports = mkpath;
