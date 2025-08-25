import { AssetManager } from './assetManager.js';
import { SHIELD_RANGE } from './config.js';

export class Renderer {
  constructor(game) {
    this.game = game;
    this.ctx = game.ctx;
    this.assets = new AssetManager();
    this.playerSprites = null;
    this.treeSprites = null;
    this.knightSprites = null;
    this.wallSprite = null;
    this.shieldSprite = null;
    this.playerFrameIndex = 0;
    this.playerFrameTimer = 0;
    this.frameInterval = 0.1;
    this.lastSpriteTime = 0;
    this.knightFrameIndex = 0;
    this.knightFrameTimer = 0;
    this.lastKnightTime = 0;
  }

  preload() {
    if (typeof Image === 'undefined') {
      return Promise.resolve();
    }
    const resolve = path => new URL(`../${path}`, import.meta.url).href;
    const assets = [
      { key: 'player_0', src: resolve('public/assets/sprites/principessa/princess_0.png') },
      { key: 'player_1', src: resolve('public/assets/sprites/principessa/princess_1.png') },
      { key: 'player_2', src: resolve('public/assets/sprites/principessa/princess_2.png') },
      { key: 'tree_0', src: resolve('sprites/obstacles/trees/00.png') },
      { key: 'tree_1', src: resolve('sprites/obstacles/trees/01.png') },
      { key: 'tree_2', src: resolve('sprites/obstacles/trees/02.png') },
      { key: 'knight_0', src: resolve('public/assets/sprites/cavaliere_nero/knight_0.png') },
      { key: 'knight_1', src: resolve('public/assets/sprites/cavaliere_nero/knight_1.png') },
      { key: 'knight_2', src: resolve('public/assets/sprites/cavaliere_nero/knight_2.png') },
      { key: 'wall', src: resolve('sprites/projectiles/wall/00.png') },
      { key: 'shield', src: resolve('public/assets/sprites/shield.png') },
    ];
    return this.assets.loadAll(assets).then(() => {
      this.playerSprites = {
        idle: [
          this.assets.get('player_0'),
          this.assets.get('player_1'),
        ],
        run: [
          this.assets.get('player_0'),
          this.assets.get('player_1'),
          this.assets.get('player_2'),
        ],
      };
      this.treeSprites = [
        this.assets.get('tree_0'),
        this.assets.get('tree_1'),
        this.assets.get('tree_2'),
      ];
      this.knightSprites = [
        this.assets.get('knight_0'),
        this.assets.get('knight_1'),
        this.assets.get('knight_2'),
      ];
      this.wallSprite = this.assets.get('wall');
      this.shieldSprite = this.assets.get('shield');
    });
  }

  withContext(drawFn) {
    const { ctx } = this;
    ctx.save();
    try {
      drawFn(ctx);
    } finally {
      ctx.restore();
    }
  }

  drawGround() {
    const { game } = this;
    this.withContext(ctx => {
      ctx.fillStyle = '#555';
      ctx.fillRect(0, game.groundY, game.canvas.width, 2);
    });
  }

