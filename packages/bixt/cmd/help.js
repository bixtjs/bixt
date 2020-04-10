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
  `);

  if (err) {
    throw err;
  }
};
