/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

/**
 * # Dependencies
 */

const utils = require('../utils');

/**
 * # ojet serve command
 * 'ojet serve ...'
 *
 * @public
 */

module.exports = (platform, options) => {
  utils.validateOptions(options, 'serve');
  let serveOptions = _validateDestination(options);
  serveOptions = _validateLivereload(serveOptions);
  serveOptions.platform = utils.validatePlatform(platform);
  serveOptions.buildOptions = utils.getBuildCustomizedConfig();

  serveOptions.buildType = options.release ? 'release' : 'dev';
  serveOptions.buildConfig = options['build-config'];
  serveOptions.build = options.build;
  serveOptions.destination = options.destination;

  serveOptions.livereload = options.livereload;
  serveOptions.livereloadPort = options['livereload-port'];
  serveOptions.port = options['server-port'];
  serveOptions.theme = options.theme;
  serveOptions.themes = utils.validateThemes(options.themes);
  serveOptions.svg = options.svg;
  serveOptions.sassCompile = options.sass;
  serveOptions.platformOptions = utils.validatePlatformOptions(options['platform-options'], serveOptions.platform);
  const serveConfig = utils.getServeCustomizedConfig();
  serveOptions.connect = utils.validateServeOptions(serveConfig, 'connect', serveOptions.platform);
  serveOptions.watch = utils.validateServeOptions(serveConfig, 'watch', serveOptions.platform);

  if (serveOptions.buildType === 'release') {
    serveOptions.livereload = false;
  }
  const tooling = utils.loadTooling();
  if (serveOptions.sass) delete serveOptions.sass;
  tooling.serve(serveOptions.platform, serveOptions)
    .then(() => {
      console.log('Serve finished!');
    })
    .catch(error => console.log(error));
};

/**
 * # Private functions
 * ## _getDestinationShortcut
 * valuate flag for possible deprecation
 *
 * @private
 * @returns {string} destinationShortcut
 */
function _getDestinationShortcut(options) {
  const destinationShortcuts = {
    browser: options.browser,
    device: options.device,
    emulator: options.emulator,
    'server-only': options['server-only']
  };

  let size = 0;
  let shortcut = '';

  Object.keys(destinationShortcuts).forEach((key) => {
    if (destinationShortcuts[key]) {
      size += 1;
      shortcut = `${key}:${destinationShortcuts[key]}`;
    }
  });

  if (size > 1) {
    throw utils.toError('Only one of \'device/emulator/browser/server-only\' options should be specified');
  }

  return shortcut;
}

/**
 * ## _getValidDestination
 *
 * @private
 */
function _validateDestination(options) {
  const destination = options.destination;
  const destinationShortcut = _getDestinationShortcut(options);
  const newOptions = options;
  if (destination && destinationShortcut) {
    throw utils.toError('Only one of \'destination/device/emulator/browser/server-only\' options should be specified');
  }

  if (destination || destinationShortcut) {
    newOptions.destination = destination || destinationShortcut;
  }

  return newOptions;
}

/**
 * ## _validateLivereload
 * Temporary fix since we still support 'disableLiveReload' flag.
 * Such a value needs to be negated due to 'negative' name
 *
 * @private
 */
function _validateLivereload(options) {
  const newOptions = options;
  if (options.disableLiveReload) {
    newOptions.livereload = false;
  }
  return newOptions;
}
