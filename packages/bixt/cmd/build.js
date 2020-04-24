const { Builder } = require('../builder');

module.exports = async function build (_, config) {
  const builder = new Builder(config);
  await builder.build();
};
