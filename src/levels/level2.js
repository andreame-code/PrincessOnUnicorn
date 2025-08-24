import { BaseLevel } from './baseLevel.js';
import { Obstacle } from '../obstacle.js';
import { isColliding } from '../../collision.js';

export class Level2 extends BaseLevel {
  constructor(game, random = Math.random) {
    super(game, random);
    this.interval = 90 / 60; // seconds
    this.boss = {
      x: game.canvas.width - 100,
      y: game.groundY,
      baseWidth: 80,
      baseHeight: 100,
    };
    this.boss.width = this.boss.baseWidth * game.scale;
    this.boss.height = this.boss.baseHeight * game.scale;
    this.bossFlee = false;
    this.coins = [];
    this.initialDistance =
      this.boss.x - (this.game.player.x + this.game.player.width);
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
    const wall = new Obstacle(this.boss.x, this.game.groundY, 30, 100);
    wall.setScale(this.game.scale);
    return wall;
  }

  onObstaclePassed() {}

  handleCollision(w) {
    if (isColliding(this.game.player, w)) {
      if (this.game.player.shieldActive) {
        this.game.player.x += 20;
        this.coins.push({
          x: w.x + w.width / 2,
          y: w.y - w.height / 2,
          vy: -120,
          life: 0.5
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
      this.obstacles = this.obstacles.filter(w => w.x + w.width > 0);
    }

    this.coins.forEach(c => {
      c.x -= move;
      c.y += c.vy * delta;
      c.vy += 6 * delta;
      c.life -= delta;
    });
    this.coins = this.coins.filter(c => c.life > 0 && c.x > -10);

    const currentDistance =
      this.boss.x - (this.game.player.x + this.game.player.width);
    if (currentDistance <= this.initialDistance * 0.3) {
      this.bossFlee = true;
    }
    if (this.bossFlee) {
      this.boss.x += move;
      if (this.boss.x > this.game.canvas.width) {
        this.game.gameOver = true;
        this.game.win = true;
      }
    }
  }

  setScale(scale) {
    super.setScale(scale);
    this.boss.width = this.boss.baseWidth * scale;
    this.boss.height = this.boss.baseHeight * scale;
  }
}
