import { AssetManager } from './assetManager.js';
import { SHIELD_RANGE } from './config.js';

const JUMP_SOUND = 'data:audio/wav;base64,UklGRuwAAABXQVZFZm10IBAAAAABAAEAoA8AAKAPAAABAAgAZGF0YcgAAACA/K4UKcryYAFw+L0eHr34cAFg8sopFK78fwNR69Y1DZ/+jwdC4eFCB4/+nw011utRA4D8rhQpyvJgAXD4vR4evfhwAWDyyikUrvyAA1Hr1jUNn/6PB0Lh4UIHj/6fDTXW61EDgPyuFCnK8mABcPi9Hh69+HABYPLKKRSu/H8DUevWNQ2f/o8HQuHhQgeP/p8NNdbrUQN//K4UKcryYAFw+L0eHr34cAFg8sopFK78fwNR69Y1DZ/+jwdC4eFCB4/+nw011utRAw==';
const SHIELD_SOUND = 'data:audio/wav;base64,UklGRuwAAABXQVZFZm10IBAAAAABAAEAoA8AAKAPAAABAAgAZGF0YcgAAACA0PzvrlgUAil4yvvytmAZASNwxPj2vWgeAR5ovfb4xHAjARlgtvL7yngpAhRYru/80H8vAxBRp+v91oc1BA1Jn+b+3I87BwlCl+H/4ZdCCQc7j9z+5p9JDQQ1h9b966dREAMvgND8765YFAIpeMr78rZgGQEjcMT49r1oHgEeaL32+MRwIwEZYLby+8p4KQIUWK7v/NCALwMQUafr/daHNQQNSZ/m/tyPOwcJQpfh/+GXQgkHO4/c/uafSQ0ENYfW/eunURADLw==';
const COIN_SOUND = 'data:audio/wav;base64,UklGRsQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YaAAAACA0f3vr1kVAil4y/vztmAZASNwxPn2vWgeAR5ovfb5xHAjARlgtvP7y3gpAhVZr+/90YAvAxFRp+v+14g1BQ1KoOf/3ZA8BwpDmOL/4phDCgc8kN3/56BKDQU1iNf+66dREQMvgNH9769ZFQIpeMv787ZgGQEjcMT59r1oHgEeaL32+cRwIwEZYLbz+8t4KQIVWa/v/dGALwMRUafr/teI';
const BOUNCE_SOUND = 'data:audio/wav;base64,UklGRsQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YaAAAACAq9Ht/f3v1K+EWTIVBAIPKU54o8vp+/7z2raMYDkZBgELI0ZwnMTk+f/2372UaD8eCQEJHj9olL3f9v/55MSccEYjCwEGGTlgjLba8/776cujeE4pDwIEFTJZhK/U7/397dGrgFUvEwMDESxRfKfO6/z+8deyiF01FwUCDSZKdKDH5/r/9d26kGQ8HAcBCiFDbJjB4vf/9+LBmGxDIQoB';

