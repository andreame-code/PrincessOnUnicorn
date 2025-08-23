export class Overlay {
  constructor() {
    this.element = document.getElementById('overlay');
    this.content = document.getElementById('overlay-content');
    this.button = document.getElementById('overlay-button');
  }

  show(text, onClose) {
    this.content.textContent = text;
    this.element.classList.remove('hidden');
    this.button.onclick = () => {
      this.element.classList.add('hidden');
      this.button.onclick = null;
      if (onClose) onClose();
    };
  }
}
