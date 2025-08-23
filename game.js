const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const overlayContent = document.getElementById('overlay-content');
const overlayButton = document.getElementById('overlay-button');

function showOverlay(text, onClose) {
  overlayContent.textContent = text;
  overlay.classList.remove('hidden');
  overlayButton.onclick = () => {
    overlay.classList.add('hidden');
    overlayButton.onclick = null;
    if (onClose) onClose();
  };
}

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

const params = new URLSearchParams(window.location.search);
let level = params.get('level') === '2' ? 2 : 1;

const instructionsText = {
  1: 'Salta gli ostacoli premendo la barra spaziatrice o toccando lo schermo.',
  2: 'Attiva lo scudo per rompere i muri del Cavaliere Nero premendo la barra spaziatrice o toccando lo schermo.'
};

const storyText = {
  1: 'La principessa supera la foresta e si avvicina al castello del Cavaliere Nero.',
  2: 'Il Cavaliere Nero fugge e il regno è salvo!'
};

let gamePaused = true;

let obstacles = [];
let walls = [];
let score = 0;
// Slower game speed and lower gravity make the game easier
let speed = 3;
let gravity = 0.4;
let gameOver = false;
let win = false;
let obstacleTimer = 0;
let obstacleInterval = getObstacleInterval();
let boss = null;
// Variables for level 2
let wallTimer = 0;
let wallInterval = 90;
let shieldActive = false;
let shieldTimer = 0;
let bossFlee = false;

function getObstacleInterval() {
  return 80 + Math.random() * 70; // ensure obstacles are neither too close nor too far apart
}

function handleInput() {
  if (gamePaused) return;
  if (gameOver) {
    reset();
  } else if (level === 1 && !unicorn.jumping) {
    unicorn.vy = -12;
    unicorn.jumping = true;
  } else if (level === 2) {
    shieldActive = true;
    shieldTimer = 15;
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
  walls = [];
  score = 0;
  gameOver = false;
  win = false;
  unicorn.x = 50;
  unicorn.y = groundY;
  unicorn.vy = 0;
  unicorn.jumping = false;
  obstacleTimer = 0;
  obstacleInterval = getObstacleInterval();
  boss = null;
  wallTimer = 0;
  shieldActive = false;
  shieldTimer = 0;
  bossFlee = false;
  level = params.get('level') === '2' ? 2 : 1;
  gamePaused = true;
  showOverlay(instructionsText[level], () => {
    if (level === 2) {
      startLevel2();
    }
    gamePaused = false;
    requestAnimationFrame(loop);
  });
}

function startLevel2() {
  boss = { x: canvas.width - 80, width: 40, height: 60 };
  walls = [];
  wallTimer = 0;
  bossFlee = false;
  unicorn.y = groundY;
}

function updateLevel1() {
  unicorn.y += unicorn.vy;
  if (unicorn.y < groundY) {
    unicorn.vy += gravity;
  } else {
    unicorn.y = groundY;
    unicorn.vy = 0;
    unicorn.jumping = false;
  }

  obstacleTimer++;
  if (obstacleTimer > obstacleInterval) {
    obstacles.push({ x: canvas.width, width: 20, height: 40 });
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

  if (score >= 1000) {
    gamePaused = true;
    obstacles = [];
    showOverlay(storyText[1], () => {
      level = 2;
      showOverlay(instructionsText[2], () => {
        startLevel2();
        gamePaused = false;
        requestAnimationFrame(loop);
      });
    });
  }
}

function updateLevel2() {
  unicorn.y = groundY;

  if (shieldActive) {
    shieldTimer--;
    if (shieldTimer <= 0) {
      shieldActive = false;
    }
  }

  wallTimer++;
  if (wallTimer > wallInterval && !bossFlee) {
    walls.push({ x: boss.x, width: 30, height: 50 });
    wallTimer = 0;
    wallInterval = 60 + Math.random() * 60;
  }

  walls.forEach(w => w.x -= speed + 2);
  walls = walls.filter(w => {
    if (w.x + w.width < 0) return false;
    if (w.x <= unicorn.x + unicorn.width) {
      if (shieldActive) {
        unicorn.x += 20;
        return false;
      } else {
        gameOver = true;
        return false;
      }
    }
    return true;
  });

  if (unicorn.x + unicorn.width >= boss.x - 20) {
    bossFlee = true;
  }

  if (bossFlee) {
    boss.x += speed + 4;
    if (boss.x > canvas.width) {
      gameOver = true;
      win = true;
      gamePaused = true;
      showOverlay(storyText[2], () => { gamePaused = false; });
    }
  }
}

function update() {
  if (level === 1) {
    updateLevel1();
  } else {
    updateLevel2();
  }
  if (!gameOver) {
    score++;
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
  if (shieldActive && level === 2) {
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(unicorn.x + unicorn.width / 2, unicorn.y - unicorn.height / 2, unicorn.width, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#555';
  ctx.fillRect(0, groundY, canvas.width, 2);

  drawUnicorn();

  if (level === 1) {
    ctx.fillStyle = 'green';
    obstacles.forEach(o => {
      ctx.fillRect(o.x, groundY - o.height, o.width, o.height);
    });
  } else {
    ctx.fillStyle = 'gray';
    walls.forEach(w => {
      ctx.fillRect(w.x, groundY - w.height, w.width, w.height);
    });
    ctx.fillStyle = 'black';
    ctx.fillRect(boss.x, groundY - boss.height, boss.width, boss.height);
  }

  ctx.fillStyle = '#000';
  ctx.font = '16px sans-serif';
  ctx.fillText(`Punteggio: ${score}`, canvas.width - 150, 20);

  if (gameOver) {
    ctx.fillStyle = '#000';
    ctx.font = '24px sans-serif';
    const msg = win
      ? 'Complimenti! Hai sconfitto il Cavaliere Nero!'
      : 'Game Over - tocca o premi Spazio per ricominciare';
    const msgWidth = ctx.measureText(msg).width;
    ctx.fillText(msg, (canvas.width - msgWidth) / 2, 100);
  }
}

function loop() {
  update();
  draw();
  if (!gameOver && !gamePaused) {
    requestAnimationFrame(loop);
  }
}

showOverlay(instructionsText[level], () => {
  if (level === 2) {
    startLevel2();
  }
  gamePaused = false;
  requestAnimationFrame(loop);
});
