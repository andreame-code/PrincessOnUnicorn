export const WORLD_WIDTH = 16;
export const WORLD_HEIGHT = 9;

// Speeds and distances are expressed in world units. In production one world
// unit corresponds to roughly 100 screen pixels when the canvas is displayed
// at its default size. Using logical units keeps gameplay consistent across
// different viewport resolutions.
export const GAME_SPEED = 1.8; // world units per second
// Keep the fall speed consistent while tuning jump height separately.
export const GRAVITY = 13.5; // world units per second^2
export const LEVEL_UP_SCORE = 1000;
// Boost the launch velocity so the princess can clear taller trees.
export const JUMP_VELOCITY = -7; // world units per second
// Delay between canvas resize adjustments (ms)
export const RESIZE_THROTTLE_MS = 200;
// Extra reach for the level 2 shield in world units
export const SHIELD_RANGE = 0.3;
// Default shield cooldown duration in seconds
export const SHIELD_COOLDOWN = 0.5;
// Duration the shield stays active in seconds
export const SHIELD_DURATION = 0.5;
// Grace window after an attack where the shield can still be activated (seconds)
export const SHIELD_GRACE = 0.16;
