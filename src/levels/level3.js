import { BaseLevel } from './baseLevel.js';
import { Obstacle } from '../obstacle.js';
import { ShadowCrow } from '../entities/shadowCrow.js';
import { FollettiRombo } from '../entities/follettiRombo.js';
import { ThornGuard } from '../entities/thornGuard.js';
import { isColliding, isLandingOn } from '../../collision.js';
import { JUMP_VELOCITY } from '../config.js';

// Tile identifiers inspired by tylerreichle/mario_js.
// 0 = empty, 1 = ground, 2 = platform, 3 = pipe, 4 = block
// 5 = shadow crow, 6 = folletti-rombo, 7 = thorn guard
const TILE = {
  EMPTY: 0,
  GROUND: 1,
  PLATFORM: 2,
  PIPE: 3,
  BLOCK: 4,
  SHADOW_CROW: 5,
  FOLLETTI_ROMBO: 6,
  THORN_GUARD: 7,
};

// Two dimensional map describing the level layout. Each number
// corresponds to a tile type defined above. The first row is the
// ground and subsequent rows stack upwards.
const MAP = [
  // Ground row
  [1, 1, 1, 1, 1, 1, 1, 1],
  // Tiles one unit above the ground
  [7, 2, 0, 3, 5, 2, 0, 6],
  // Tiles two units above the ground
  [0, 0, 0, 0, 4, 0, 0, 0],
];

class Platform extends Obstacle {
  constructor(x, y, size) {
    super(x, y, size, size);
    this.type = 'platform';
  }
}

class Pipe extends Obstacle {
  constructor(x, groundY, size) {
    // Pipes are two tiles tall and rest on the ground
    super(x, groundY - size, size, size * 2);
    this.type = 'pipe';
  }
}

class Block extends Obstacle {
  constructor(x, y, size) {
    super(x, y, size, size);
    this.type = 'block';
  }
}

// Level 3 - Unicornolandia converted to a tile-based platform section
export class Level3 extends BaseLevel {
  constructor(game, random = Math.random) {
    super(game, random);
    this.game.player.maxJumps = 2;
    this.map = MAP;
    this.tileSize = 1; // world units per tile
    this.distance = 0;
    this.levelLength = this.map[0].length * this.tileSize;
    this.platforms = [];
    this.pipes = [];
    this.blocks = [];
    this.enemies = [];
    this.generateFromMap();
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

  generateFromMap() {
    for (let row = 0; row < this.map.length; row++) {
      const cols = this.map[row];
      for (let col = 0; col < cols.length; col++) {
        const tile = cols[col];
        const x = this.game.worldWidth + col * this.tileSize + this.tileSize / 2;
        const y = this.game.groundY - row * this.tileSize - this.tileSize / 2;
        switch (tile) {
          case TILE.PLATFORM:
            this.platforms.push(new Platform(x, y, this.tileSize));
            break;
          case TILE.PIPE:
            this.pipes.push(new Pipe(x, this.game.groundY, this.tileSize));
            break;
          case TILE.BLOCK:
            this.blocks.push(new Block(x, y, this.tileSize));
            break;
          case TILE.SHADOW_CROW:
            this.enemies.push(
              new ShadowCrow(
                x,
                this.game.groundY - this.tileSize * 2,
                this.tileSize
              )
            );
            break;
          case TILE.FOLLETTI_ROMBO:
            this.enemies.push(
              new FollettiRombo(
                x,
                this.game.groundY - this.tileSize / 2,
                this.tileSize
              )
            );
            break;
          case TILE.THORN_GUARD:
            this.enemies.push(
              new ThornGuard(
                x,
                this.game.groundY - this.tileSize / 2,
                this.tileSize
              )
            );
            break;
          default:
            break;
        }
      }
    }
    this.obstacles = [
      ...this.platforms,
      ...this.pipes,
      ...this.blocks,
      ...this.enemies,
    ];
  }

  update(delta) {
    const move = this.getMoveSpeed() * delta;
    this.distance += move;

    const moveArr = arr => arr.forEach(e => e.update(move));
    moveArr(this.platforms);
    moveArr(this.pipes);
    moveArr(this.blocks);
    this.enemies.forEach(e => {
      const spawned = e.update(move, delta);
      if (spawned && spawned.length) {
        this.blocks.push(...spawned);
      }
    });

    const player = this.game.player;
    const collideArr = arr => {
      for (const e of arr) {
        if (isColliding(player, e)) {
          this.game.gameOver = true;
          return false;
        }
      }
      return true;
    };

    if (!collideArr(this.platforms)) return;
    if (!collideArr(this.pipes)) return;
    if (!collideArr(this.blocks)) return;

    // Handle enemy collisions and cull off-screen entities
    this.enemies = this.enemies.filter(e => {
      if (isLandingOn(player, e)) {
        player.vy = JUMP_VELOCITY / 2;
        player.jumping = true;
        player.jumpCount = 1;
        return false;
      }
      if (isColliding(player, e)) {
        this.game.gameOver = true;
        return false;
      }
      return e.x + e.width / 2 > 0;
    });

    const filterArr = arr => arr.filter(e => e.x + e.width / 2 > 0);
    this.platforms = filterArr(this.platforms);
    this.pipes = filterArr(this.pipes);
    this.blocks = filterArr(this.blocks);
    this.obstacles = [
      ...this.platforms,
      ...this.pipes,
      ...this.blocks,
      ...this.enemies,
    ];

    if (this.distance >= this.levelLength && this.obstacles.length === 0) {
      this.game.gameOver = true;
      this.game.win = true;
    }
  }

  setScale(scale) {
    [...this.platforms, ...this.pipes, ...this.blocks, ...this.enemies].forEach(
      o => o.setScale(scale)
    );
  }
}

export { MAP as LEVEL3_MAP, TILE };

