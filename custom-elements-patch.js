/**
 * Patch customElements.define to ignore re-definitions.
 * This avoids errors when the same Custom Element is registered more than once.
 */
if (window.customElements) {
  const origDefine = window.customElements.define.bind(window.customElements);
  window.customElements.define = function(name, constructor, options) {
    if (!window.customElements.get(name)) {
      origDefine(name, constructor, options);
    }
  };
}
