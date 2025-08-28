import { Platform } from './platform.js';
import { GRAVITY } from '../config.js';

export class FallingPlatform extends Platform {
  constructor(x, y, size, groundY) {
    super(x, y, size);
    this.groundY = groundY;
    this.stepped = false;
    this.shake = 0;
    this.falling = false;
    this.vy = 0;
    this.visible = true;
    this.kind = 'falling';
  }

  onStep() {
    if (!this.stepped) {
      this.stepped = true;
      this.shake = 0;
    }
  }

  setScale(scale) {
    super.setScale(scale);
  }

  update(move, delta = 0) {
    super.update(move);
    if (this.stepped && !this.falling) {
      this.shake += delta;
      if (this.shake >= 0.3) {
        this.falling = true;
      }
    }
    if (this.falling) {
      this.vy += GRAVITY * delta;
      this.y += this.vy * delta;
      if (this.y - this.height / 2 > this.groundY + 2) {
        this.visible = false;
      }
    }
  }
}
