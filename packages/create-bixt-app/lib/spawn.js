const { spawn: sp } = require('child_process');

module.exports = function spawn (cmd, args, opts) {
  return new Promise((resolve, reject) => {
    const child = sp(cmd, args, {
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
