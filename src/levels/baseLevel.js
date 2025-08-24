import { Obstacle } from '../obstacle.js';
import { isColliding } from '../../collision.js';

export class BaseLevel {
  constructor(game, random = Math.random) {
    this.game = game;
    this.random = random;
    this.obstacles = [];
    this.timer = 0;
    this.interval = this.constructor.getInterval(this.random);
  }

  static getInterval(random) {
    return (80 + random() * 70) / 60; // seconds
  }

  createObstacle() {
    const obstacle = new Obstacle(
      this.game.canvas.width,
      this.game.groundY,
      20,
      40
    );
    obstacle.setScale(this.game.scale);
    obstacle.imageIndex = Math.floor(this.random() * 3);
    obstacle.coinAwarded = false;
    return obstacle;
  }

  getMoveSpeed() {
    return this.game.speed;
  }

  onObstaclePassed(o) {
    if (!o.coinAwarded) {
      this.game.coins++;
      o.coinAwarded = true;
    }
  }

  handleCollision(o) {
    if (isColliding(this.game.player, o)) {
      this.game.gameOver = true;
      return false;
    }
    return true;
  }

  updateObstacles(delta) {
    this.timer += delta;
    if (this.timer > this.interval) {
      this.obstacles.push(this.createObstacle());
      this.timer = 0;
      this.interval = this.constructor.getInterval(this.random);
    }
    const move = this.getMoveSpeed() * delta;
    this.obstacles.forEach(o => {
      o.update(move);
      if (o.x + o.width < this.game.player.x) {
        this.onObstaclePassed(o);
      }
    });
    this.obstacles = this.obstacles.filter(o => {
      if (o.x + o.width < 0) return false;
      return this.handleCollision(o);
    });
  }

  update(delta) {
    this.updateObstacles(delta);
  }

  setScale(scale) {
    this.obstacles.forEach(o => o.setScale(scale));
  }
}
