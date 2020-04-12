const debug = require('debug');

module.exports = function (namespace, severity = 'info') {
  const log = debug(namespace);
  log.enabled = true;

  if (severity === 'info') {
    log.log = console.info;
  }

  return log;
};
