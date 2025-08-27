export function isColliding(a, b) {
  const aLeft = a.x - a.width / 2;
  const aRight = a.x + a.width / 2;
  const aTop = a.y - a.height / 2;
  const aBottom = a.y + a.height / 2;

  const bLeft = b.x - b.width / 2;
  const bRight = b.x + b.width / 2;
  const bTop = b.y - b.height / 2;
  const bBottom = b.y + b.height / 2;

  return (
    aLeft < bRight &&
    aRight > bLeft &&
    aBottom > bTop &&
    aTop < bBottom
  );
}

export function playerEnemyCollision(player, enemy) {
  if (!isColliding(player, enemy)) return null;
  const playerBottom = player.y + player.height / 2;
  const enemyTop = enemy.y - enemy.height / 2;
  if (player.vy > 0 && playerBottom - player.vy <= enemyTop) {
    return 'top';
  }
  return 'side';
}
