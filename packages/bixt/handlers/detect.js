const path = require('path');

module.exports = function () {
  return function detect ({ chunk }) {
    const { file } = chunk;
    const ext = chunk.ext = path.extname(file);
    if (ext === '.js') {
      try {
        chunk.jsExported = require(file);
      } catch (err) {
        chunk.esNext = true;
      }
    }
  };
};
