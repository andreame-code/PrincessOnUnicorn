import { Game } from './src/game.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game');
  canvas.height = 200;
  const game = new Game(canvas);
});
