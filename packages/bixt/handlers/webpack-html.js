module.exports = function () {
  return function webpackHtml ({ chunk, staticPages, webpackAssets }) {
    if (chunk.ext !== '.html') {
      return;
    }

    const { file, uri } = chunk;
    const loader = '!!url-loader';
    staticPages.push({ uri, file, loader });
    webpackAssets.push({ uri, file });

    return true;
  };
};
