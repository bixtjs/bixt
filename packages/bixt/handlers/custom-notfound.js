module.exports = function () {
  return function customNotFound ({ chunk, webpackCtx }) {
    if (chunk.ext === '.js' && chunk.uri === '/_notfound') {
      webpackCtx.customNotFoundFile = chunk.file;
      return true;
    }
  };
};
