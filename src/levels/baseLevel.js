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
    // Obstacles move faster, so shorten spawn intervals to keep spacing consistent.
    return (75 + random() * 60) / 60; // seconds
  }

  createObstacle() {
    // Reduce tree size by 20% to make them less intrusive.
    const width = 0.32;
    const height = 0.64;
    const obstacle = new Obstacle(
      this.game.worldWidth + width / 2,
      this.game.groundY - height / 2,
      width,
      height
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
      if (this.game.renderer && this.game.renderer.playSound) {
        this.game.renderer.playSound('coin');
      }
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
    });
    this.obstacles = this.obstacles.filter(o => {
      const obstacleRight = o.x + o.width / 2;
      const playerLeft = this.game.player.x - this.game.player.width / 2;
      if (obstacleRight < playerLeft) {
        this.onObstaclePassed(o);
        return false;
      }
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
