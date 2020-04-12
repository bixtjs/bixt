module.exports = function () {
  return function customIndex (ctx) {
    const { chunk } = ctx;

    if (chunk.uri === '/_index' && chunk.ext === '.html') {
      ctx.webpackCustomIndex = chunk.file;
      return true;
    }
  };
};
