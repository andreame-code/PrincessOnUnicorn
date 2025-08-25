import { WORLD_WIDTH, WORLD_HEIGHT } from '../config/world.js';

export function attachViewport(canvas) {
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const scale = Math.min(w / WORLD_WIDTH, h / WORLD_HEIGHT);
    canvas.width  = Math.round(WORLD_WIDTH  * scale);
    canvas.height = Math.round(WORLD_HEIGHT * scale);
    const offX = Math.floor((w - canvas.width) / 2);
    const offY = Math.floor((h - canvas.height) / 2);
    canvas.style.position = 'absolute';
    canvas.style.left = offX + 'px';
    canvas.style.top  = offY + 'px';
    return { scale, offX, offY };
  }
  let view = resize();
  window.addEventListener('resize', () => { view = resize(); });
  return {
    getView(){ return view; },
    worldToScreen(x, y){ return { sx: x * view.scale, sy: y * view.scale }; },
    screenToWorld(px, py){ return { x: px / view.scale, y: py / view.scale }; }
  };
}
