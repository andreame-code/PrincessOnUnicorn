import { Player } from './player.js';
import { InputHandler } from './input.js';
import { Level1 } from './levels/level1.js';
import { Level2 } from './levels/level2.js';
import { Renderer } from './renderer.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.overlay = document.getElementById('overlay');
    this.overlayContent = document.getElementById('overlay-content');
    this.overlayButton = document.getElementById('overlay-button');

    this.speed = 3;
    this.gravity = 0.4;
    this.score = 0;
    this.coins = 0;
    this.gameOver = false;
    this.win = false;
    this.gamePaused = true;

    this.params = new URLSearchParams(window.location.search);
    this.levelNumber = this.params.get('level') === '2' ? 2 : 1;

    this.groundY = canvas.height - 50;
    this.player = new Player(50, this.groundY);
    this.level = this.levelNumber === 1 ? new Level1(this) : new Level2(this);
    this.renderer = new Renderer(this);

    this.input = new InputHandler(() => this.handleInput());
    this.input.attach();

    window.addEventListener('resize', () => this.resizeCanvas());
    this.resizeCanvas();

    this.showOverlay(this.instructionsText[this.levelNumber], () => {
      this.gamePaused = false;
      this.loop();
    });
  }

  instructionsText = {
    1: 'Salta gli ostacoli premendo la barra spaziatrice o toccando lo schermo.',
    2: 'Attiva lo scudo per rompere i muri del Cavaliere Nero premendo la barra spaziatrice o toccando lo schermo.'
  };

  storyText = {
    1: 'La principessa supera la foresta e si avvicina al castello del Cavaliere Nero.',
    2: 'Il Cavaliere Nero fugge e il regno è salvo!'
  };

  showOverlay(text, onClose) {
    this.overlayContent.textContent = text;
    this.overlay.classList.remove('hidden');
    this.overlayButton.onclick = () => {
      this.overlay.classList.add('hidden');
      this.overlayButton.onclick = null;
      if (onClose) onClose();
    };
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.groundY = this.canvas.height - 50;
    if (!this.player.jumping) {
      this.player.y = this.groundY;
    }
  }

  handleInput() {
    if (this.gameOver) {
      this.reset();
      return;
    }

    if (this.gamePaused) return;

    if (this.levelNumber === 1) {
      this.player.jump();
    } else {
      this.player.activateShield();
    }
  }

  reset() {
    this.score = 0;
    this.coins = 0;
    this.gameOver = false;
    this.win = false;
    this.player = new Player(50, this.groundY);
    this.level = this.levelNumber === 1 ? new Level1(this) : new Level2(this);
    this.gamePaused = true;
    this.showOverlay(this.instructionsText[this.levelNumber], () => {
      this.gamePaused = false;
      this.loop();
    });
  }

  update() {
    this.player.update(this.gravity, this.groundY);
    this.level.update();
    if (!this.gameOver) this.score++;

    if (this.levelNumber === 1 && this.score >= 1000) {
      this.levelNumber = 2;
      this.player = new Player(50, this.groundY);
      this.level = new Level2(this);
      this.gamePaused = true;
      this.showOverlay(this.storyText[1], () => {
        this.showOverlay(this.instructionsText[2], () => {
          this.gamePaused = false;
          this.loop();
        });
      });
    }

    if (this.gameOver) this.gamePaused = true;
  }

  draw() {
    this.renderer.draw();
  }

  loop() {
    this.update();
    this.draw();
    if (!this.gameOver && !this.gamePaused) {
      requestAnimationFrame(() => this.loop());
    } else if (this.gameOver && this.win) {
      this.showOverlay(this.storyText[2], () => { this.gamePaused = false; });
    }
  }
}
