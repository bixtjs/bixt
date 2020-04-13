const Route = require('bono/route');

module.exports = function () {
  return function webpackHtml (ctx) {
    const { chunk } = ctx;

    if (chunk.ext !== '.html') {
      return;
    }

    const { file, uri } = chunk;
    const name = `bixt-${ctx.webpackPages.length}-view`;
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
    ctx.webpackPages.push({ name, uri, loader, route });
    return true;
  };
};
