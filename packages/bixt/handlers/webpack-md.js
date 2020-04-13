const Route = require('bono/route');

module.exports = function () {
  return function webpackMd ({ chunk, webpackCtx }) {
    if (chunk.ext !== '.md') {
      return;
    }

    const { file, uri } = chunk;
    const name = `bixt-${webpackCtx.pages.length}-view`;
    const route = new Route(uri);
    const loader = `
{
  test: view => view === '${name}',
  load: async view => {
    const html = (await import('bixt/html')).html;
    const content = (await import('${file}')).default;
    customElements.define(view, html(content));
  },
}
    `.trim();
    webpackCtx.pages.push({ name, uri, loader, route });
    return true;
  };
};
