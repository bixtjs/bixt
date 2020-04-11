module.exports = function (_, { err } = {}) {
  console.info(`
    Usage:
      bixt [<command>] [options]

    Commands:
      dev                start development (default)
      build              build static files
      start              start production server

    Options:
      -h, --help         print usage information
      -d, --work-dir     change working directory (default: cwd)

    Environment variables
      PORT               change port (default: 3000)
  `);

  if (err) {
    throw err;
  }
};
