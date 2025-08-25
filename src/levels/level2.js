import { BaseLevel } from './baseLevel.js';
import { Obstacle } from '../obstacle.js';
import { isColliding } from '../../collision.js';
import { SHIELD_RANGE } from '../config.js';

export class Level2 extends BaseLevel {
  constructor(game, random = Math.random) {
    super(game, random);
    this.interval = 90 / 60; // seconds
    this.boss = {
      x: game.worldWidth - 1 + 0.8 / 2,
      y: game.groundY - 1 / 2,
      width: 0.8,
      height: 1,
      spriteScale: game.scale,
    };
    this.bossFlee = false;
    this.coins = [];
    this.initialDistance =
      (this.boss.x - this.boss.width / 2) -
      (this.game.player.x + this.game.player.width / 2);
  }

  static getInterval(random) {
    return (60 + random() * 60) / 60;
  }

  get walls() {
    return this.obstacles;
  }

  getMoveSpeed() {
    return this.game.speed + 120;
  }

  createObstacle() {
    // The knight's thrown wall should be half as thick
    // Width reduced from 60 to 30 before scaling
    const width = 0.3;
    const height = 1;
    const wall = new Obstacle(
      this.boss.x - this.boss.width / 2 + width / 2,
      this.game.groundY - height / 2,
      width,
      height
    );
    wall.setScale(this.game.scale);
    return wall;
  }

  onObstaclePassed() {}

  handleCollision(w) {
    const player = this.game.player;
    // Shield range is defined in world units and should not scale with the
    // sprite size so that collisions remain consistent regardless of
    // rendering scale.
    const range = player.shieldActive ? SHIELD_RANGE : 0;
    const collider = player.shieldActive
      ? { x: player.x, y: player.y, width: player.width + range * 2, height: player.height }
      : player;

    if (isColliding(collider, w)) {
      if (player.shieldActive) {
        player.x += 0.2;
        this.coins.push({
          x: w.x,
          y: w.y,
          vy: -1.2,
          life: 0.5,
        });
        this.game.coins++;
        return false;
      }
      this.game.gameOver = true;
      return false;
    }
    return true;
  }

  update(delta) {
    const move = this.getMoveSpeed() * delta;
    if (!this.bossFlee) {
      super.updateObstacles(delta);
    } else {
      this.obstacles.forEach(w => w.update(move));
      this.obstacles = this.obstacles.filter(w => w.x + w.width / 2 > 0);
    }

    this.coins.forEach(c => {
      c.x -= move;
      c.y += c.vy * delta;
      c.vy += 0.06 * delta;
      c.life -= delta;
    });
    this.coins = this.coins.filter(c => c.life > 0 && c.x > -0.1);

    const currentDistance =
      (this.boss.x - this.boss.width / 2) -
      (this.game.player.x + this.game.player.width / 2);
    if (currentDistance <= this.initialDistance * 0.3) {
      this.bossFlee = true;
    }
    if (this.bossFlee) {
      this.boss.x += move;
      if (this.boss.x - this.boss.width / 2 > this.game.worldWidth) {
        this.game.gameOver = true;
        this.game.win = true;
      }
    }
  }

  setScale(scale) {
    super.setScale(scale);
    this.boss.spriteScale = scale;
  }
}
