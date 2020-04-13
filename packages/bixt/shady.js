/**
 * Create shady element
 *
 * @param {object} Element element to wrap
 * @returns {Element}
 */
export function shady (Element) {
  class ShadyElement extends Element {
    createRenderRoot () {
      return this;
    }
  }

  return ShadyElement;
}
