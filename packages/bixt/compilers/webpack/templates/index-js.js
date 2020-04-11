module.exports = ({ webpackPages }) => {
  const tpl = `
    import { LitElement, html } from 'lit-element';

    import 'litx-router';

    const LOADERS = [
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

    class XApp extends LitElement {
      createRenderRoot () {
        return this;
      }

      render () {
        return html\`
          <litx-router id="router"
            mode="history"
            .loaders="\${LOADERS}"
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

    customElements.define('x-app', XApp);

    const app = document.createElement('x-app');
    document.body.appendChild(app);
  `;

  return tpl;
};
