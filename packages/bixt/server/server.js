const Bundle = require('bono/bundle');
const http = require('http');
// const https = require('https');

const logInfo = require('../logger')('bixt:server:server');

const kServer = Symbol('server');

class Server extends Bundle {
  constructor ({ https = false, hostname = '127.0.0.1', port = 3000 } = {}) {
    super();

    this.hostname = hostname;
    this.port = port;
    this.https = https;
  }

  async listen () {
    if (this.https) {
      throw new Error('Unimplemented yet');
    }

    this[kServer] = http.createServer(this.callback());

    await new Promise((resolve, reject) => {
      this[kServer].listen(this.port, this.hostname, err => {
        if (err) {
          return reject(err);
        }

        logInfo(`Bixt Server listening at http${this.https ? 's' : ''}://${this.hostname}:${this.port}`);
        resolve();
      });
    });
  }
}

module.exports.Server = Server;
