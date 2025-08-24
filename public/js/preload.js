export async function loadSprites(manifestUrl = 'assets/sprites/sprites.json') {
  const res = await fetch(manifestUrl);
  const manifest = await res.json();

  const load = (src) => new Promise((ok, err) => {
    const img = new Image();
    img.src = src;
    img.onload = () => ok(img);
    img.onerror = err;
  });

  const sprites = {};
  for (const [key, value] of Object.entries(manifest)) {
    if (Array.isArray(value)) {
      sprites[key] = await Promise.all(value.map(load));
    } else {
      sprites[key] = await load(value);
    }
  }
  return sprites;
}

export class Animator {
  constructor(frames, fps = 6) {
    this.frames = frames;
    this.fps = fps;
    this.time = 0;
    this.index = 0;
  }
  update(dt) {
    this.time += dt;
    const frameTime = 1 / this.fps;
    while (this.time >= frameTime) {
      this.time -= frameTime;
      this.index = (this.index + 1) % this.frames.length;
    }
  }
  draw(ctx, x, y, angle = 0, scale = 1) {
    const img = this.frames[this.index];
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
}
