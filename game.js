const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.height = 200;
let groundY = canvas.height - 50;

const unicorn = {
  x: 50,
  y: groundY,
  width: 40,
  height: 40,
  vy: 0,
  jumping: false
};

function resizeCanvas() {
  canvas.width = window.innerWidth;
  groundY = canvas.height - 50;
  if (!unicorn.jumping) {
    unicorn.y = groundY;
  }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let obstacles = [];
let score = 0;
// Slower game speed and lower gravity make the game easier
let speed = 3;
let gravity = 0.4;
let gameOver = false;
let win = false;
let obstacleTimer = 0;
let obstacleInterval = getObstacleInterval();

function getObstacleInterval() {
  return 80 + Math.random() * 70; // ensure obstacles are neither too close nor too far apart
}

function handleInput() {
  if (gameOver) {
    reset();
  } else if (!unicorn.jumping) {
    unicorn.vy = -12;
    unicorn.jumping = true;
  }
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    handleInput();
  }
});

window.addEventListener('pointerdown', handleInput);

function reset() {
  obstacles = [];
  score = 0;
  gameOver = false;
  win = false;
  unicorn.y = groundY;
  unicorn.vy = 0;
  unicorn.jumping = false;
  obstacleTimer = 0;
  obstacleInterval = getObstacleInterval();
  requestAnimationFrame(loop);
}

function update() {
  unicorn.y += unicorn.vy;
  if (unicorn.y < groundY) {
    unicorn.vy += gravity;
  } else {
    unicorn.y = groundY;
    unicorn.vy = 0;
    unicorn.jumping = false;
  }

  // Control obstacle spacing so jumps remain possible
  obstacleTimer++;
  if (obstacleTimer > obstacleInterval) {
    obstacles.push({x: canvas.width, width: 20, height: 40});
    obstacleTimer = 0;
    obstacleInterval = getObstacleInterval();
  }

  obstacles.forEach(o => o.x -= speed);
  obstacles = obstacles.filter(o => o.x + o.width > 0);

  obstacles.forEach(o => {
    if (isColliding(unicorn, o, groundY)) {
      gameOver = true;
    }
  });

  score++;

  if (score >= 1000) {
    gameOver = true;
    win = true;
  }
}

function drawUnicorn() {
  ctx.fillStyle = '#fff';
  ctx.fillRect(unicorn.x, unicorn.y - unicorn.height, unicorn.width, unicorn.height);
  ctx.fillRect(unicorn.x + unicorn.width - 10, unicorn.y - unicorn.height - 10, 10, 10);
  ctx.fillStyle = 'gold';
  ctx.beginPath();
  ctx.moveTo(unicorn.x + unicorn.width, unicorn.y - unicorn.height - 10);
  ctx.lineTo(unicorn.x + unicorn.width + 10, unicorn.y - unicorn.height - 30);
  ctx.lineTo(unicorn.x + unicorn.width, unicorn.y - unicorn.height - 20);
  ctx.fill();
  ctx.fillStyle = 'pink';
  ctx.fillRect(unicorn.x + 5, unicorn.y - unicorn.height - 25, 15, 15);
  ctx.fillStyle = '#f2d6cb';
  ctx.beginPath();
  ctx.arc(unicorn.x + 12.5, unicorn.y - unicorn.height - 30, 7, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#555';
  ctx.fillRect(0, groundY, canvas.width, 2);

  drawUnicorn();

  ctx.fillStyle = 'green';
  obstacles.forEach(o => {
    ctx.fillRect(o.x, groundY - o.height, o.width, o.height);
  });

  ctx.fillStyle = '#000';
  ctx.font = '16px sans-serif';
  ctx.fillText(`Punteggio: ${score}`, canvas.width - 150, 20);

  if (gameOver) {
    ctx.fillStyle = '#000';
    ctx.font = '24px sans-serif';
    const msg = win
      ? 'Complimenti! Hai raggiunto 1000 punti!'
      : 'Game Over - tocca o premi Spazio per ricominciare';
    const msgWidth = ctx.measureText(msg).width;
    ctx.fillText(msg, (canvas.width - msgWidth) / 2, 100);
  }
}

function loop() {
  update();
  draw();
  if (!gameOver) {
    requestAnimationFrame(loop);
  }
}

requestAnimationFrame(loop);
