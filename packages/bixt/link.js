import { LitElement } from 'lit-element';
import { shady } from './shady';
import { router } from './router';

const kClickHandler = Symbol('handler');

class BixtLink extends shady(LitElement) {
  static get properties () {
    return {
      href: { type: String },
    };
  }

  connectedCallback () {
    super.connectedCallback();
    this[kClickHandler] = evt => {
      evt.preventDefault();

      let href = this.href;

      if (!href) {
        const target = evt.target.closest('a');
        if (!target) {
          return;
        }

        href = target.getAttribute('href');
      }

      if (!href) {
        return;
      }

      router().push(href);
    };

    this.addEventListener('click', this[kClickHandler]);
  }

  disconnectedCallback () {
    super.disconnectedCallback();
    this.removeEventListener('click', this[kClickHandler]);
  }
}

customElements.define('bixt-link', BixtLink);
