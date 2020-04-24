module.exports = ctx => {
  const pkg = require('../../package.json');
  return {
    name: pkg.name,
    version: pkg.version,
  };
};

module.exports.methods = ['GET'];
