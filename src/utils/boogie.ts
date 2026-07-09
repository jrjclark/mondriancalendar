export function boogieLineOffset(seed: string): string {
  const offsetUnits = hashSeed(seed) % 20;
  return `calc(var(--line-size) * -${offsetUnits})`;
}

export function boogieLineVariables(seed: string): Record<'--boogie-h-offset' | '--boogie-v-offset', string> {
  return {
    '--boogie-h-offset': boogieLineOffset(`${seed}:horizontal`),
    '--boogie-v-offset': boogieLineOffset(`${seed}:vertical`),
  };
}

function hashSeed(seed: string): number {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return hash;
}
