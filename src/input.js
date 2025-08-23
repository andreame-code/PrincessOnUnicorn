export class InputHandler {
  constructor(
    onAction,
    { keys = ['Space'], pointerEvent = 'pointerdown', passive = true } = {}
  ) {
    this.onAction = onAction;
    this.keys = keys;
    this.pointerEvent = pointerEvent;
    this.eventOptions = passive ? { passive: true } : undefined;

    this.keyListener = (e) => {
      if (this.keys.includes(e.code) && !e.repeat) this.onAction();
    };
    this.pointerListener = () => this.onAction();
  }

  attach() {
    document.addEventListener('keydown', this.keyListener, this.eventOptions);
    if (this.pointerEvent)
      window.addEventListener(this.pointerEvent, this.pointerListener, this.eventOptions);
  }

  detach() {
    document.removeEventListener('keydown', this.keyListener, this.eventOptions);
    if (this.pointerEvent)
      window.removeEventListener(
        this.pointerEvent,
        this.pointerListener,
        this.eventOptions
      );
  }
}
