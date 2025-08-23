async function loadAssets(manifestUrl) {
  const res = await fetch(manifestUrl);
  const manifest = await res.json();
  const assets = {};
  for (const [key, data] of Object.entries(manifest)) {
    const frames = await Promise.all(
      data.frames.map(
        src =>
          new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
          })
      )
    );
    assets[key] = {
      frames,
      fps: data.fps || 0,
      anchor: data.anchor || [0, 0],
      rotate: data.rotate,
      deg_per_sec: data.deg_per_sec || 0,
    };
  }
  return assets;
}

class AnimatedSprite {
  constructor(asset, x, y) {
    this.asset = asset;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.timer = 0;
    this.angle = 0;
  }
  update(dt) {
    if (this.asset.fps > 0 && this.asset.frames.length > 1) {
      this.timer += dt;
      const interval = 1 / this.asset.fps;
      if (this.timer >= interval) {
        this.timer -= interval;
        this.frame = (this.frame + 1) % this.asset.frames.length;
      }
    }
  }
  draw(ctx) {
    const img = this.asset.frames[this.frame];
    const [ax, ay] = this.asset.anchor;
    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.angle) ctx.rotate(this.angle);
    ctx.drawImage(img, -img.width * ax, -img.height * ay);
    ctx.restore();
  }
}

class Wall extends AnimatedSprite {
  constructor(asset, x, y) {
    super(asset, x, y);
    this.vx = -150;
    this.vy = -150;
    this.gravity = 200;
    this.angular = (asset.deg_per_sec || 0) * Math.PI / 180;
  }
  update(dt) {
    super.update(dt);
    this.x += this.vx * dt;
    this.vy += this.gravity * dt;
    this.y += this.vy * dt;
    this.angle += this.angular * dt;
  }
}

async function main() {
  const canvas = document.getElementById('demo');
  const ctx = canvas.getContext('2d');
  const groundY = canvas.height - 20;

  const assets = await loadAssets('assets/manifest.json');

  const unicorn = new AnimatedSprite(assets.unicorn_run, 100, groundY);
  unicorn.vx = 60;
  const princess = new AnimatedSprite(assets.princess_run, unicorn.x + 6, unicorn.y - 14);
  const knight = new AnimatedSprite(assets.black_knight_idle, canvas.width - 80, groundY);

  const treeFrames = assets.trees.frames;
  const trees = [
    { img: treeFrames[0], x: 300, y: groundY },
    { img: treeFrames[2], x: 500, y: groundY },
  ];

  let walls = [];
  let wallTimer = 0;

  function spawnWall() {
    walls.push(new Wall(assets.wall, canvas.width + 40, groundY - 40));
  }

  function update(dt) {
    unicorn.update(dt);
    unicorn.x += unicorn.vx * dt;
    if (unicorn.x > canvas.width + 50) unicorn.x = -50;

    princess.x = unicorn.x + 6;
    princess.y = unicorn.y - 14;
    princess.update(dt);

    knight.update(dt);

    wallTimer += dt;
    if (wallTimer >= 2) {
      wallTimer = 0;
      spawnWall();
    }

    walls.forEach(w => w.update(dt));
    walls = walls.filter(w => w.x > -100 && w.y < canvas.height + 100);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#555';
    ctx.fillRect(0, groundY, canvas.width, 2);

    trees.forEach(t => {
      const [ax, ay] = assets.trees.anchor;
      ctx.drawImage(t.img, t.x - t.img.width * ax, t.y - t.img.height * ay);
    });

    walls.forEach(w => w.draw(ctx));
    unicorn.draw(ctx);
    princess.draw(ctx);
    knight.draw(ctx);
  }

  let last = performance.now();
  function loop(now) {
    const dt = (now - last) / 1000;
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

main();