const SPRITE_SCALE = 2;

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
    this.playerAnimation = null;
    this.knightFrameIndex = 0;
    this.knightFrameTimer = 0;
    this.lastKnightTime = 0;
    this.sounds = {};
    // Simple background clouds
    this.clouds = [];
    this.lastCloudTime = 0;
    this.lastCloudDistance = 0;
    this.initClouds();
  }

  preload() {
    const resolve = path => new URL(`../${path}`, import.meta.url).href;
    const assets = [
      { key: 'player_0', src: resolve('public/assets/sprites/princess_0.png') },
      { key: 'player_1', src: resolve('public/assets/sprites/princess_1.png') },
      { key: 'player_2', src: resolve('public/assets/sprites/princess_2.png') },
      { key: 'tree_0', src: resolve('sprites/obstacles/trees/00.png') },
      { key: 'tree_1', src: resolve('sprites/obstacles/trees/01.png') },
      { key: 'tree_2', src: resolve('sprites/obstacles/trees/02.png') },
      { key: 'knight_0', src: resolve('public/assets/sprites/cavaliere_nero/knight_0.png') },
      { key: 'knight_1', src: resolve('public/assets/sprites/cavaliere_nero/knight_1.png') },
      { key: 'knight_2', src: resolve('public/assets/sprites/cavaliere_nero/knight_2.png') },
      { key: 'wall', src: resolve('sprites/projectiles/wall/00.png') },
      { key: 'shield', src: resolve('public/assets/sprites/shield.png') },
      { key: 'jump', src: JUMP_SOUND, type: 'audio' },
      { key: 'coin', src: COIN_SOUND, type: 'audio' },
      { key: 'bounce', src: BOUNCE_SOUND, type: 'audio' },
      { key: 'shield_hit', src: SHIELD_SOUND, type: 'audio' },
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
      this.sounds.jump = this.assets.get('jump');
      this.sounds.coin = this.assets.get('coin');
      this.sounds.bounce = this.assets.get('bounce');
      this.sounds.shield = this.assets.get('shield_hit');
      Object.values(this.sounds).forEach(s => {
        if (s) s.volume = 0.5;
      });
    });
  }

  initClouds() {
    const { canvas } = this.game;
    if (!canvas) return;
    const count = 5;
    for (let i = 0; i < count; i++) {
      const width = 60 + Math.random() * 40;
      const height = 20 + Math.random() * 10;
      this.clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.3,
        width,
        height,
        speed: 15 + Math.random() * 10,
      });
    }
  }

  drawBackground() {
    const { ctx, game } = this;
    if (!game.canvas) return;

    if (game.levelNumber === 3) {
      // Pastel sky gradient specific to level 3
      const grd = ctx.createLinearGradient(0, 0, 0, game.canvas.height);
      grd.addColorStop(0, '#fbeaff');
      grd.addColorStop(1, '#d6f5ff');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

      // Cupcake mountains (simple rounded shapes)
      ctx.fillStyle = '#ffd1dc';
      ctx.beginPath();
      ctx.moveTo(0, game.canvas.height * 0.8);
      ctx.quadraticCurveTo(
        game.canvas.width * 0.1,
        game.canvas.height * 0.55,
        game.canvas.width * 0.25,
        game.canvas.height * 0.8
      );
      ctx.fill();

      ctx.fillStyle = '#ffb7ce';
      ctx.beginPath();
      ctx.moveTo(game.canvas.width * 0.2, game.canvas.height * 0.8);
      ctx.quadraticCurveTo(
        game.canvas.width * 0.35,
        game.canvas.height * 0.5,
        game.canvas.width * 0.5,
        game.canvas.height * 0.8
      );
      ctx.fill();

      // Rainbow castle (simplified)
      const castleBaseY = game.canvas.height * 0.75;
      const castleX = game.canvas.width * 0.7;
      const castleW = 40;
      const castleH = 40;
      const colors = ['#ff9aa2', '#ffb7b2', '#ffdac1', '#e2f0cb', '#b5ead7', '#c7ceea'];
      colors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(castleX + i * (castleW / colors.length), castleBaseY - castleH, castleW / colors.length, castleH);
      });
      ctx.fillStyle = '#c7ceea';
      ctx.beginPath();
      ctx.moveTo(castleX + castleW * 0.5, castleBaseY - castleH - 20);
      ctx.lineTo(castleX + castleW * 0.6, castleBaseY - castleH);
      ctx.lineTo(castleX + castleW * 0.4, castleBaseY - castleH);
      ctx.closePath();
      ctx.fill();

      // Moving clouds for level 3 based on camera distance
      const dist = game.level.distance;
      const deltaDist = dist - this.lastCloudDistance;
      this.lastCloudDistance = dist;

      ctx.fillStyle = '#ffffffaa';
      this.clouds.forEach(c => {
        c.x -= c.speed * deltaDist;
        if (c.x < -c.width) {
          c.x = game.canvas.width + c.width;
        } else if (c.x > game.canvas.width + c.width) {
          c.x = -c.width;
        }
        const r = c.height / 2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        ctx.arc(c.x + r, c.y - r, r, 0, Math.PI * 2);
        ctx.arc(c.x + r * 2, c.y, r, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      // Default blue sky with clouds for other levels
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (!this.lastCloudTime) this.lastCloudTime = now;
      const delta = (now - this.lastCloudTime) / 1000;
      this.lastCloudTime = now;

      ctx.fillStyle = '#fff';
      this.clouds.forEach(c => {
        c.x -= c.speed * delta;
        if (c.x < -c.width) {
          c.x = game.canvas.width + c.width;
        }
        const r = c.height / 2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        ctx.arc(c.x + r, c.y - r, r, 0, Math.PI * 2);
        ctx.arc(c.x + r * 2, c.y, r, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  playSound(key) {
    const audio = this.sounds[key];
    if (audio && typeof audio.play === 'function') {
      audio.currentTime = 0;
      audio.play();
    }
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
      if (game.levelNumber === 3) {
        const y = game.groundY * game.scale;
        const h = game.canvas.height - y;
        const grd = ctx.createLinearGradient(0, y, 0, game.canvas.height);
        grd.addColorStop(0, '#b3ffcc');
        grd.addColorStop(1, '#eaffea');
        ctx.fillStyle = grd;
        ctx.fillRect(0, y, game.canvas.width, h);
      } else {
        ctx.fillStyle = '#555';
        ctx.fillRect(0, game.groundY * game.scale, game.canvas.width, 2);
      }
    });
  }

  drawPlayer() {
    const u = this.game.player;
    this.withContext(ctx => {
      const scale = this.game.scale;
      const scaledWidth = u.width * scale * SPRITE_SCALE;
      const scaledHeight = u.height * scale * SPRITE_SCALE;
      const bottom = (u.y + u.height / 2) * scale;
      const left = u.x * scale - scaledWidth / 2;
      const top = bottom - scaledHeight;

      if (this.playerSprites) {
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        if (!this.lastSpriteTime) this.lastSpriteTime = now;
        const delta = (now - this.lastSpriteTime) / 1000;
        this.lastSpriteTime = now;
        this.playerFrameTimer += delta;
        const anim =
          this.game.gamePaused ||
          this.game.gameOver ||
          (this.game.level.disableAutoScroll && this.game.player.vx === 0)
            ? 'idle'
            : 'run';
        const frames = this.playerSprites[anim];
        if (this.playerAnimation !== anim) {
          this.playerAnimation = anim;
          this.playerFrameIndex = 0;
          this.playerFrameTimer = 0;
        }
        if (this.playerFrameTimer >= this.frameInterval) {
          this.playerFrameTimer = 0;
          this.playerFrameIndex = (this.playerFrameIndex + 1) % frames.length;
        }
        const img = frames[this.playerFrameIndex];
        ctx.drawImage(img, left, top, scaledWidth, scaledHeight);
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillRect(left, top, scaledWidth, scaledHeight);
        ctx.fillRect(left + scaledWidth - 10, top - 10, 10, 10);
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.moveTo(left + scaledWidth, top - 10);
        ctx.lineTo(left + scaledWidth + 10, top - 30);
        ctx.lineTo(left + scaledWidth, top - 20);
        ctx.fill();
        ctx.fillStyle = 'pink';
        ctx.fillRect(left + 5, top - 25, 15, 15);
        ctx.fillStyle = '#f2d6cb';
        ctx.beginPath();
        ctx.arc(left + 12.5, top - 30, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      if (u.shieldActive) {
        const extra = SHIELD_RANGE * scale;
        if (this.shieldSprite) {
          const img = this.shieldSprite;
          // Usa la dimensione scalata del personaggio anziché le dimensioni dell'immagine
          // Raddoppia la dimensione dello scudo per renderlo evidente
          const w = (scaledWidth + extra * 2) * 2;
          const h = (scaledHeight + extra * 2) * 2;
          const sx = u.x * scale - w / 2;
          const sy = u.y * scale - h / 2;
          ctx.drawImage(img, sx, sy, w, h);
          // Disegna un anello azzurro di supporto intorno allo scudo
          ctx.strokeStyle = 'rgba(0, 128, 255, 0.7)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(u.x * scale, u.y * scale, (scaledWidth + extra * 2), 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.strokeStyle = 'blue';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(
            u.x * scale,
            u.y * scale,
            scaledWidth / 2 + extra,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
      }
    });
  }

  drawStar(ctx, x, y, radius) {
    ctx.beginPath();
    for (let point = 0; point < 10; point++) {
      const angle = -Math.PI / 2 + point * Math.PI / 5;
      const r = point % 2 === 0 ? radius : radius * 0.45;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (point === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  drawLevel3Entity(ctx, entity, scale) {
    const left = (entity.x - entity.width / 2) * scale;
    const top = (entity.y - entity.height / 2) * scale;
    const width = entity.width * scale;
    const height = entity.height * scale;
    const centerX = entity.x * scale;
    const centerY = entity.y * scale;

    switch (entity.type) {
      case 'platform': {
        const cloudHeight = height * 0.55;
        ctx.fillStyle = entity.kind === 'falling' ? '#ffd6a5' : '#ffffff';
        ctx.strokeStyle = entity.kind === 'falling' ? '#e08f62' : '#9adcf4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(left + width * 0.25, top + cloudHeight * 0.65, cloudHeight * 0.32, 0, Math.PI * 2);
        ctx.arc(left + width * 0.5, top + cloudHeight * 0.42, cloudHeight * 0.42, 0, Math.PI * 2);
        ctx.arc(left + width * 0.75, top + cloudHeight * 0.65, cloudHeight * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (entity.kind === 'falling') {
          ctx.strokeStyle = '#b45f4b';
          ctx.beginPath();
          ctx.moveTo(centerX, top + cloudHeight * 0.55);
          ctx.lineTo(centerX - width * 0.08, top + cloudHeight * 0.9);
          ctx.lineTo(centerX + width * 0.06, top + cloudHeight);
          ctx.stroke();
        }
        break;
      }
      case 'pipe':
        ctx.fillStyle = '#7b2cbf';
        ctx.fillRect(left + width * 0.2, top + height * 0.12, width * 0.6, height * 0.88);
        ctx.fillStyle = '#9d4edd';
        ctx.fillRect(left, top + height * 0.08, width, height * 0.18);
        ctx.fillStyle = '#d8b4fe';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(left + width * (0.18 + i * 0.28), top + height * 0.12);
          ctx.lineTo(left + width * (0.28 + i * 0.28), top - height * 0.08);
          ctx.lineTo(left + width * (0.38 + i * 0.28), top + height * 0.12);
          ctx.fill();
        }
        break;
      case 'block':
        ctx.fillStyle = '#8be9fd';
        ctx.strokeStyle = '#3182a0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, top);
        ctx.lineTo(left + width, centerY);
        ctx.lineTo(centerX, top + height);
        ctx.lineTo(left, centerY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#e6fbff';
        ctx.beginPath();
        ctx.moveTo(centerX, top + height * 0.12);
        ctx.lineTo(centerX, top + height * 0.88);
        ctx.stroke();
        break;
      case 'goomba':
        ctx.fillStyle = '#57a773';
        ctx.fillRect(left + width * 0.3, top + height * 0.2, width * 0.4, height * 0.8);
        ctx.fillRect(left + width * 0.08, top + height * 0.45, width * 0.84, height * 0.22);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(left + width * 0.36, top + height * 0.3, width * 0.1, height * 0.12);
        ctx.fillRect(left + width * 0.54, top + height * 0.3, width * 0.1, height * 0.12);
        break;
      case 'shadow-crow':
        ctx.fillStyle = '#43345d';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(left, top + height * 0.25);
        ctx.lineTo(left + width * 0.28, top + height * 0.78);
        ctx.lineTo(centerX, top + height * 0.58);
        ctx.lineTo(left + width * 0.72, top + height * 0.78);
        ctx.lineTo(left + width, top + height * 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f7d154';
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(2, width * 0.08), 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'rhombus':
        ctx.fillStyle = entity.state === 'dashing' ? '#ff4d9d' : '#ff8cc6';
        ctx.strokeStyle = '#9c1d68';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, top);
        ctx.lineTo(left + width, centerY);
        ctx.lineTo(centerX, top + height);
        ctx.lineTo(left, centerY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      case 'thorn-guard':
        ctx.fillStyle = '#2d6a4f';
        ctx.fillRect(left + width * 0.25, top + height * 0.18, width * 0.5, height * 0.82);
        ctx.fillStyle = '#95d5b2';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(left + width * (0.18 + i * 0.28), top + height * 0.22);
          ctx.lineTo(left + width * (0.28 + i * 0.28), top);
          ctx.lineTo(left + width * (0.38 + i * 0.28), top + height * 0.22);
          ctx.fill();
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(left + width * 0.36, top + height * 0.38, width * 0.1, height * 0.1);
        ctx.fillRect(left + width * 0.55, top + height * 0.38, width * 0.1, height * 0.1);
        break;
      case 'thorn-wall':
        ctx.fillStyle = '#40916c';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(left + width * i / 3, top + height);
          ctx.lineTo(left + width * (i + 0.5) / 3, top);
          ctx.lineTo(left + width * (i + 1) / 3, top + height);
          ctx.fill();
        }
        break;
      case 'portal-guardian':
        ctx.fillStyle = entity.defeated ? '#b8f2e6' : '#5a189a';
        ctx.fillRect(left + width * 0.16, top + height * 0.18, width * 0.68, height * 0.82);
        ctx.fillStyle = '#ffca3a';
        for (let i = 0; i < Math.max(0, 3 - entity.hits); i++) {
          ctx.beginPath();
          ctx.arc(left + width * (0.3 + i * 0.2), top + height * 0.42, width * 0.05, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#9d4edd';
        ctx.beginPath();
        ctx.moveTo(left + width * 0.16, top + height * 0.2);
        ctx.lineTo(left, top);
        ctx.lineTo(left + width * 0.34, top + height * 0.18);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(left + width * 0.84, top + height * 0.2);
        ctx.lineTo(left + width, top);
        ctx.lineTo(left + width * 0.66, top + height * 0.18);
        ctx.fill();
        break;
      case 'powerup': {
        const colors = {
          'aura-shield': '#4cc9f0',
          'wind-hooves': '#52b788',
          'sugar-wings': '#f15bb5',
        };
        const labels = { 'aura-shield': 'S', 'wind-hooves': 'V', 'sugar-wings': 'A' };
        ctx.fillStyle = colors[entity.kind] || '#ffffff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.min(width, height) * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#2b1742';
        ctx.font = `bold ${Math.max(10, width * 0.42)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[entity.kind] || '?', centerX, centerY + 1);
        break;
      }
      case 'star':
        ctx.fillStyle = '#ffd60a';
        ctx.strokeStyle = '#e09f00';
        ctx.lineWidth = 2;
        this.drawStar(ctx, centerX, centerY, Math.min(width, height) * 0.45);
        ctx.stroke();
        break;
      case 'checkpoint':
        ctx.strokeStyle = '#6d3b1f';
        ctx.lineWidth = Math.max(3, width * 0.08);
        ctx.beginPath();
        ctx.moveTo(left + width * 0.25, top + height);
        ctx.lineTo(left + width * 0.25, top);
        ctx.stroke();
        ctx.fillStyle = this.game.level.checkpointReached ? '#52b788' : '#ff70a6';
        ctx.beginPath();
        ctx.moveTo(left + width * 0.28, top + height * 0.08);
        ctx.lineTo(left + width, top + height * 0.28);
        ctx.lineTo(left + width * 0.28, top + height * 0.5);
        ctx.closePath();
        ctx.fill();
        break;
      case 'portal':
        ctx.strokeStyle = entity.open ? '#00e5ff' : '#8064a2';
        ctx.lineWidth = Math.max(5, width * 0.16);
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, width * 0.42, height * 0.46, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = entity.open ? '#fff59d' : '#4b3b5f';
        ctx.lineWidth = Math.max(2, width * 0.06);
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, width * 0.28, height * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();
        if (!entity.open) {
          ctx.fillStyle = '#4b3b5f';
          ctx.fillRect(centerX - width * 0.13, centerY - height * 0.05, width * 0.26, height * 0.18);
        }
        break;
      default:
        ctx.fillStyle = '#ffb7ce';
        ctx.fillRect(left, top, width, height);
        break;
    }
  }

  drawObstacles() {
    const { game } = this;
    this.withContext(ctx => {
      const scale = this.game.scale;
      const obstacles =
        game.levelNumber === 3 && typeof game.level.getRenderables === 'function'
          ? game.level.getRenderables()
          : game.level.obstacles;
      obstacles.forEach(o => {
        if (game.levelNumber === 3) {
          this.drawLevel3Entity(ctx, o, scale);
          return;
        }
        const w = o.width * scale * SPRITE_SCALE;
        const h = o.height * scale * SPRITE_SCALE;
        const left = o.x * scale - w / 2;
        const bottom = (o.y + o.height / 2) * scale;
        const top = bottom - h;
        const sprites = o.type === 'tree' ? this.treeSprites : null;
        if (sprites) {
          const img = sprites[(o.imageIndex ?? 0) % sprites.length];
          ctx.drawImage(img, left, top, w, h);
        } else if (o.type === 'cactus') {
          ctx.fillStyle = 'green';
          ctx.fillRect(left + w * 0.4, top, w * 0.2, h);
          ctx.fillRect(left, top + h * 0.4, w, h * 0.2);
        } else {
          ctx.fillStyle = 'green';
          ctx.fillRect(left, top, w, h);
        }
      });
    });
  }

  drawWalls() {
    const { game } = this;
    this.withContext(ctx => {
      const scale = this.game.scale;
      if (this.wallSprite) {
        game.level.walls.forEach(w => {
          const wWidth = w.width * scale * SPRITE_SCALE;
          const wHeight = w.height * scale * SPRITE_SCALE;
          const left = w.x * scale - wWidth / 2;
          const bottom = (w.y + w.height / 2) * scale;
          const top = bottom - wHeight;
          ctx.drawImage(this.wallSprite, left, top, wWidth, wHeight);
        });
      } else {
        ctx.fillStyle = 'gray';
        game.level.walls.forEach(w => {
          const wWidth = w.width * scale * SPRITE_SCALE;
          const wHeight = w.height * scale * SPRITE_SCALE;
          const left = w.x * scale - wWidth / 2;
          const bottom = (w.y + w.height / 2) * scale;
          const top = bottom - wHeight;
          ctx.fillRect(left, top, wWidth, wHeight);
        });
      }
      const b = game.level.boss;
      const bw = b.width * scale * SPRITE_SCALE;
      const bh = b.height * scale * SPRITE_SCALE;
      const bx = b.x * scale - bw / 2;
      const bottom = (b.y + b.height / 2) * scale;
      const by = bottom - bh;
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
        ctx.drawImage(img, bx, by, bw, bh);
      } else {
        ctx.fillStyle = 'black';
        ctx.fillRect(bx, by, bw, bh);
      }
    });
  }

  drawCoins() {
    const { game } = this;
    this.withContext(ctx => {
      ctx.fillStyle = 'gold';
      const scale = this.game.scale;
      game.level.coins.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x * scale, c.y * scale, 0.05 * scale, 0, Math.PI * 2);
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
      ctx.textBaseline = 'top';
      const margin = 10;
      ctx.fillText(`Punteggio: ${Math.floor(game.score)}`, margin, margin);
      ctx.fillText(
        `High Score: ${Math.floor(game.highScore)}`,
        margin,
        margin + 20,
      );

      const p = game.player;
      const iconSize = 16;
      const iconY = margin + 38;
      if (game.levelNumber !== 3) {
        const coinX = game.canvas.width - margin;
        const coinY = margin + 10;
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.arc(coinX, coinY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.textAlign = 'right';
        ctx.fillText(`x ${game.coins}`, coinX - 10, margin);
        ctx.textAlign = 'left';

        if (this.shieldSprite) {
          ctx.drawImage(this.shieldSprite, margin, iconY, iconSize, iconSize);
        } else {
          ctx.strokeStyle = 'blue';
          ctx.beginPath();
          ctx.arc(margin + 8, iconY + 8, 8, 0, Math.PI * 2);
          ctx.stroke();
        }
        const barX = margin + iconSize + 5;
        const barY = iconY + 2;
        const barWidth = 80;
        const barHeight = 10;
        ctx.strokeStyle = '#000';
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        const progress = p.shieldCooldownMax
          ? (p.shieldCooldownMax - p.shieldCooldown) / p.shieldCooldownMax
          : 1;
        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);
      } else {
        const progressWidth = Math.min(240, game.canvas.width * 0.34);
        const progressX = (game.canvas.width - progressWidth) / 2;
        const progressY = margin + 4;
        const progress = Math.max(
          0,
          Math.min(1, game.level.distance / game.level.levelLength)
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
        ctx.fillRect(progressX, progressY, progressWidth, 16);
        ctx.fillStyle = '#d84fa3';
        ctx.fillRect(progressX, progressY, progressWidth * progress, 16);
        ctx.strokeStyle = '#66345f';
        ctx.strokeRect(progressX, progressY, progressWidth, 16);
        ctx.fillStyle = '#2b1742';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Portale ${Math.floor(progress * 100)}%`, game.canvas.width / 2, progressY + 1);

        ctx.fillStyle = '#ffd60a';
        this.drawStar(ctx, game.canvas.width - 24, margin + 10, 9);
        ctx.fillStyle = '#2b1742';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${game.stars}/5`, game.canvas.width - 38, margin);
        ctx.textAlign = 'left';

        let x = margin;
        const icons = [];
        if (p.shieldTimer > 0) icons.push({ color: '#4cc9f0', label: 'S' });
        if (p.speedBoostTimer > 0) icons.push({ color: '#52b788', label: 'V' });
        if (p.wingsTimer > 0) icons.push({ color: '#f15bb5', label: 'A' });
        icons.forEach(icon => {
          ctx.fillStyle = icon.color;
          ctx.fillRect(x, iconY, iconSize, iconSize);
          ctx.fillStyle = '#fff';
          ctx.font = '10px sans-serif';
          ctx.fillText(icon.label, x + 4, iconY + 12);
          x += iconSize + 5;
        });
        if (game.level.checkpointReached) {
          ctx.fillStyle = '#2d6a4f';
          ctx.font = '13px sans-serif';
          ctx.fillText('✓ Checkpoint', margin, iconY + 22);
        }
      }

      if (game.gameOver) {
        ctx.fillStyle = '#000';
        ctx.font = '24px sans-serif';
        const lines = game.win
          ? game.levelNumber === 3
            ? ['Complimenti!', 'Hai salvato Unicornolandia!']
            : ['Complimenti!', 'Hai sconfitto il Cavaliere Nero!']
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
    this.drawBackground();
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
