import { Obstacle } from '../obstacle.js';
import { isColliding } from '../../collision.js';

export class Level2 {
  constructor(game, random = Math.random) {
    this.game = game;
    this.random = random;
    this.walls = [];
    this.wallTimer = 0;
    this.wallInterval = 90 / 60; // seconds
    this.boss = { x: game.canvas.width - 100, y: game.groundY, width: 40, height: 50 };
    this.bossFlee = false;
    this.coins = [];
    this.initialDistance =
      this.boss.x - (this.game.player.x + this.game.player.width);
  }

  update(delta) {
    const speed = this.game.speed + 120; // px per second
    const move = speed * delta;
    this.wallTimer += delta;
    if (this.wallTimer > this.wallInterval && !this.bossFlee) {
      this.walls.push(new Obstacle(this.boss.x, this.game.groundY, 30, 50));
      this.wallTimer = 0;
      this.wallInterval = (60 + this.random() * 60) / 60;
    }

    this.walls.forEach(w => w.update(move));
    this.walls = this.walls.filter(w => {
      if (w.x + w.width < 0) return false;
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
    });

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
}
