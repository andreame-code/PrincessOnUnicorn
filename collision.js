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

export const LANDING_EPSILON = 0.001;

export function isLandingOn(a, b, epsilon = LANDING_EPSILON) {
  if (!isColliding(a, b)) return false;
  const aBottom = a.y + a.height / 2;
  const bTop = b.y - b.height / 2;
  const verticalOverlap = aBottom - bTop;
  const aRight = a.x + a.width / 2;
  const aLeft = a.x - a.width / 2;
  const bRight = b.x + b.width / 2;
  const bLeft = b.x - b.width / 2;
  const horizontalOverlap = Math.min(aRight, bRight) - Math.max(aLeft, bLeft);
  return verticalOverlap <= horizontalOverlap + epsilon && a.vy > 0;
}
