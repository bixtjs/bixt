export function shady (Element) {
  class ShadyElement extends Element {
    createRenderRoot () {
      return this;
    }
  }

  return ShadyElement;
}
