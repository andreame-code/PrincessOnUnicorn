import { BaseLevel } from './baseLevel.js';
import { Obstacle } from '../obstacle.js';

// Predetermined positions (in world units travelled) where
// obstacles should appear. This acts as a very small tile map
// describing the rhythm of the level.
const LAYOUT = [5, 9, 13, 17, 22];

// Total length of the level in world units. Once the player has
// scrolled this far and all obstacles have been cleared the level
// is considered complete.
const LEVEL_LENGTH = 26;

// Level 3 - Unicornolandia as a scripted platform section
export class Level3 extends BaseLevel {
  constructor(game, random = Math.random) {
    super(game, random);
    this.layout = LAYOUT;
    this.distance = 0; // total distance travelled in world units
    this.nextIndex = 0; // next obstacle to spawn from layout
    this.levelLength = LEVEL_LENGTH;
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

    // Level complete when travelled the full length and cleared obstacles
    if (this.distance >= this.levelLength && this.obstacles.length === 0) {
      this.game.gameOver = true;
      this.game.win = true;
    }
  }
}

export { LAYOUT as LEVEL3_LAYOUT };
