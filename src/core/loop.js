import { FIXED_DT } from '../config/physics.js';

export function startGameLoop({ step, render }) {
  let last = performance.now();
  let acc = 0;

  function frame(now) {
    acc += (now - last) / 1000;
    last = now;

    while (acc >= FIXED_DT) {
      step(FIXED_DT);
      acc -= FIXED_DT;
    }
    render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
