/** Types for the vendored simplex-noise bundle in simplex-noise.js. */
export default class SimplexNoise {
  /**
   * @param random A PRNG function, or any seed value to derive one from.
   *               Omit for `Math.random`.
   */
  constructor(random?: (() => number) | string | number);
  noise2D(x: number, y: number): number;
  noise3D(x: number, y: number, z: number): number;
  noise4D(x: number, y: number, z: number, w: number): number;
}
