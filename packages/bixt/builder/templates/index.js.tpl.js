const fs = require('fs-extra');

module.exports = async ({ pages, staticPages, customAppFile, customNotFoundFile, config }) => {
  const [isCustomAppExists, isCustomNotFoundExists] = await Promise.all([
    fs.exists(customAppFile),
    fs.exists(customNotFoundFile),
  ]);

  const notFoundElement = isCustomNotFoundExists ? customNotFoundFile : 'bixt/components/notfound';

  return `
import { defineApp } from 'bixt/app';
import { defineRouter } from 'bixt/router';
${isCustomAppExists ? `import App from '${customAppFile}';` : ''}
import 'bixt/link';

defineRouter({
  loaders: [
${pages.map(({ loader }) => loader).join(',\n')},
{
  test: view => view === 'bixt-html-view',
  load: async view => customElements.define(view, (await import('bixt/components/html')).default)
},
{
  test: view => view === 'bixt-notfound-view',
  load: async view => customElements.define(view, (await import('${notFoundElement}')).default),
},
    ],
  middlewares: [
    ${(config.middlewares || []).map(mw => `require('${mw}').default`).join(',\n')}
  ],
  routes: [
${pages.map(({ name, uri }) => `{
  uri: '${uri}',
  view: '${name}',
}`).join(',\n')},
${staticPages.map(({ uri, loader, absFile }) => `{
  uri: '${uri}',
  view: 'bixt-html-view',
  props: { file: require('${loader}!${absFile}').default },
}`).join(',\n')},
{
  uri: '*',
  view: 'bixt-notfound-view',
},
  ],
});

defineApp(${isCustomAppExists ? 'App' : ''});
  `.trim();
};
