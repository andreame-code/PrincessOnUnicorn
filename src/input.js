export class InputHandler {
  constructor(onAction) {
    this.onAction = onAction;
    this.keyListener = (e) => {
      if (e.code === 'Space') this.onAction();
    };
    this.pointerListener = () => this.onAction();
  }

  attach() {
    document.addEventListener('keydown', this.keyListener);
    window.addEventListener('pointerdown', this.pointerListener);
  }

  detach() {
    document.removeEventListener('keydown', this.keyListener);
    window.removeEventListener('pointerdown', this.pointerListener);
  }
}
