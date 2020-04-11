const { Server } = require('../server');
const { Builder } = require('../builder');
const WebpackCompiler = require('../compilers/webpack');
const BonoCompiler = require('../compilers/bono');

module.exports = async function start (args, opts) {
  const server = new Server(opts);
  const builder = new Builder({
    ...opts,
    compilers: [
      new BonoCompiler({ server }),
      new WebpackCompiler({ server }),
    ],
  });
  await builder.build({ mode: 'production' });
  await server.listen();
};
