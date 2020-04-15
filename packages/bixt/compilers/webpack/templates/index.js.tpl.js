const fs = require('fs-extra');

module.exports = async ({ pages, staticPages, middlewares, customAppFile, customNotFoundFile }) => {
  const [isCustomAppExists, isCustomNotFoundExists] = await Promise.all([
    fs.exists(customAppFile),
    fs.exists(customNotFoundFile),
  ]);

  const notFoundElement = isCustomNotFoundExists ? customNotFoundFile : 'bixt/components/notfound';

  return `
  import { app } from 'bixt/app';
  import { router } from 'bixt/router';
  ${isCustomAppExists ? `import App from '${customAppFile}';` : ''}

  customElements.define('bixt-router', router({
    loaders: [
      ${pages.map(({ loader }) => loader).join(',\n')},
      {
        test: view => view === 'bixt-html-view',
        load: async view => customElements.define('bixt-html-view', (await import('bixt/components/html')).default)
      },
      {
        test: view => view === 'bixt-notfound-view',
        load: async view => customElements.define('bixt-notfound-view', (await import('${notFoundElement}')).default),
      },
    ],
    middlewares: [
      ${middlewares.map(mw => `require('${mw}').default`).join(',\n')}
    ],
    routes: [
      ${pages.map(({ name, uri, props }) => JSON.stringify({ uri, view: name, props })).join(',\n')},
      ${staticPages.map(({ uri, file }) => `{
        uri: '${uri}',
        view: 'bixt-html-view',
        props: { file: require('${file}').default },
      }`).join(',\n')},
      { uri: '*', view: 'bixt-notfound-view' },
    ],
  }));

  customElements.define('bixt-app', app(${isCustomAppExists ? 'App' : ''}));
  `.trim();
};
