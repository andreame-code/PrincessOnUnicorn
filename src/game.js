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
} from './config.js';

export class Game {
  constructor(canvas, randomFn = Math.random) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.overlay = new Overlay();
    this.random = randomFn;

    this.speed = GAME_SPEED; // pixels per second
    this.gravity = GRAVITY; // acceleration per second^2
    this.score = 0;
    this.coins = 0;
    this.gameOver = false;
    this.win = false;
    this.gamePaused = true;
    this.lastTime = 0;
    this.scale = 1;

    this.params = new URLSearchParams(window.location.search);
    this.levelNumber = this.params.get('level') === '2' ? 2 : 1;

    this.boundResize = this.throttle(() => this.resizeCanvas(), RESIZE_THROTTLE_MS);
    window.addEventListener('resize', this.boundResize);
    this.resizeCanvas();

      this.player = new Player(50, this.groundY, this.scale);
      this.level = this.levelNumber === 1 ? new Level1(this, this.random) : new Level2(this, this.random);
      if (typeof this.level.setScale === 'function') {
        this.level.setScale(this.scale);
      }
      this.renderer = new Renderer(this);

      this.input = new InputHandler(() => this.handleInput());
      this.input.attach();

      this.renderer.preload().then(() => {
        this.showOverlay(INSTRUCTIONS_TEXT[this.levelNumber], () => {
          this.gamePaused = false;
          this.lastTime = 0;
          requestAnimationFrame(ts => this.loop(ts));
        });
      }).catch(err => {
        console.error(err);
        this.showOverlay(INSTRUCTIONS_TEXT[this.levelNumber], () => {
          this.gamePaused = false;
          this.lastTime = 0;
          requestAnimationFrame(ts => this.loop(ts));
        });
      });
  }

  showOverlay(text, onClose) {
    this.overlay.show(text, onClose);
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
    this.canvas.width = window.innerWidth;
    // Ensure enough vertical space so the princess remains visible even at
    // the peak of her jump. If the viewport is shorter than the required
    // height, expand the canvas instead of letting the character leave the
    // field of view.
    const availableHeight = window.innerHeight || this.canvas.height;
    const minHeight = 480; // jump arc (~300) + max player height (~160) + ground
    this.canvas.height = Math.max(availableHeight, minHeight);
    this.groundY = this.canvas.height - 50;
    const widthScale = window.innerWidth / 800;
    const heightScale = this.canvas.height / 600;
    this.scale = Math.min(widthScale, heightScale, 2);
    if (this.player) {
      this.player.setScale(this.scale);
      if (!this.player.jumping) {
        this.player.y = this.groundY;
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
    this.player = new Player(50, this.groundY, this.scale);
    this.level = this.levelNumber === 1 ? new Level1(this, this.random) : new Level2(this, this.random);
    if (typeof this.level.setScale === 'function') {
      this.level.setScale(this.scale);
    }
    this.gamePaused = true;
    this.showOverlay(INSTRUCTIONS_TEXT[this.levelNumber], () => {
      this.gamePaused = false;
      this.lastTime = 0;
      this.input.attach();
      requestAnimationFrame(ts => this.loop(ts));
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
      this.player = new Player(50, this.groundY, this.scale);
      this.level = new Level2(this, this.random);
      this.level.setScale(this.scale);
      this.gamePaused = true;
      this.showOverlay(STORY_TEXT[1], () => {
        this.showOverlay(INSTRUCTIONS_TEXT[2], () => {
          this.gamePaused = false;
          this.lastTime = 0;
          requestAnimationFrame(ts => this.loop(ts));
        });
      });
    }

    if (this.gameOver) this.gamePaused = true;
  }

  draw() {
    this.renderer.draw();
  }

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const delta = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    this.update(delta);
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
