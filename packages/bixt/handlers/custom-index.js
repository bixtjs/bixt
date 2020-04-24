module.exports = function () {
  return function customIndex (ctx) {
    const chunk = ctx.chunk;
    if (chunk.uri === '/_index' && chunk.ext === '.html') {
      ctx.customIndexFile = chunk.file;
      return true;
    }
  };
};
