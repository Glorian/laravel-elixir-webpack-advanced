"use strict";

const
    _ = require('lodash'),
    elixir = require('laravel-elixir'),
    config = elixir.config;

/**
 * Check if versioning enabled
 *
 * @returns {boolean}
 */
module.exports = () => config.production && _.get(config, 'versioning.enabled', false);