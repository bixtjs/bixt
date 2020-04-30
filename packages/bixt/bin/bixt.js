#!/usr/bin/env node
const configure = require('../configure');
const CMD_HELP = require('../cmd/help');
const DEFAULT_COMMAND = 'dev';
const logError = require('../logger')('bixt:bin', 'error');

(async () => {
  try {
    const argv = require('minimist')(process.argv.slice(2), {
      string: [
        'workDir',
        'host',
        'port',
      ],
      boolean: [
        'https',
        'help',
      ],
      alias: {
        d: 'workDir',
        p: 'port',
        'work-dir': 'workDir',
        h: 'help',
      },
    });
    const [command, args, opts] = parseCommand(argv);
    await command(args, opts);
  } catch (err) {
    logError(err);
    process.exit(1);
  }
})();

function parseCommand (argv) {
  if (argv.help) {
    return [CMD_HELP];
  }

  const [cmd, ...args] = argv._;

  const opts = configure(argv);

  return [require(`../cmd/${cmd || DEFAULT_COMMAND}`), args, opts];
}
