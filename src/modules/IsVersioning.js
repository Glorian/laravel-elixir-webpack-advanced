"use strict";

import {get} from 'lodash';

/**
 * Check if versioning enabled
 *
 * @returns {boolean}
 */
export default () => Elixir.inProduction && get(Elixir.config, 'versioning.enabled', false);