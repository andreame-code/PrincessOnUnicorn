export class Overlay {
  constructor() {
    this.element = document.getElementById('overlay');
    this.content = document.getElementById('overlay-content');
    this.button = document.getElementById('overlay-button');
    this.defaultButtonText = this.button.textContent;
    this.onClose = null;
    this.button.addEventListener('click', () => this.hide());
  }

  show(text, onClose, buttonText = this.defaultButtonText) {
    this.content.textContent = text;
    this.button.textContent = buttonText;
    this.onClose = onClose;
    this.element.classList.remove('hidden');
  }

  hide() {
    this.element.classList.add('hidden');
    const cb = this.onClose;
    this.onClose = null;
    if (cb) cb();
  }
}
