const path = require('path');
const fs = require('fs-extra');

module.exports = async ({ webpackPages, config, workDir, webpackCustomApp, webpackCustomNotFound }) => {
  const middlewares = config.middlewares.map(mw => {
    return path.join(workDir, mw);
  });

  const isCustomAppExists = await fs.exists(webpackCustomApp);
  const isCustomNotFoundExists = await fs.exists(webpackCustomNotFound);

  return `
  import { app } from 'bixt/app';
  import { router } from 'bixt/router';
  ${isCustomAppExists ? `import App from '${webpackCustomApp}';` : ''}
  import NotFoundView from '${isCustomNotFoundExists ? webpackCustomNotFound : 'bixt/notfound'}';

  customElements.define('bixt-notfound-view', NotFoundView);

  customElements.define('bixt-router', router({
    loaders: [
      ${webpackPages.map(({ name, file }) => `
        {
          test (view) { return view === '${name}'; },
          async load (uri) {
            const module = await import('${file}');
            if (!customElements.get('${name}')) {
              customElements.define('${name}', module.default);
            }
          },
        }
      `.trim()).join(',')},
    ],
    middlewares: [
      ${middlewares.map(mw => `require('${mw}').default`).join(',')}
    ],
    routes: [
      ${webpackPages.map(({ name, uri }) => JSON.stringify({ uri, view: name })).join(',')},
      {
        uri: '*',
        view: 'bixt-notfound-view',
      },
    ],
  }));

  const BixtApp = app(${isCustomAppExists ? 'App' : ''});
  customElements.define('bixt-app', BixtApp);
  `.trim();
};
