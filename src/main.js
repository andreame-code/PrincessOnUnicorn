import { startGameLoop } from './core/loop.js';

function step(dt){
  // logica fisica (movimenti, gravità, spawn, collisioni)
}
function render(){
  // disegno
}
startGameLoop({ step, render });