  drawPlayer() {
    const u = this.game.player;
    this.withContext(ctx => {
      const spriteScale = u.spriteScale || 1;
      const scaledWidth = u.width * spriteScale;
      const scaledHeight = u.height * spriteScale;

      if (this.playerSprites) {
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        if (!this.lastSpriteTime) this.lastSpriteTime = now;
        const delta = (now - this.lastSpriteTime) / 1000;
        this.lastSpriteTime = now;
        this.playerFrameTimer += delta;
        const anim = this.game.gamePaused || this.game.gameOver ? 'idle' : 'run';
        const frames = this.playerSprites[anim];
        if (this.playerFrameTimer >= this.frameInterval) {
          this.playerFrameTimer = 0;
          this.playerFrameIndex = (this.playerFrameIndex + 1) % frames.length;
        }
        const img = frames[this.playerFrameIndex];
        ctx.drawImage(img, u.x, u.y - scaledHeight, scaledWidth, scaledHeight);
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillRect(u.x, u.y - scaledHeight, scaledWidth, scaledHeight);
        ctx.fillRect(u.x + scaledWidth - 10, u.y - scaledHeight - 10, 10, 10);
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.moveTo(u.x + scaledWidth, u.y - scaledHeight - 10);
        ctx.lineTo(u.x + scaledWidth + 10, u.y - scaledHeight - 30);
        ctx.lineTo(u.x + scaledWidth, u.y - scaledHeight - 20);
        ctx.fill();
        ctx.fillStyle = 'pink';
        ctx.fillRect(u.x + 5, u.y - scaledHeight - 25, 15, 15);
        ctx.fillStyle = '#f2d6cb';
        ctx.beginPath();
        ctx.arc(u.x + 12.5, u.y - scaledHeight - 30, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      if (u.shieldActive) {
        const extra = SHIELD_RANGE * spriteScale;
        if (this.shieldSprite) {
          const img = this.shieldSprite;
          const w = (img.width || scaledWidth) + extra * 2;
          const h = (img.height || scaledHeight) + extra * 2;
          const sx = u.x + scaledWidth / 2 - w / 2;
          const sy = u.y - scaledHeight / 2 - h / 2;
          ctx.drawImage(img, sx, sy, w, h);
        } else {
          ctx.strokeStyle = 'blue';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(
            u.x + scaledWidth / 2,
            u.y - scaledHeight / 2,
            scaledWidth + extra,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
      }
    });
  }

  drawObstacles() {
    const { game } = this;
    this.withContext(ctx => {
      game.level.obstacles.forEach(o => {
        const scale = o.spriteScale || 1;
        const w = o.width * scale;
        const h = o.height * scale;
        if (this.treeSprites) {
          const img = this.treeSprites[(o.imageIndex ?? 0) % this.treeSprites.length];
          ctx.drawImage(img, o.x, o.y - h, w, h);
        } else {
          ctx.fillStyle = 'green';
          ctx.fillRect(o.x, o.y - h, w, h);
        }
      });
    });
  }

  drawWalls() {
    const { game } = this;
    this.withContext(ctx => {
      if (this.wallSprite) {
        game.level.walls.forEach(w => {
          const scale = w.spriteScale || 1;
          const wWidth = w.width * scale;
          const wHeight = w.height * scale;
          ctx.drawImage(this.wallSprite, w.x, w.y - wHeight, wWidth, wHeight);
        });
      } else {
        ctx.fillStyle = 'gray';
        game.level.walls.forEach(w => {
          const scale = w.spriteScale || 1;
          const wWidth = w.width * scale;
          const wHeight = w.height * scale;
          ctx.fillRect(w.x, w.y - wHeight, wWidth, wHeight);
        });
      }
      const b = game.level.boss;
      const bw = b.width * (b.spriteScale || 1);
      const bh = b.height * (b.spriteScale || 1);
      if (this.knightSprites) {
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        if (!this.lastKnightTime) this.lastKnightTime = now;
        const delta = (now - this.lastKnightTime) / 1000;
        this.lastKnightTime = now;
        this.knightFrameTimer += delta;
        if (this.knightFrameTimer >= this.frameInterval) {
          this.knightFrameTimer = 0;
          this.knightFrameIndex = (this.knightFrameIndex + 1) % this.knightSprites.length;
        }
        const img = this.knightSprites[this.knightFrameIndex];
        ctx.drawImage(img, b.x, b.y - bh, bw, bh);
      } else {
        ctx.fillStyle = 'black';
        ctx.fillRect(b.x, b.y - bh, bw, bh);
      }
    });
  }

  drawCoins() {
    const { game } = this;
    this.withContext(ctx => {
      ctx.fillStyle = 'gold';
      game.level.coins.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  drawUI() {
    const { game } = this;
    this.withContext(ctx => {
      ctx.fillStyle = '#000';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Punteggio: ${Math.floor(game.score)}`, 10, 20);

      const coinX = game.canvas.width - 20;
      ctx.fillStyle = 'gold';
      ctx.beginPath();
      ctx.arc(coinX, 15, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.textAlign = 'right';
      ctx.fillText(`x ${game.coins}`, coinX - 10, 20);
      ctx.textAlign = 'left';

      const p = game.player;
      const iconSize = 16;
      if (this.shieldSprite) {
        ctx.drawImage(this.shieldSprite, 10, 28, iconSize, iconSize);
      } else {
        ctx.strokeStyle = 'blue';
        ctx.beginPath();
        ctx.arc(18, 36, 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      const barX = 10 + iconSize + 5;
      const barY = 30;
      const barWidth = 80;
      const barHeight = 10;
      ctx.strokeStyle = '#000';
      ctx.strokeRect(barX, barY, barWidth, barHeight);
      const progress = p.shieldCooldownMax
        ? (p.shieldCooldownMax - p.shieldCooldown) / p.shieldCooldownMax
        : 1;
      ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
      ctx.fillRect(barX, barY, barWidth * progress, barHeight);

      if (game.gameOver) {
        ctx.fillStyle = '#000';
        ctx.font = '24px sans-serif';
        const lines = game.win
          ? ['Complimenti!', 'Hai sconfitto il Cavaliere Nero!']
          : ['Game Over', 'Tocca o premi Spazio', 'per ricominciare'];
        const lineHeight = 30;
        lines.forEach((line, index) => {
          const lineWidth = ctx.measureText(line).width;
          ctx.fillText(
            line,
            (game.canvas.width - lineWidth) / 2,
            80 + index * lineHeight
          );
        });
      }
    });
  }

  draw() {
    const { ctx, game } = this;
    ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    this.drawGround();
    this.drawPlayer();
    if (game.level.obstacles) {
      this.drawObstacles();
    }
    if (game.level.walls) {
      this.drawWalls();
    }
    if (game.level.coins) {
      this.drawCoins();
    }
    this.drawUI();
  }
}

