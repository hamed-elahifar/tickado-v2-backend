export function randomNumber(min = 10000, max = 99999): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
