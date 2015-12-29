"use strict";

const elixir = require('laravel-elixir');

/**
 * Check if "watch" task is triggered
 *
 * @returns {boolean}
 */
module.exports = () => elixir.Plugins.util.env._.indexOf('watch') > -1;