import { LitElement, html } from 'lit-element';
import { shady } from './shady';

export function app (Element) {
  if (!Element) {
    Element = class extends shady(LitElement) {
      render () {
        return html`
          <></bixt-router>
        `;
      }
    };
  }

  class App extends Element {
    get router () {
      if (!this.router) {
        this.router = document.querySelector('bixt-router');
      }

      return this.router;
    }
  }

  return App;
}
