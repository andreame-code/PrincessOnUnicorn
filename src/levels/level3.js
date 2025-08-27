import { BaseLevel } from './baseLevel.js';
import { Obstacle } from '../obstacle.js';
import { Goomba } from '../entities/goomba.js';
import { playerEnemyCollision } from '../../collision.js';
import { JUMP_VELOCITY } from '../config.js';
const TILE_MAP = '.....O.G.O...O.G.O....OG..';
const LAYOUT = [];
const ENEMY_LAYOUT = [];
for (let i = 0; i < TILE_MAP.length; i++) {
  const ch = TILE_MAP[i];
  if (ch === 'O') LAYOUT.push(i);
  if (ch === 'G') ENEMY_LAYOUT.push(i);
}
const LEVEL_LENGTH = TILE_MAP.length;

// Level 3 - Unicornolandia as a scripted platform section
export class Level3 extends BaseLevel {
  constructor(game, random = Math.random) {
    super(game, random);
    this.layout = LAYOUT;
    this.enemyLayout = ENEMY_LAYOUT;
    this.distance = 0; // total distance travelled in world units
    this.nextIndex = 0; // next obstacle to spawn from layout
    this.nextEnemyIndex = 0; // next enemy to spawn from layout
    this.levelLength = LEVEL_LENGTH;
    this.enemies = [];
  }

  // Spawn interval from BaseLevel isn't used anymore but kept for
  // compatibility with existing code paths.
  static getInterval() {
    return Infinity;
  }

  getMoveSpeed() {
    // Slightly increase speed to keep the challenge
    return this.game.speed + 0.2;
  }

  createObstacle() {
    // Mini cactus obstacles replacing mushrooms
    const width = 0.2;
    const height = 0.4;
    const obstacle = new Obstacle(
      this.game.worldWidth + width / 2,
      this.game.groundY - height / 2,
      width,
      height
    );
    obstacle.type = 'cactus';
    obstacle.setScale(this.game.scale);
    obstacle.imageIndex = Math.floor(this.random() * 2);
    obstacle.coinAwarded = false;
    return obstacle;
  }

  createEnemy() {
    const width = 0.6;
    const height = 0.6;
    const enemy = new Goomba(
      this.game.worldWidth + width / 2,
      this.game.groundY - height / 2
    );
    enemy.setScale(this.game.scale);
    return enemy;
  }

  update(delta) {
    const move = this.getMoveSpeed() * delta;
    this.distance += move;

    // Spawn obstacles when reaching the next layout marker
    while (
      this.nextIndex < this.layout.length &&
      this.distance >= this.layout[this.nextIndex]
    ) {
      this.obstacles.push(this.createObstacle());
      this.nextIndex++;
    }

    while (
      this.nextEnemyIndex < this.enemyLayout.length &&
      this.distance >= this.enemyLayout[this.nextEnemyIndex]
    ) {
      this.enemies.push(this.createEnemy());
      this.nextEnemyIndex++;
    }

    // Move existing obstacles and handle collisions
    this.obstacles.forEach(o => o.update(move));
    this.obstacles = this.obstacles.filter(o => {
      const obstacleRight = o.x + o.width / 2;
      const playerLeft = this.game.player.x - this.game.player.width / 2;
      if (obstacleRight < playerLeft) {
        this.onObstaclePassed(o);
        return false;
      }
      return this.handleCollision(o);
    });

    this.enemies.forEach(e => e.update(move, delta));
    this.enemies = this.enemies.filter(e => {
      const enemyRight = e.x + e.width / 2;
      const playerLeft = this.game.player.x - this.game.player.width / 2;
      if (enemyRight < playerLeft) {
        return false;
      }
      return this.handleEnemyCollision(e);
    });

    // Level complete when travelled the full length and cleared obstacles
    if (
      this.distance >= this.levelLength &&
      this.obstacles.length === 0 &&
      this.enemies.length === 0
    ) {
      this.game.gameOver = true;
      this.game.win = true;
    }
  }

  handleEnemyCollision(e) {
    const result = playerEnemyCollision(this.game.player, e);
    if (result === 'top') {
      this.game.player.vy = JUMP_VELOCITY / 2;
      return false;
    }
    if (result === 'side') {
      this.game.gameOver = true;
      return false;
    }
    return true;
  }

  setScale(scale) {
    super.setScale(scale);
    this.enemies.forEach(e => e.setScale(scale));
  }
}

export { LAYOUT as LEVEL3_LAYOUT };
