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
    this.vx = 0;
    this.moveSpeed = 3;
    this.defaultMoveSpeed = this.moveSpeed;
    this.worldWidth = 0; // to be set by game
    this.jumping = false;
    this.jumpCount = 0;
    this.maxJumps = 1;
    this.defaultMaxJumps = this.maxJumps;
    this.shieldActive = false;
    this.shieldTimer = 0;
    this.shieldCooldown = 0;
    this.shieldCooldownMax = SHIELD_COOLDOWN;
    this.speedBoostTimer = 0;
    this.wingsTimer = 0;
    this.dead = false;

    // Platforming controls (used in Level 3)
    this.platformControls = false;
    this.horizontal = 0;
    this.acceleration = 0;
    this.airAcceleration = 0;
    this.friction = 0;
    this.coyoteTimeMax = 0;
    this.coyoteTimer = 0;
    this.jumpBufferMax = 0;
    this.jumpBufferTimer = 0;
    this.jumpHoldMax = 0;
    this.jumpHoldTimer = 0;
    this.jumpHoldForce = 0;
    this.jumpKeyHeld = false;
  }

  setScale(scale) {
    this.spriteScale = scale;
  }

  enablePlatformControls({
    acceleration,
    airAcceleration,
    friction,
    coyoteTime,
    jumpBuffer,
    jumpHold,
    jumpHoldForce,
  }) {
    this.platformControls = true;
    this.acceleration = acceleration;
    this.airAcceleration = airAcceleration;
    this.friction = friction;
    this.coyoteTimeMax = coyoteTime;
    this.jumpBufferMax = jumpBuffer;
    this.jumpHoldMax = jumpHold;
    this.jumpHoldForce = jumpHoldForce;
  }

  update(gravity, groundY, delta) {
    if (this.platformControls) {
      const accel = this.jumping ? this.airAcceleration : this.acceleration;
      if (this.horizontal !== 0) {
        this.vx += this.horizontal * accel * delta;
      } else {
        if (this.vx > 0) this.vx = Math.max(0, this.vx - this.friction * delta);
        else if (this.vx < 0) this.vx = Math.min(0, this.vx + this.friction * delta);
      }
      if (this.vx > this.moveSpeed) this.vx = this.moveSpeed;
      if (this.vx < -this.moveSpeed) this.vx = -this.moveSpeed;
    }

    this.vy += gravity * delta;
    if (
      this.platformControls &&
      this.jumping &&
      this.jumpKeyHeld &&
      this.jumpHoldTimer > 0
    ) {
      this.vy -= this.jumpHoldForce * delta;
      this.jumpHoldTimer -= delta;
      if (this.jumpHoldTimer < 0) this.jumpHoldTimer = 0;
    }
    this.y += this.vy * delta;

    if (this.platformControls) {
      if (this.y + this.height / 2 >= groundY) {
        this.y = groundY - this.height / 2;
        this.vy = 0;
        this.jumping = false;
        this.jumpCount = 0;
        this.coyoteTimer = this.coyoteTimeMax;
      } else {
        this.coyoteTimer -= delta;
      }
      if (this.jumpBufferTimer > 0) {
        this.jumpBufferTimer -= delta;
        if (this.coyoteTimer > 0 || this.jumpCount < this.maxJumps) {
          this.vy = JUMP_VELOCITY;
          this.jumping = true;
          this.jumpCount++;
          this.jumpHoldTimer = this.jumpHoldMax;
          this.jumpBufferTimer = 0;
        }
      }
    } else if (this.y + this.height / 2 >= groundY) {
      this.y = groundY - this.height / 2;
      this.vy = 0;
      this.jumping = false;
      this.jumpCount = 0;
    }

    this.x += this.vx * delta;
    if (this.worldWidth) {
      const half = this.width / 2;
      if (this.x < half) this.x = half;
      if (this.x > this.worldWidth - half) this.x = this.worldWidth - half;
    }
    if (this.shieldTimer > 0) {
      this.shieldTimer -= delta;
      if (this.shieldTimer <= 0) this.shieldActive = false;
    }
    if (this.shieldCooldown > 0) {
      this.shieldCooldown -= delta;
      if (this.shieldCooldown < 0) this.shieldCooldown = 0;
    }
    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer -= delta;
      if (this.speedBoostTimer <= 0) {
        this.moveSpeed = this.defaultMoveSpeed;
        if (this.vx > 0) this.vx = this.moveSpeed;
        if (this.vx < 0) this.vx = -this.moveSpeed;
      }
    }
    if (this.wingsTimer > 0) {
      this.wingsTimer -= delta;
      if (this.wingsTimer <= 0) {
        this.maxJumps = this.defaultMaxJumps;
        if (this.jumpCount > this.maxJumps) this.jumpCount = this.maxJumps;
      }
    }
  }

  jump() {
    if (this.platformControls) {
      this.jumpBufferTimer = this.jumpBufferMax;
      this.jumpKeyHeld = true;
    } else if (this.jumpCount < this.maxJumps) {
      this.vy = JUMP_VELOCITY;
      this.jumping = true;
      this.jumpCount++;
    }
  }

  releaseJump() {
    if (this.platformControls) {
      this.jumpKeyHeld = false;
      this.jumpHoldTimer = 0;
    }
  }

  moveLeft() {
    if (this.platformControls) this.horizontal = -1;
    else this.vx = -this.moveSpeed;
  }

  moveRight() {
    if (this.platformControls) this.horizontal = 1;
    else this.vx = this.moveSpeed;
  }

  stopHorizontal() {
    if (this.platformControls) this.horizontal = 0;
    else this.vx = 0;
  }

  activateShield(
    duration = SHIELD_DURATION,
    cooldown = SHIELD_COOLDOWN
  ) {
    if (this.shieldActive) {
      this.shieldTimer = duration;
    } else if (this.shieldCooldown === 0) {
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

  activateSpeedBoost(duration, speed) {
    this.moveSpeed = speed;
    this.speedBoostTimer = duration;
    if (this.vx > 0) this.vx = this.moveSpeed;
    if (this.vx < 0) this.vx = -this.moveSpeed;
  }

  activateWings(duration, extraJumps) {
    this.maxJumps = this.defaultMaxJumps + extraJumps;
    this.wingsTimer = duration;
  }
}
