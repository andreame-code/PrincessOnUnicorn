export class Renderer {
  constructor(game) {
    this.game = game;
    this.ctx = game.ctx;
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
      ctx.fillStyle = 'green';
      game.level.obstacles.forEach(o => {
        ctx.fillRect(o.x, o.y - o.height, o.width, o.height);
      });
    });
  }

  drawWalls() {
    const { game } = this;
    this.withContext(ctx => {
      ctx.fillStyle = 'gray';
      game.level.walls.forEach(w => {
        ctx.fillRect(w.x, w.y - w.height, w.width, w.height);
      });
      ctx.fillStyle = 'black';
      const b = game.level.boss;
      ctx.fillRect(b.x, b.y - b.height, b.width, b.height);
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
        const msg = game.win
          ? 'Complimenti! Hai sconfitto il Cavaliere Nero!'
          : 'Game Over - tocca o premi Spazio per ricominciare';
        const msgWidth = ctx.measureText(msg).width;
        ctx.fillText(msg, (game.canvas.width - msgWidth) / 2, 100);
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

