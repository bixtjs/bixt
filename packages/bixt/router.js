import { Router } from 'litx-router/router';

export function router ({ loaders, middlewares, routes }) {
  return class BixtRouter extends Router {
    connectedCallback () {
      // this.setAttribute('manual', '');
      this.mode = 'history';
      this.loaders = loaders;
      this.middlewares = middlewares;
      routes.map(({ uri, view }) => this.addRoute({ uri, view }));

      super.connectedCallback();
    }
  };
}
