import { GRAVITY } from '../config/physics.js';

export class Player {
  constructor({ x=2, y=0, width=0.6, height=1.0 }) {
    this.x = x; this.y = y;
    this.w = width; this.h = height;
    this.vx = 0; this.vy = 0;
    this.onGround = true;
    this.jumpVelocity = Math.sqrt(2 * GRAVITY * 1.2);
  }

  setJumpHeight(h){
    this.jumpVelocity = Math.sqrt(2 * GRAVITY * h);
  }

  jump(){
    if (this.onGround) {
      this.vy = -this.jumpVelocity;
      this.onGround = false;
    }
  }

  step(dt, groundY=0){
    this.vy += GRAVITY * dt;
    this.y  += this.vy * dt;
    if (this.y + this.h >= groundY) {
      this.y = groundY - this.h;
      this.vy = 0;
      this.onGround = true;
    }
  }
}
