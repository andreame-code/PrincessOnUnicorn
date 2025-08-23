export function isColliding(a, b) {
  const aLeft = a.x;
  const aRight = a.x + a.width;
  const aTop = a.y - a.height;
  const aBottom = a.y;

  const bLeft = b.x;
  const bRight = b.x + b.width;
  const bTop = b.y - b.height;
  const bBottom = b.y;

  return (
    aLeft < bRight &&
    aRight > bLeft &&
    aBottom > bTop &&
    aTop < bBottom
  );
}
