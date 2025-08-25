import {
  JUMP_VELOCITY,
  SHIELD_COOLDOWN,
  SHIELD_DURATION
} from './config.js';

export class Player {
  constructor(x, groundY, scale = 1) {
    this.x = x;
    this.baseWidth = 0.8;
    this.baseHeight = 0.8;
    // Physical hitbox dimensions remain in world units, independent of the
    // sprite scale used for rendering.
    this.width = this.baseWidth;
    this.height = this.baseHeight;
    this.y = groundY - this.height / 2;
    this.spriteScale = scale;
    this.vy = 0;
    this.jumping = false;
    this.shieldActive = false;
    this.shieldTimer = 0;
    this.shieldCooldown = 0;
    this.shieldCooldownMax = SHIELD_COOLDOWN;
    this.dead = false;
  }

  setScale(scale) {
    this.spriteScale = scale;
  }

  update(gravity, groundY, delta) {
    this.vy += gravity * delta;
    this.y += this.vy * delta;
    if (this.y + this.height / 2 >= groundY) {
      this.y = groundY - this.height / 2;
      this.vy = 0;
      this.jumping = false;
    }
    if (this.shieldTimer > 0) {
      this.shieldTimer -= delta;
      if (this.shieldTimer <= 0) this.shieldActive = false;
    }
    if (this.shieldCooldown > 0) {
      this.shieldCooldown -= delta;
      if (this.shieldCooldown < 0) this.shieldCooldown = 0;
    }
  }

  jump() {
    if (!this.jumping) {
      this.vy = JUMP_VELOCITY;
      this.jumping = true;
    }
  }

  activateShield(
    duration = SHIELD_DURATION,
    cooldown = SHIELD_COOLDOWN
  ) {
    if (!this.shieldActive && this.shieldCooldown === 0) {
      this.shieldActive = true;
      this.shieldTimer = duration;
      this.shieldCooldown = cooldown;
      this.shieldCooldownMax = cooldown;
    }
  }

  die(speed = -2) {
    this.dead = true;
    this.vy = speed;
  }
}
