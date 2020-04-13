const { spawn } = require('child_process');

module.exports = function sp (cmd, args, opts) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      env: { ...process.env },
      ...opts,
    });
    child.on('close', code => {
      if (code === 0) return resolve();
      reject(new Error(`Caught error on spawn: ${cmd} ${args.join(' ')}`));
    });
  });
};
