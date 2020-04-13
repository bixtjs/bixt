module.exports = function () {
  return function bonoRoute ({ chunk: { jsExported, uri }, bonoCtx: { router } }) {
    if (!jsExported) {
      return;
    }

    const firstLine = jsExported.toString().split('\n').shift();
    if (firstLine.match(/=>|function/)) {
      const methods = jsExported.methods || ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
      router.route(methods, uri, jsExported);
      return true;
    }
  };
};
