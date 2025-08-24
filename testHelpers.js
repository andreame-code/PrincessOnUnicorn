import { Game } from './src/game.js';

export function createStubGame({
  rng,
  canvasWidth = 800,
  canvasHeight = 200,
  innerWidth = 800,
  innerHeight = canvasHeight,
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
  const canvas = { width: canvasWidth, height: canvasHeight, getContext: () => ctx };
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
    innerHeight,
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
