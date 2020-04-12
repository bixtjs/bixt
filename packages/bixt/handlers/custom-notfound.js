module.exports = function () {
  return function customNotFound (ctx) {
    const { chunk } = ctx;

    if (chunk.ext === '.js' && chunk.uri === '/_notfound') {
      ctx.webpackCustomNotFound = chunk.file;
      return true;
    }
  };
};
