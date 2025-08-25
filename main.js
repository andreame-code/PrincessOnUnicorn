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

  let game;
  playButton.addEventListener('click', () => {
    menu.classList.add('hidden');
    canvas.classList.remove('hidden');
    if (game) {
      game.reset();
    } else {
      game = new Game(canvas);
    }
    game.resizeCanvas();
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
