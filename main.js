import { Game } from './src/game.js';
import { LEVEL_UP_SCORE } from './src/config.js';
import { Overlay } from './src/overlay.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game');
  const menu = document.getElementById('menu');
  const playButton = document.getElementById('play-button');
  const instructionsButton = document.getElementById('instructions-button');
  const creditsButton = document.getElementById('credits-button');
  const overlay = new Overlay();
  const mobileControls = document.getElementById('mobile-controls');
  const leftBtn = document.getElementById('left-control');
  const rightBtn = document.getElementById('right-control');
  const jumpBtn = document.getElementById('jump-control');

  let game;

  const sendInput = (code, type) => {
    if (!game) return;
    game.handleInput(code, type);
  };

  const stop = e => e.stopPropagation();

  leftBtn.addEventListener('pointerdown', e => { stop(e); sendInput('ArrowLeft', 'down'); });
  leftBtn.addEventListener('pointerup', e => { stop(e); sendInput('ArrowLeft', 'up'); });
  rightBtn.addEventListener('pointerdown', e => { stop(e); sendInput('ArrowRight', 'down'); });
  rightBtn.addEventListener('pointerup', e => { stop(e); sendInput('ArrowRight', 'up'); });
  jumpBtn.addEventListener('pointerdown', e => { stop(e); sendInput('Space', 'down'); });
  jumpBtn.addEventListener('pointerup', e => { stop(e); sendInput('Space', 'up'); });

  playButton.addEventListener('click', () => {
    menu.classList.add('hidden');
    canvas.classList.remove('hidden');
    if (game) {
      game.reset();
    } else {
      game = new Game(canvas);
      game.onLevelChange = level => {
        mobileControls.classList.toggle('hidden', level !== 3);
      };
    }
    game.resizeCanvas();
    if (typeof game.onLevelChange === 'function') {
      game.onLevelChange(game.levelNumber);
    }
  });

  instructionsButton.addEventListener('click', () => {
    overlay.show(
      `Premi la barra spaziatrice o tocca lo schermo per saltare. Raggiungi ${LEVEL_UP_SCORE} punti e supera il Cavaliere Nero per vincere!`,
      null,
      'Indietro'
    );
  });

  creditsButton.addEventListener('click', () => {
    overlay.show(
      "Gioco realizzato quasi interamente con l'aiuto di ChatGPT.",
      null,
      'Indietro'
    );
  });
});
