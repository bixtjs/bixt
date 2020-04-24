module.exports = function () {
  return function webpackPage ({ chunk, pages, webpackAssets }) {
    if (chunk.ext !== '.js' && !chunk.jsExported) {
      return;
    }

    const { file, uri } = chunk;
    const name = `bixt-${pages.length}-view`;
    const loader = `
{
  test: view => view === '${name}',
  load: async view => customElements.define(view, (await import('${file}')).default),
}
    `.trim();

    pages.push({ name, uri, loader });
    webpackAssets.push({ uri, file });

    return true;
  };
};
