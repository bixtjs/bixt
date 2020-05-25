const path = require('path');

module.exports = function () {
  return function detect ({ chunk }) {
    const { absFile } = chunk;
    const ext = chunk.ext = path.extname(absFile);
    if (ext === '.js') {
      try {
        chunk.jsExported = require(absFile);
      } catch (err) {
        chunk.esNext = true;
      }
    }
  };
};
