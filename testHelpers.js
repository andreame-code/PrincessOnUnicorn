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
  const canvas = { width: canvasWidth, height: 200, getContext: () => ctx };
  const overlay = { classList: { add: noop, remove: noop } };
  const overlayContent = { textContent: '' };
  const overlayButton = { onclick: null };

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
  global.window = {
    innerWidth,
    location: { search },
    addEventListener: noop,
    removeEventListener: noop,
    requestAnimationFrame: noop,
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
