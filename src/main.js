import { startGameLoop } from './core/loop.js';
import { Player } from './entities/player.js';

const groundY = 0;
const player = new Player({ x: 2, y: 0, width: 0.6, height: 1.0 });
// player.setJumpHeight(3.0);

function step(dt){
  player.step(dt, groundY);
  // logica fisica (movimenti, gravità, spawn, collisioni)
}

function render(){
  // disegno
}

startGameLoop({ step, render });
