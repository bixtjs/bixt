module.exports = function () {
  return function webpackHtml ({ chunk: { file, absFile, uri, ext }, staticPages, webpackAssets }) {
    if (ext !== '.html') {
      return;
    }

    const loader = '!!url-loader';
    staticPages.push({ uri, absFile, loader });
    webpackAssets.push({ uri, file });

    return true;
  };
};
