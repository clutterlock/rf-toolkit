/**
 * Unit conversions for rf-toolkit.
 *
 * All quantities in this library are POWER quantities (gain, RCS, noise figure,
 * losses, SNR), so all dB conversions here use 10·log10, never 20·log10.
 *
 * Every dB↔linear conversion in this library must go through a function in this
 * file — no inline Math.pow(10, x/10) anywhere else.
 *
 * Formula source for the decibel definitions: IEEE Std 100 (The Authoritative
 * Dictionary of IEEE Standards Terms); Pozar, "Microwave Engineering", 4th ed.
 */

/**
 * Converts a power ratio in decibels to a linear power ratio.
 *
 * ratio = 10^(dB/10)
 *
 * @param db - Power ratio in dB (dimensionless).
 * @returns Linear power ratio (dimensionless).
 */
export function dbToLinear(db: number): number {
  return Math.pow(10, db / 10);
}

/**
 * Converts a linear power ratio to decibels.
 *
 * dB = 10·log10(ratio)
 *
 * @param ratio - Linear power ratio (dimensionless).
 * @returns Power ratio in dB (dimensionless).
 */
export function linearToDb(ratio: number): number {
  return 10 * Math.log10(ratio);
}

/**
 * Converts antenna gain in dBi to linear gain.
 *
 * Same math as {@link dbToLinear} — antenna gain relative to an isotropic
 * radiator is a power ratio. Separate name so call sites state their intent.
 *
 * @param dbi - Antenna gain in dBi (relative to isotropic).
 * @returns Linear gain (dimensionless).
 */
export function dbiToLinearGain(dbi: number): number {
  return dbToLinear(dbi);
}

/**
 * Converts radar cross section in dBsm to square meters.
 *
 * σ = 10^(dBsm/10), where dBsm is dB relative to 1 m².
 * Source: Skolnik, "Radar Handbook", 3rd ed., ch. 14.
 *
 * @param dbsm - Radar cross section in dBsm (dB relative to 1 m²).
 * @returns Radar cross section in m².
 */
export function dbsmToSquareMeters(dbsm: number): number {
  return dbToLinear(dbsm);
}

/**
 * Converts radar cross section in square meters to dBsm.
 *
 * dBsm = 10·log10(σ / 1 m²).
 * Source: Skolnik, "Radar Handbook", 3rd ed., ch. 14.
 *
 * @param m2 - Radar cross section in m².
 * @returns Radar cross section in dBsm (dB relative to 1 m²).
 */
export function squareMetersToDbsm(m2: number): number {
  return linearToDb(m2);
}

/**
 * Converts power in dBm to watts.
 *
 * W = 10^((dBm − 30)/10), where dBm is dB relative to 1 mW.
 *
 * @param dbm - Power in dBm (dB relative to 1 mW).
 * @returns Power in W.
 */
export function dbmToWatts(dbm: number): number {
  return dbToLinear(dbm - 30);
}

/**
 * Converts power in watts to dBm.
 *
 * dBm = 10·log10(W / 1 mW) = 10·log10(W) + 30.
 *
 * @param w - Power in W.
 * @returns Power in dBm (dB relative to 1 mW).
 */
export function wattsToDbm(w: number): number {
  return linearToDb(w) + 30;
}

/**
 * Converts power in dBW to watts.
 *
 * W = 10^(dBW/10), where dBW is dB relative to 1 W.
 *
 * @param dbw - Power in dBW (dB relative to 1 W).
 * @returns Power in W.
 */
export function dbwToWatts(dbw: number): number {
  return dbToLinear(dbw);
}

/**
 * Converts power in watts to dBW.
 *
 * dBW = 10·log10(W / 1 W).
 *
 * @param w - Power in W.
 * @returns Power in dBW (dB relative to 1 W).
 */
export function wattsToDbw(w: number): number {
  return linearToDb(w);
}
