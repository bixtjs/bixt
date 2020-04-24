module.exports = function () {
  return function bono ({ chunk: { jsExported, uri, file }, bonoAssets }) {
    if (!jsExported) {
      return;
    }

    bonoAssets.push({ uri, file });
  };
};
