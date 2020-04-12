const { Server } = require('../server');
const { Builder } = require('../builder');

module.exports = async function start (args, opts) {
  const server = new Server(opts);
  const builder = new Builder({ ...opts, server });
  await builder.build({ mode: 'production' });
  await server.listen();
};
