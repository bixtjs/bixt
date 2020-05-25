module.exports = function () {
  return function webpackPage ({ chunk: { file, absFile, uri, ext, jsExported }, pages, webpackAssets }) {
    if (ext !== '.js' && !jsExported) {
      return;
    }

    const name = `bixt-${pages.length}-view`;
    const loader = `
{
  test: view => view === '${name}',
  load: async view => customElements.define(view, (await import('${absFile}')).default),
}
    `.trim();

    pages.push({ name, uri, loader });
    webpackAssets.push({ uri, file });

    return true;
  };
};
