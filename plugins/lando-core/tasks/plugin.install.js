'use strict';

const _ = require('lodash');

module.exports = lando => ({
  command: 'plugin:install',
  level: 'tasks',
  describe: 'Installs a Lando plugin',
  options: {
    global: {
      describe: 'Installs the plugin globally so that it is accessibly to all projects and not be added to the current project dependency tree.',
      alias: ['g'],
      default: false,
      boolean: true,
    },
  },
  run: options => {
    if (options.global) {
      console.log('installing global plugs bruh');
    }
    console.log('installing plugs yo');
  },
});
