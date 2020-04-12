const { Server } = require('../server');
const { Builder } = require('../builder');

module.exports = async function dev (args, opts) {
  const server = new Server(opts);
  const builder = new Builder({ ...opts, server });
  await builder.watch({ mode: 'development' });
  await server.listen();
};
