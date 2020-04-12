module.exports = function () {
  return function bono ({ chunk: { jsExported, uri }, bundler, router }) {
    if (!jsExported) {
      return;
    }

    if (typeof jsExported === 'object') {
      bundler.set(uri, jsExported);
      return true;
    }

    const firstLine = jsExported.toString().split('\n').shift();
    if (firstLine.match(/class/)) {
      const ExportedBundle = jsExported;
      bundler.set(uri, new ExportedBundle());
      return true;
    }

    if (firstLine.match(/=>|function/)) {
      const methods = jsExported.methods || ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
      router.route(methods, uri, jsExported);
      return true;
    }
  };
};
