const { Builder } = require('../builder');

module.exports = async function build (_, opts) {
  const builder = new Builder(opts);
  await builder.build({ mode: 'production' });
};
