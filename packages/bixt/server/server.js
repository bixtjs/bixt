const Bundle = require('bono/bundle');
const Router = require('bono/router');
const Bundler = require('bono/bundler');
const http = require('http');
const path = require('path');
// const https = require('https');

const kServerHook = Symbol('serverHook');
const logInfo = require('../logger')('bixt:server:server');

const NOOP = () => undefined;
const DEFAULT_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

class Server extends Bundle {
  constructor ({ https = false, hostname = '127.0.0.1', port = 3000, srcDir, wwwDir, serverHook = NOOP } = {}) {
    super();

    this.hostname = hostname;
    this.port = port;
    this.https = https;
    this.wwwDir = wwwDir;
    this[kServerHook] = serverHook;

    let config = {};
    try {
      config = require(path.join(srcDir, 'bono.config'));
    } catch (err) {
      // noop
    }

    this.prepare(config);
  }

  prepare ({ mode = 'production', bonoAssets = [], webpackAssets = [], hotMiddleware }) {
    const router = new Router();
    const bundler = new Bundler();

    bonoAssets.forEach(({ uri, file, jsExported }) => {
      if (!jsExported) {
        jsExported = require(file);
      }

      const firstLine = jsExported.toString().split('\n').shift();
      if (firstLine.match(/=>|function/)) {
        const methods = jsExported.methods || DEFAULT_METHODS;
        router.route(methods, uri, jsExported);
        return;
      }

      if (typeof jsExported === 'object') {
        bundler.set(uri, jsExported);
        return;
      }

      if (firstLine.match(/class/)) {
        const ExportedBundle = jsExported;
        bundler.set(uri, new ExportedBundle());
        return true;
      }
    });

    this.router = router;
    this.bundler = bundler;

    this.middleware.splice(0, this.middleware.length - 1);

    if (hotMiddleware) {
      this.use(hotMiddleware);
    }

    this.use(require('bono/middlewares/json')({ debug: mode === 'development' }));
    this.use(require('./middleware')({ webpackAssets, wwwDir: this.wwwDir }));
  }

  async listen () {
    if (this.https) {
      throw new Error('Unimplemented yet');
    }

    const server = http.createServer(this.callback());

    await this.attach(server);

    await new Promise((resolve, reject) => {
      server.listen(this.port, this.hostname, err => {
        if (err) {
          return reject(err);
        }

        logInfo(`Bixt Server listening at http${this.https ? 's' : ''}://${this.hostname}:${this.port}`);
        resolve();
      });
    });
  }

  async attach (server) {
    const hook = this[kServerHook];
    await hook(server);
  }
}

module.exports.Server = Server;
