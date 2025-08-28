import { Platform } from './platform.js';

export class CloudPlatform extends Platform {
  constructor(x, y, size) {
    super(x, y, size);
    this.visible = true;
    this.stepped = false;
    this.timer = 0;
    this.respawn = 0;
    this.kind = 'cloud';
  }

  onStep() {
    this.stepped = true;
  }

  setScale(scale) {
    super.setScale(scale);
  }

  update(move, delta = 0) {
    super.update(move);
    if (!this.visible) {
      this.respawn += delta;
      if (this.respawn >= 3) {
        this.visible = true;
        this.respawn = 0;
        this.stepped = false;
        this.timer = 0;
      }
      return;
    }
    if (this.stepped) {
      this.timer += delta;
      if (this.timer >= 1.2) {
        this.visible = false;
        this.respawn = 0;
      }
    }
  }
}
