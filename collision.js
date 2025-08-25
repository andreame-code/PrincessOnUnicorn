// Axis-aligned bounding box collision detection using hitboxes centered on the
// entities' logical coordinates. The `x`/`y` values supplied by the caller are
// treated as the bottom-left corner in world units, so we convert them to
// centre-based values before performing the overlap test. This keeps collision
// results consistent regardless of how sprites are scaled for rendering.
export function isColliding(a, b) {
  const ax = a.x + a.width / 2;
  const ay = a.y - a.height / 2;
  const bx = b.x + b.width / 2;
  const by = b.y - b.height / 2;

  return (
    Math.abs(ax - bx) * 2 < a.width + b.width &&
    Math.abs(ay - by) * 2 < a.height + b.height
  );
}
