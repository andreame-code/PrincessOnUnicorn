const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const groundY = 150;

const unicorn = {
  x: 50,
  y: groundY,
  width: 40,
  height: 40,
  vy: 0,
  jumping: false
};

let obstacles = [];
let score = 0;
let speed = 6;
let gravity = 0.6;
let gameOver = false;

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    if (gameOver) {
      reset();
    } else if (!unicorn.jumping) {
      unicorn.vy = -12;
      unicorn.jumping = true;
    }
  }
});

function reset() {
  obstacles = [];
  score = 0;
  gameOver = false;
  unicorn.y = groundY;
  unicorn.vy = 0;
  unicorn.jumping = false;
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

  if (Math.random() < 0.02) {
    obstacles.push({x: canvas.width, width: 20, height: 40});
  }

  obstacles.forEach(o => o.x -= speed);
  obstacles = obstacles.filter(o => o.x + o.width > 0);

  obstacles.forEach(o => {
    if (unicorn.x < o.x + o.width &&
        unicorn.x + unicorn.width > o.x &&
        unicorn.y > groundY - o.height) {
      gameOver = true;
    }
  });

  score++;
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
  ctx.fillText(`Punteggio: ${score}`, 650, 20);

  if (gameOver) {
    ctx.fillStyle = '#000';
    ctx.font = '24px sans-serif';
    ctx.fillText('Game Over - premi Spazio per ricominciare', 120, 100);
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
