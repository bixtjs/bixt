const logInfo = require('../logger')('bixt:cmd:help');

module.exports = function () {
  logInfo(`
Usage:
  bixt [<command>] [options]

Commands:
  dev                start development (default)
  build              build static files
  start              start production server

Options:
  -h, --help         print usage information
  -d, --work-dir     change working directory (default: cwd)
  -p, --port         change port (default: 3000)
      --host         change hostname (default: 127.0.0.1)
      --https        use https (default: false)

Environment variables
  PORT               change port (default: 3000)
  HOST               change host (default: 127.0.0.1)
  `);
};
