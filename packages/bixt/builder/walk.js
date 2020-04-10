const klaw = require('klaw');
const { pipeline, Writable } = require('stream');

module.exports = function walk (dir, callback) {
  return new Promise((resolve, reject) => {
    pipeline(
      klaw(dir),
      new Writable({
        objectMode: true,
        async write (file, _, cb) {
          try {
            if (!file.stats.isDirectory()) {
              await callback(file.path);
            }

            cb();
          } catch (err) {
            this.destroy(err);
          }
        },
      }),

      err => {
        if (err) return reject(err);
        resolve();
      },
    );
  });
};
