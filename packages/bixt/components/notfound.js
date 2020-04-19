import { LitElement, html } from 'lit-element';
import { shady } from '../shady';

export default class NotFoundView extends shady(LitElement) {
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

        a {
          text-decoration: none;
          color: #666;
        }
      </style>

      <div class="container">
        <div>
          <h1>This page could not be found</h1>
          <p>
            <a href="/">Back to the home page</a>
          </p>
        </div>
      </div>
    `;
  }
}
