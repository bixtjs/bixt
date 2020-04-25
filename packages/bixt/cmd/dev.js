const { Server } = require('../server');
const { Builder } = require('../builder');

module.exports = async function dev (_, config) {
  const server = new Server(config);
  const builder = new Builder(config);
  await builder.watch(async ctx => {
    server.prepare(ctx);
    await server.detach(server._server);
    await server.attach(server._server);
  });
  await server.listen();
};
