module.exports = function () {
  return function customNotFound (ctx) {
    const chunk = ctx.chunk;
    if (chunk.ext === '.js' && chunk.uri === '/_notfound') {
      ctx.customNotFoundFile = chunk.file;
      return true;
    }
  };
};
