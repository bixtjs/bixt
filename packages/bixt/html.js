import { LitElement, html as h } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

export function html (content) {
  return class HtmlElement extends LitElement {
    render () {
      return h`${unsafeHTML(content)}`;
    }
  };
}
