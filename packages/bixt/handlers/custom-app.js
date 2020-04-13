module.exports = function () {
  return function customApp ({ chunk, webpackCtx }) {
    if (chunk.ext === '.js' && chunk.uri === '/_app') {
      webpackCtx.customAppFile = chunk.file;
      return true;
    }
  };
};
