import { Game } from './src/game.js';
import { LEVEL_UP_SCORE } from './src/config.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game');
  const menu = document.getElementById('menu');
  const playButton = document.getElementById('play-button');
  const instructionsButton = document.getElementById('instructions-button');
  const creditsButton = document.getElementById('credits-button');
  const overlay = document.getElementById('overlay');
  const overlayContent = document.getElementById('overlay-content');
  const overlayButton = document.getElementById('overlay-button');

  let game;
  playButton.addEventListener('click', () => {
    menu.classList.add('hidden');
    canvas.classList.remove('hidden');
    if (game) {
      game.reset();
    } else {
      game = new Game(canvas);
    }
  });

  const showSimpleOverlay = (text) => {
    overlayContent.textContent = text;
    overlayButton.textContent = 'Indietro';
    overlay.classList.remove('hidden');
    overlayButton.onclick = () => {
      overlay.classList.add('hidden');
      overlayButton.onclick = null;
    };
  };

  instructionsButton.addEventListener('click', () => {
    showSimpleOverlay(`Premi la barra spaziatrice o tocca lo schermo per saltare. Raggiungi ${LEVEL_UP_SCORE} punti e supera il Cavaliere Nero per vincere!`);
  });

  creditsButton.addEventListener('click', () => {
    showSimpleOverlay("Gioco realizzato quasi interamente con l'aiuto di ChatGPT.");
  });
});
