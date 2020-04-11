const path = require('path');

module.exports = ({ webpackPages, config, workDir }) => {
  const middlewares = config.middlewares.map(mw => {
    return path.join(workDir, mw);
  });

  return `
    import { LitElement, html } from 'lit-element';

    import 'litx-router';

    class BixtApp extends LitElement {
      createRenderRoot () {
        return this;
      }

      connectedCallback () {
        super.connectedCallback();

        console.log('connected');

        this.loaders = [
          ${webpackPages.map(({ name, file }) => {
            return `{
              test (view) { return view === '${name}'; },
              async load (uri) {
                const module = await import('${file}');
                if (!customElements.get('${name}')) {
                  customElements.define('${name}', module.default);
                }
              },
            }`;
          }).join(',')},
        ];

        this.middlewares = [
          ${middlewares.map(mw => {
            return `require('${mw}').default`;
          }).join(',')}
        ];
      }

      render () {
        console.log('render');

        return html\`
          <litx-router id="router"
            mode="history"
            .loaders="\${this.loaders}"
            .middlewares="\${this.middlewares}"
          >
          ${webpackPages.map(({ name, uri }) => {
            return `
            <litx-route uri="${uri}" view="${name}"></litx-route>
            `;
          }).join('\n')}
          </litx-router>
        \`;
      }
    }

    customElements.define('bixt-app', BixtApp);
  `;
};
