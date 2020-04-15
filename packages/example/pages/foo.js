import { LitElement, html } from 'lit-element';

export default class Foo extends LitElement {
  render () {
    return html`
      <div>
        <a href="/">Home</a>
        <a href="/foo">Foo</a>
        <a href="/bar">Bar</a>
        <a href="/about-us">About Us</a>
        <a href="/disclaimer">Disclaimer</a>
      </div>
      <div>
        [foo]
      </div>
    `;
  }

  createRenderRoot () {
    return this;
  }
}
