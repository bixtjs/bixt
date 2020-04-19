import { LitElement, html } from 'lit-element';
import { shady } from 'bixt/shady';

export default class Home extends shady(LitElement) {
  static get properties () {
    return {
      name: { type: String },
      version: { type: String },
    };
  }

  connectedCallback () {
    super.connectedCallback();

    this.name = '.........';
    this.version = '0.0.0';

    setTimeout(async () => {
      const resp = await fetch('/api');
      const { name, version } = await resp.json();
      this.name = name;
      this.version = version;
    }, 1000);
  }

  render () {
    return html`
      <style>
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
      </style>

      <div class="container">
        <div>
          <h1>Hello world</h1>
          <p>Welcome to <strong style="color: red">bixt</strong></p>
          <p>API Status</p>
          <p>${this.name} v${this.version}</p>
        </div>
      </div>
    `;
  }

  createRenderRoot () {
    return this;
  }
}
