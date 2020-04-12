module.exports = function () {
  return function customApp (ctx) {
    const { chunk } = ctx;

    if (chunk.ext === '.js' && chunk.uri === '/_app') {
      ctx.webpackCustomApp = chunk.file;
      return true;
    }
  };
};
