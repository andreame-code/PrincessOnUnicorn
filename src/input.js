export class InputHandler {
  constructor(
    keydownMap = {},
    keyupMap = {},
    { pointerEvent = 'pointerdown', pointerCallback, passive = true } = {},
  ) {
    this.keydownMap = keydownMap;
    this.keyupMap = keyupMap;
    this.pointerEvent = pointerEvent;
    this.pointerCallback = pointerCallback;
    this.eventOptions = passive ? { passive: true } : undefined;

    this.keydownListener = (e) => {
      const cb = this.keydownMap[e.code];
      if (cb && !e.repeat) cb();
    };

    this.keyupListener = (e) => {
      const cb = this.keyupMap[e.code];
      if (cb) cb();
    };

    this.pointerListener = () => {
      if (this.pointerCallback) this.pointerCallback();
    };
  }

  attach() {
    document.addEventListener('keydown', this.keydownListener, this.eventOptions);
    document.addEventListener('keyup', this.keyupListener, this.eventOptions);
    if (this.pointerEvent)
      window.addEventListener(this.pointerEvent, this.pointerListener, this.eventOptions);
  }

  detach() {
    document.removeEventListener('keydown', this.keydownListener, this.eventOptions);
    document.removeEventListener('keyup', this.keyupListener, this.eventOptions);
    if (this.pointerEvent)
      window.removeEventListener(
        this.pointerEvent,
        this.pointerListener,
        this.eventOptions,
      );
  }
}

