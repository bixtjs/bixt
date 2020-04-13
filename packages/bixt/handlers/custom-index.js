module.exports = function () {
  return function customIndex ({ webpackCtx, chunk }) {
    if (chunk.uri === '/_index' && chunk.ext === '.html') {
      webpackCtx.customIndexFile = chunk.file;
      return true;
    }
  };
};
