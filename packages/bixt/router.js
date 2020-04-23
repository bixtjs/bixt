import { Router } from 'litx-router/router';
import { app } from './app';

const kClickHandler = Symbol('handler');

export function router () {
  return app().router;
}

export function defineRouter ({ loaders, middlewares, routes }) {
  class BixtRouter extends Router {
    connectedCallback () {
      this.mode = 'history';
      this.loaders = loaders;
      this.middlewares = middlewares;
      routes.map(({ uri, view, props }) => this.addRoute({ uri, view, props }));

      super.connectedCallback();
    }
  }

  customElements.define('bixt-router', BixtRouter);
}

class BixtLink extends HTMLElement {
  connectedCallback () {
    this[kClickHandler] = evt => {
      evt.preventDefault();
      const uri = evt.target.closest('a').getAttribute('href');
      router().push(uri);
    };

    this.addEventListener('click', this[kClickHandler]);
  }

  disconnectedCallback () {
    this.removeEventListener('click', this[kClickHandler]);
  }
}

customElements.define('bixt-link', BixtLink);
