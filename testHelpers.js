import { Game } from './src/game.js';

export function createStubGame({
  rng,
  canvasWidth = 800,
  innerWidth = 800,
  search = '',
  skipLevelUpdate = false,
} = {}) {
  const noop = () => {};
  const ctx = {
    clearRect: noop,
    fillRect: noop,
    beginPath: noop,
    moveTo: noop,
    lineTo: noop,
    fill: noop,
    arc: noop,
    stroke: noop,
    fillText: noop,
    measureText: () => ({ width: 0 }),
  };
  const canvas = {
    width: canvasWidth,
    height: 200,
    getContext: () => ctx,
    // Simulate how the canvas would be displayed in the browser so that
    // resize logic relying on its on-screen dimensions behaves consistently
    // in tests.
    getBoundingClientRect: () => ({
      width: innerWidth,
      height: innerWidth * 0.75, // maintain 4:3 ratio
    }),
  };
  const overlay = { classList: { add: noop, remove: noop } };
  const overlayContent = { textContent: '' };
  const overlayButton = { onclick: null, textContent: '', addEventListener: noop };

  global.document = {
    getElementById: (id) => {
      switch (id) {
        case 'game':
          return canvas;
        case 'overlay':
          return overlay;
        case 'overlay-content':
          return overlayContent;
        case 'overlay-button':
          return overlayButton;
        default:
          return null;
      }
    },
    addEventListener: noop,
    removeEventListener: noop,
  };
  const eventListeners = {};
  global.window = {
    innerWidth,
    location: { search },
    addEventListener: (event, handler) => {
      eventListeners[event] = handler;
    },
    removeEventListener: (event, handler) => {
      if (eventListeners[event] === handler) delete eventListeners[event];
    },
    dispatchEvent: (event) => {
      const handler = eventListeners[event.type];
      if (handler) handler(event);
    },
    requestAnimationFrame: noop,
    _eventListeners: eventListeners,
  };
  global.requestAnimationFrame = noop;

  const game = new Game(canvas, rng);
  game.showOverlay = noop;
  game.gamePaused = false;
  if (skipLevelUpdate) {
    game.level.update = noop;
  }
  return game;
}
