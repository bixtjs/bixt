module.exports = function () {
  return function bonoBundle ({ chunk: { jsExported, uri }, bonoCtx: { bundler } }) {
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
  };
};
