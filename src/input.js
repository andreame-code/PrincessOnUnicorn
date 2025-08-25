export class InputHandler {
  constructor(
    keyMap = {},
    { pointerEvent = 'pointerdown', pointerCallback, passive = true } = {},
  ) {
    this.keyMap = keyMap;
    this.pointerEvent = pointerEvent;
    this.pointerCallback = pointerCallback;
    this.eventOptions = passive ? { passive: true } : undefined;

    this.keyListener = (e) => {
      const cb = this.keyMap[e.code];
      if (cb && !e.repeat) cb();
    };

    this.pointerListener = () => {
      if (this.pointerCallback) this.pointerCallback();
    };
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
        this.eventOptions,
      );
  }
}

