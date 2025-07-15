export function calculateLevel(xp: number): number {
  let level = 1;
  while (xp >= Math.floor(100 * Math.pow(level, 1.5))) {
    level++;
  }
  return level;
}
