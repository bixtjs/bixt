import { LitElement, html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { shady } from '../shady';

export default class HtmlView extends shady(LitElement) {
  static get properties () {
    return {
      content: { type: String },
    };
  }

  connectedCallback () {
    super.connectedCallback();

    this.content = '';

    setTimeout(async () => {
      try {
        this.content = await load(this.file);
      } catch (err) {
        console.error('Cannot load');
      }
    });
  }

  render () {
    return html`${unsafeHTML(this.content)}`;
  }
}

async function load (file) {
  const resp = await fetch(file);
  return resp.text();
}
