module.exports = function () {
  return function customApp (ctx) {
    const chunk = ctx.chunk;
    if (chunk.ext === '.js' && chunk.uri === '/_app') {
      ctx.customAppFile = chunk.file;
      return true;
    }
  };
};
