function isColliding(unicorn, obstacle, groundY) {
  return (
    unicorn.x < obstacle.x + obstacle.width &&
    unicorn.x + unicorn.width > obstacle.x &&
    unicorn.y > groundY - obstacle.height
  );
}

if (typeof module !== 'undefined') {
  module.exports = { isColliding };
}
