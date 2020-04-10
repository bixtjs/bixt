const { Server } = require('../server');
const { Builder } = require('../builder');
const WebpackCompiler = require('../compilers/webpack');
const BonoCompiler = require('../compilers/bono');

module.exports = async function dev (args, opts) {
  const server = new Server(opts);
  const builder = new Builder({
    ...opts,
    compilers: [
      new BonoCompiler({ server }),
      new WebpackCompiler({ server }),
    ],
  });
  await builder.watch();
  await server.listen();
};
