module.exports = function () {
  return function webpackHtml ({ chunk: { file, absFile, uri, ext }, staticPages, webpackAssets }) {
    if (ext !== '.md') {
      return;
    }

    const loader = '!!url-loader!markdown-loader';
    staticPages.push({ uri, absFile, loader });
    webpackAssets.push({ uri, file });

    return true;
  };
};
