/**
 * Monostatic radar range equation.
 *
 * R_max = [ (Pt · G² · λ² · σ) / ((4π)³ · k · T · B · F · SNR_min · L) ]^(1/4)
 *
 * Source: Skolnik, "Introduction to Radar Systems", 3rd ed., Ch. 2.
 *
 * The implementation is deliberately written as discrete named steps so the
 * math can be verified against the textbook — do not condense it.
 */

import { BOLTZMANN, SPEED_OF_LIGHT, T0_REFERENCE } from "../constants.js";
import { InvalidInputError } from "../errors.js";
import { dbiToLinearGain, dbToLinear } from "../units.js";

export interface RadarRangeInput {
  /** Peak transmit power, watts. */
  transmitPowerW: number;
  /** Antenna gain, dBi. Monostatic: one antenna serves both Tx and Rx. */
  antennaGainDbi: number;
  /** Operating frequency, Hz. */
  frequencyHz: number;
  /** Target radar cross section, m². */
  targetRcsM2: number;
  /** Receiver noise bandwidth, Hz. */
  bandwidthHz: number;
  /** Receiver noise figure, dB. */
  noiseFigureDb: number;
  /** Total two-way system losses, dB. */
  systemLossesDb: number;
  /** Detection threshold SNR, dB. */
  requiredSnrDb: number;
  /** System noise temperature, K. Defaults to T0_REFERENCE (290 K). */
  systemTemperatureK?: number;
}

export interface RadarRangeResult {
  /** Maximum detection range, m. */
  maxRangeM: number;
  /** Wavelength, m. */
  wavelengthM: number;
  /** Minimum detectable signal, W. */
  minDetectableSignalW: number;
  /** Receiver noise power, W. */
  noisePowerW: number;
}

function validate(input: RadarRangeInput): void {
  if (!Number.isFinite(input.transmitPowerW) || input.transmitPowerW <= 0) {
    throw new InvalidInputError("transmitPowerW must be a finite number > 0");
  }
  if (!Number.isFinite(input.antennaGainDbi)) {
    throw new InvalidInputError("antennaGainDbi must be a finite number");
  }
  if (!Number.isFinite(input.frequencyHz) || input.frequencyHz <= 0) {
    throw new InvalidInputError("frequencyHz must be a finite number > 0");
  }
  if (!Number.isFinite(input.targetRcsM2) || input.targetRcsM2 <= 0) {
    throw new InvalidInputError("targetRcsM2 must be a finite number > 0");
  }
  if (!Number.isFinite(input.bandwidthHz) || input.bandwidthHz <= 0) {
    throw new InvalidInputError("bandwidthHz must be a finite number > 0");
  }
  if (!Number.isFinite(input.noiseFigureDb) || input.noiseFigureDb < 0) {
    throw new InvalidInputError("noiseFigureDb must be a finite number >= 0");
  }
  if (!Number.isFinite(input.systemLossesDb) || input.systemLossesDb < 0) {
    throw new InvalidInputError("systemLossesDb must be a finite number >= 0");
  }
  if (!Number.isFinite(input.requiredSnrDb)) {
    throw new InvalidInputError("requiredSnrDb must be a finite number");
  }
  if (input.systemTemperatureK !== undefined) {
    if (
      !Number.isFinite(input.systemTemperatureK) ||
      input.systemTemperatureK <= 0
    ) {
      throw new InvalidInputError(
        "systemTemperatureK must be a finite number > 0 when provided",
      );
    }
  }
}

/**
 * Solves the monostatic radar range equation for maximum detection range.
 *
 * R_max = [ (Pt · G² · λ² · σ) / ((4π)³ · k · T · B · F · SNR_min · L) ]^(1/4)
 *
 * Source: Skolnik, "Introduction to Radar Systems", 3rd ed., Ch. 2.
 *
 * @param input - Radar system and target parameters (units per field JSDoc).
 * @returns Maximum range (m), wavelength (m), minimum detectable signal (W),
 *   and noise power (W).
 * @throws InvalidInputError when an input is out of its physical domain.
 */
export function radarMaxRange(input: RadarRangeInput): RadarRangeResult {
  validate(input);

  // Step 1: wavelength λ = c / f
  const wavelengthM = SPEED_OF_LIGHT / input.frequencyHz;

  // Step 2: antenna gain, dBi → linear
  const gainLinear = dbiToLinearGain(input.antennaGainDbi);

  // Step 3: noise figure, losses, and required SNR, dB → linear
  const noiseFigureLinear = dbToLinear(input.noiseFigureDb);
  const lossesLinear = dbToLinear(input.systemLossesDb);
  const snrMinLinear = dbToLinear(input.requiredSnrDb);

  // Step 4: system temperature, defaulting to the IEEE 290 K reference
  const temperatureK = input.systemTemperatureK ?? T0_REFERENCE;

  // Step 5: noise power N = k · T · B · F
  const noisePowerW =
    BOLTZMANN * temperatureK * input.bandwidthHz * noiseFigureLinear;

  // Step 6: minimum detectable signal Smin = N · SNR_min
  const minDetectableSignalW = noisePowerW * snrMinLinear;

  // Step 7: numerator Pt · G² · λ² · σ
  const numerator =
    input.transmitPowerW *
    gainLinear *
    gainLinear *
    wavelengthM *
    wavelengthM *
    input.targetRcsM2;

  // Step 8: denominator (4π)³ · Smin · L
  const fourPiCubed = Math.pow(4 * Math.PI, 3);
  const denominator = fourPiCubed * minDetectableSignalW * lossesLinear;

  // Step 9: fourth root
  const maxRangeM = Math.pow(numerator / denominator, 0.25);

  // Validated inputs cannot produce NaN, but extreme magnitudes can overflow.
  if (!Number.isFinite(maxRangeM)) {
    throw new InvalidInputError(
      "inputs are too extreme: computed maxRangeM is not finite",
    );
  }

  return { maxRangeM, wavelengthM, minDetectableSignalW, noisePowerW };
}
