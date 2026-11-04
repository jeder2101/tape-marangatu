export const BEHAVIOR = {
  IDLE: 'idle',
  PATROL: 'patrol',
  CHASE: 'chase',
  ATTACK: 'attack',
  FLEE: 'flee',
  DEAD: 'dead',
};

export function distanceXZ(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}
