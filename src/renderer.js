import { AssetManager } from './assetManager.js';

export class Renderer {
  constructor(game) {
    this.game = game;
    this.ctx = game.ctx;
    this.assets = new AssetManager();
    this.playerSprites = null;
    this.treeSprites = null;
    this.knightSprites = null;
    this.wallSprite = null;
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
    const assets = [
      { key: 'player_idle_0', src: 'sprites/player/princess/idle/00.png' },
      { key: 'player_idle_1', src: 'sprites/player/princess/idle/01.png' },
      { key: 'player_run_0', src: 'sprites/player/princess/run/00.png' },
      { key: 'player_run_1', src: 'sprites/player/princess/run/01.png' },
      { key: 'player_run_2', src: 'sprites/player/princess/run/02.png' },
      { key: 'player_run_3', src: 'sprites/player/princess/run/03.png' },
      { key: 'tree_0', src: 'sprites/obstacles/trees/00.png' },
      { key: 'tree_1', src: 'sprites/obstacles/trees/01.png' },
      { key: 'tree_2', src: 'sprites/obstacles/trees/02.png' },
      { key: 'knight_0', src: 'sprites/enemies/black_knight/run/00.png' },
      { key: 'knight_1', src: 'sprites/enemies/black_knight/run/01.png' },
      { key: 'knight_2', src: 'sprites/enemies/black_knight/run/02.png' },
      { key: 'knight_3', src: 'sprites/enemies/black_knight/run/03.png' },
      { key: 'wall', src: 'sprites/projectiles/wall/00.png' },
    ];
    return this.assets.loadAll(assets).then(() => {
      this.playerSprites = {
        idle: [
          this.assets.get('player_idle_0'),
          this.assets.get('player_idle_1'),
        ],
        run: [
          this.assets.get('player_run_0'),
          this.assets.get('player_run_1'),
          this.assets.get('player_run_2'),
          this.assets.get('player_run_3'),
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
        this.assets.get('knight_3'),
      ];
      this.wallSprite = this.assets.get('wall');
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
        ctx.drawImage(img, u.x, u.y - u.height, u.width, u.height);
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillRect(u.x, u.y - u.height, u.width, u.height);
        ctx.fillRect(u.x + u.width - 10, u.y - u.height - 10, 10, 10);
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.moveTo(u.x + u.width, u.y - u.height - 10);
        ctx.lineTo(u.x + u.width + 10, u.y - u.height - 30);
        ctx.lineTo(u.x + u.width, u.y - u.height - 20);
        ctx.fill();
        ctx.fillStyle = 'pink';
        ctx.fillRect(u.x + 5, u.y - u.height - 25, 15, 15);
        ctx.fillStyle = '#f2d6cb';
        ctx.beginPath();
        ctx.arc(u.x + 12.5, u.y - u.height - 30, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      if (u.shieldActive) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(u.x + u.width / 2, u.y - u.height / 2, u.width, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }

  drawObstacles() {
    const { game } = this;
    this.withContext(ctx => {
      game.level.obstacles.forEach(o => {
        if (this.treeSprites) {
          const img = this.treeSprites[(o.imageIndex ?? 0) % this.treeSprites.length];
          ctx.drawImage(img, o.x, o.y - o.height, o.width, o.height);
        } else {
          ctx.fillStyle = 'green';
          ctx.fillRect(o.x, o.y - o.height, o.width, o.height);
        }
      });
    });
  }

  drawWalls() {
    const { game } = this;
    this.withContext(ctx => {
      if (this.wallSprite) {
        game.level.walls.forEach(w => {
          ctx.drawImage(this.wallSprite, w.x, w.y - w.height, w.width, w.height);
        });
      } else {
        ctx.fillStyle = 'gray';
        game.level.walls.forEach(w => {
          ctx.fillRect(w.x, w.y - w.height, w.width, w.height);
        });
      }
      const b = game.level.boss;
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
        ctx.drawImage(img, b.x, b.y - b.height, b.width, b.height);
      } else {
        ctx.fillStyle = 'black';
        ctx.fillRect(b.x, b.y - b.height, b.width, b.height);
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

