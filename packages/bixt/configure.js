const path = require('path');

module.exports = function configure (argv) {
  const workDir = path.resolve(argv.workDir || process.cwd());

  const config = {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    webpackConfig: c => c,
    ...argv,
    workDir,
    pageDir: path.join(workDir, 'pages'),
    srcDir: path.join(workDir, '.bixt'),
    wwwDir: path.join(workDir, 'www'),
  };
  delete config._;

  return mixin(config, getCustomConfig(workDir));
};

function getCustomConfig (workDir) {
  try {
    return require(path.join(workDir, 'bixt.config.js'));
  } catch (err) {
    // noop
  }
}

function mixin (config, customConfig) {
  if (typeof customConfig === 'function') {
    return customConfig(config);
  }

  return {
    ...config,
    ...customConfig,
  };
}
