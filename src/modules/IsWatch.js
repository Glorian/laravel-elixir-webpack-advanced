"use strict";

import elixir from 'laravel-elixir';

/**
 * Check if "watch" task is triggered
 *
 * @returns {boolean}
 */
export default () => elixir.Plugins.util.env._.indexOf('watch') > -1;