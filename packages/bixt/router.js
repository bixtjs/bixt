import { Router } from 'litx-router/router';

export function router ({ loaders, middlewares, routes }) {
  return class BixtRouter extends Router {
    connectedCallback () {
      this.mode = 'history';
      this.loaders = loaders;
      this.middlewares = middlewares;
      routes.map(({ uri, view, props }) => this.addRoute({ uri, view, props }));

      super.connectedCallback();
    }
  };
}
