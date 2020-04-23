import { LitElement, html } from 'lit-element';
import { shady } from './shady';

const kRouter = Symbol('router');

let instance;

export function app () {
  if (!instance) {
    instance = document.querySelector('bixt-app');
  }

  return instance;
}

export function defineApp (Element) {
  if (customElements.get('bixt-app')) {
    throw new Error('App already defined');
  }

  if (!Element) {
    Element = class extends shady(LitElement) {
      render () {
        return html`
          <bixt-router></bixt-router>
        `;
      }
    };
  }

  class App extends Element {
    get router () {
      if (!this[kRouter]) {
        this[kRouter] = this.querySelector('bixt-router') || this.shadowRoow.querySelector('bixt-router');
      }

      return this[kRouter];
    }
  }

  customElements.define('bixt-app', App);
}
