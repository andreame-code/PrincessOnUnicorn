import { Player } from './player.js';
import { InputHandler } from './input.js';
import { Level1 } from './levels/level1.js';
import { Level2 } from './levels/level2.js';
import { Renderer } from './renderer.js';
import { Overlay } from './overlay.js';
import { INSTRUCTIONS_TEXT, STORY_TEXT } from './texts.js';
import {
  GAME_SPEED,
  GRAVITY,
  LEVEL_UP_SCORE,
  RESIZE_THROTTLE_MS,
  WORLD_WIDTH,
  WORLD_HEIGHT,
} from './config.js';

export class Game {
  constructor(canvas, randomFn = Math.random) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.overlay = new Overlay();
    this.random = randomFn;

    this.speed = GAME_SPEED; // world units per second
    this.gravity = GRAVITY; // acceleration per second^2
    this.score = 0;
    this.coins = 0;
    this.gameOver = false;
    this.win = false;
    this.gamePaused = true;
    this.lastTime = null;
    this.accumulator = 0;
    this.scale = 1; // pixels per world unit

    this.worldWidth = WORLD_WIDTH;
    this.worldHeight = WORLD_HEIGHT;

    this.params = new URLSearchParams(window.location.search);
    this.levelNumber = this.params.get('level') === '2' ? 2 : 1;

    this.boundResize = this.throttle(() => this.resizeCanvas(), RESIZE_THROTTLE_MS);
    window.addEventListener('resize', this.boundResize);

    this.initializeLevel();

    this.renderer = new Renderer(this);

    this.input = new InputHandler(() => this.handleInput());
    this.input.attach();

    this.renderer
      .preload()
      .catch(err => console.error(err))
      .finally(() => this.startGame());
  }

  showOverlay(text, onClose) {
    this.overlay.show(text, onClose);
  }

  initializeLevel() {
    const startX = 0.5 + 0.8 / 2;
    this.player = new Player(startX, this.groundY, this.scale);
    this.level = this.levelNumber === 1 ? new Level1(this, this.random) : new Level2(this, this.random);
    if (typeof this.level.setScale === 'function') {
      this.level.setScale(this.scale);
    }
  }

  startLoop() {
    this.gamePaused = false;
    this.lastTime = null;
    this.accumulator = 0;
    requestAnimationFrame(ts => this.loop(ts));
  }

  startGame() {
    this.showOverlay(INSTRUCTIONS_TEXT[this.levelNumber], () => this.startLoop());
  }

  throttle(fn, delay) {
    let timeoutId = null;
    return (...args) => {
      if (timeoutId !== null) return;
      timeoutId = setTimeout(() => {
        timeoutId = null;
        fn(...args);
      }, delay);
    };
  }

  resizeCanvas() {
    const WORLD_ASPECT = this.worldWidth / this.worldHeight;

    let { width, height } = this.canvas.getBoundingClientRect();
    if (width === 0 || height === 0) {
      width = window.innerWidth;
      height = window.innerHeight;
    }

    if (width / height > WORLD_ASPECT) {
      width = height * WORLD_ASPECT; // pillarbox
    } else {
      height = width / WORLD_ASPECT; // letterbox
    }

    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.canvas.width = width;
    this.canvas.height = height;

    this.scale = width / this.worldWidth;
    this.groundY = this.worldHeight - 0.5;

    if (this.player) {
      this.player.setScale(this.scale);
      if (!this.player.jumping) {
        this.player.y = this.groundY - this.player.height / 2;
      }
    }
    if (this.level && typeof this.level.setScale === 'function') {
      this.level.setScale(this.scale);
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
    this.input.detach();
    this.resizeCanvas();
    this.score = 0;
    this.coins = 0;
    this.gameOver = false;
    this.win = false;
    this.initializeLevel();
    this.gamePaused = true;
    this.showOverlay(INSTRUCTIONS_TEXT[this.levelNumber], () => {
      this.input.attach();
      this.startLoop();
    });
  }

  update(delta) {
    // Always apply gravity after a loss so the death animation completes.
    // Only skip gravity when the player has won, so they remain in place.
    this.player.update(this.win ? 0 : this.gravity, this.groundY, delta);
    this.level.update(delta);
    if (this.gameOver && !this.player.dead && !this.win) {
      this.player.die();
    }
    if (!this.gameOver) this.score += delta * 60;

    if (this.levelNumber === 1 && this.score >= LEVEL_UP_SCORE) {
      this.levelNumber = 2;
      this.initializeLevel();
      this.gamePaused = true;
      this.showOverlay(STORY_TEXT[1], () => {
        this.showOverlay(INSTRUCTIONS_TEXT[2], () => this.startLoop());
      });
    }

    if (this.gameOver) this.gamePaused = true;
  }

  draw() {
    this.renderer.draw();
  }

  loop(timestamp) {
    if (this.lastTime === null) {
      this.lastTime = timestamp;
      requestAnimationFrame(ts => this.loop(ts));
      return;
    }
    let delta = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    // Prevent spiral of death in case of frame drops
    if (delta > 0.25) delta = 0.25;
    this.accumulator += delta;

    const STEP = 1 / 60;
    if (!this.gamePaused) {
      while (this.accumulator >= STEP) {
        this.update(STEP);
        this.accumulator -= STEP;
      }
    } else {
      // Avoid large catch-up after pause
      this.accumulator = 0;
    }

    this.draw();

    if (this.gameOver) {
      if (this.win) {
        this.input.detach();
        this.showOverlay(STORY_TEXT[2], () => { this.gamePaused = false; });
      } else {
        requestAnimationFrame(ts => this.loop(ts));
      }
    } else if (!this.gamePaused) {
      requestAnimationFrame(ts => this.loop(ts));
    }
  }

  destroy() {
    window.removeEventListener('resize', this.boundResize);
    this.boundResize = null;
  }
}
