const { Server } = require('../server');

module.exports = async function start (_, config) {
  const server = new Server(config);
  await server.listen();
};
