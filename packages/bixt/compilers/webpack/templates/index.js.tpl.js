const path = require('path');
const fs = require('fs-extra');

module.exports = async ({ webpackPages, config, workDir, webpackCustomApp, webpackCustomNotFound }) => {
  const middlewares = config.middlewares.map(mw => {
    return path.join(workDir, mw);
  });

  const isCustomAppExists = await fs.exists(webpackCustomApp);
  const isCustomNotFoundExists = await fs.exists(webpackCustomNotFound);
  const notFoundElement = isCustomNotFoundExists ? webpackCustomNotFound : 'bixt/notfound';

  return `
  import { app } from 'bixt/app';
  import { router } from 'bixt/router';
  ${isCustomAppExists ? `import App from '${webpackCustomApp}';` : ''}

  customElements.define('bixt-router', router({
    loaders: [
      ${webpackPages.map(({ loader }) => loader).join(',\n')},
      {
        test: view => view === 'bixt-notfound-view',
        load: async view => customElements.define('bixt-notfound-view', (await import('${notFoundElement}')).default),
      },
    ],
    middlewares: [
      ${middlewares.map(mw => `require('${mw}').default`).join(',\n')}
    ],
    routes: [
      ${webpackPages.map(({ name, uri }) => JSON.stringify({ uri, view: name })).join(',\n')},
      {
        uri: '*',
        view: 'bixt-notfound-view',
      },
    ],
  }));

  customElements.define('bixt-app', app(${isCustomAppExists ? 'App' : ''}));
  `.trim();
};
