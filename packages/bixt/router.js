import { Router } from 'litx-router/router';
import { app } from './app';

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
