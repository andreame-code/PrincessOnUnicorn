import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  JUMP_FORCE,
  SHIELD_DURATION,
  SHIELD_COOLDOWN,
} from './config.js';

export class Player {
  constructor(x, groundY) {
    this.x = x;
    this.y = groundY; // bottom position
    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
    this.vy = 0;
    this.jumping = false;
    this.shieldActive = false;
    this.shieldTimer = 0;
    this.shieldCooldown = 0;
  }

  update(gravity, groundY) {
    this.vy += gravity;
    this.y += this.vy;
    if (this.y >= groundY) {
      this.y = groundY;
      this.vy = 0;
      this.jumping = false;
    }
    if (this.shieldTimer > 0) {
      this.shieldTimer--;
      if (this.shieldTimer === 0) this.shieldActive = false;
    }
    if (this.shieldCooldown > 0) {
      this.shieldCooldown--;
    }
  }

  jump() {
    if (!this.jumping) {
      this.vy = JUMP_FORCE;
      this.jumping = true;
    }
  }

  activateShield(duration = SHIELD_DURATION, cooldown = SHIELD_COOLDOWN) {
    if (!this.shieldActive && this.shieldCooldown === 0) {
      this.shieldActive = true;
      this.shieldTimer = duration;
      this.shieldCooldown = cooldown;
    }
  }
}
