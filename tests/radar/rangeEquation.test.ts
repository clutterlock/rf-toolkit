import { describe, expect, it } from "vitest";
import { InvalidInputError } from "../../src/errors.js";
import {
  radarMaxRange,
  type RadarRangeInput,
} from "../../src/radar/rangeEquation.js";

const REFERENCE_INPUT: RadarRangeInput = {
  transmitPowerW: 1e6,
  antennaGainDbi: 45,
  frequencyHz: 10e9,
  targetRcsM2: 1,
  bandwidthHz: 1e6,
  noiseFigureDb: 3,
  systemLossesDb: 5,
  requiredSnrDb: 13,
};

/** Asserts actual is within the given relative tolerance of expected. */
function expectWithinRelative(
  actual: number,
  expected: number,
  relativeTolerance: number,
): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(
    relativeTolerance * Math.abs(expected),
  );
}

describe("radarMaxRange", () => {
  it("Test 1: reference case", () => {
    const result = radarMaxRange(REFERENCE_INPUT);

    expect(Math.abs(result.wavelengthM - 0.0299792458)).toBeLessThan(1e-9);
    expectWithinRelative(result.noisePowerW, 7.9888e-15, 0.005);
    expectWithinRelative(result.minDetectableSignalW, 1.594e-13, 0.005);
    expectWithinRelative(result.maxRangeM, 173140, 0.005);
  });

  it("Test 2: fourth-root scaling with RCS", () => {
    const reference = radarMaxRange(REFERENCE_INPUT);
    const halved = radarMaxRange({ ...REFERENCE_INPUT, targetRcsM2: 0.5 });

    expectWithinRelative(halved.maxRangeM, 145592, 0.005);
    // Halving RCS scales range by 0.5^0.25 ≈ 0.8409
    expectWithinRelative(halved.maxRangeM / reference.maxRangeM, 0.8409, 0.005);
  });

  it("Test 3: 16x transmit power doubles the range", () => {
    const reference = radarMaxRange(REFERENCE_INPUT);
    const boosted = radarMaxRange({ ...REFERENCE_INPUT, transmitPowerW: 16e6 });

    expectWithinRelative(boosted.maxRangeM, 2 * reference.maxRangeM, 0.001);
  });

  it("Test 4: omitting systemTemperatureK equals passing 290", () => {
    const defaulted = radarMaxRange(REFERENCE_INPUT);
    const explicit = radarMaxRange({
      ...REFERENCE_INPUT,
      systemTemperatureK: 290,
    });

    expect(defaulted.maxRangeM).toBe(explicit.maxRangeM);
    expect(defaulted.noisePowerW).toBe(explicit.noisePowerW);
    expect(defaulted.minDetectableSignalW).toBe(explicit.minDetectableSignalW);
    expect(defaulted.wavelengthM).toBe(explicit.wavelengthM);
  });

  describe("Test 5: validation", () => {
    it("accepts the valid reference input", () => {
      expect(() => radarMaxRange(REFERENCE_INPUT)).not.toThrow();
    });

    const invalidCases: Array<[keyof RadarRangeInput, number]> = [
      ["transmitPowerW", 0],
      ["transmitPowerW", -1],
      ["transmitPowerW", Number.NaN],
      ["frequencyHz", 0],
      ["frequencyHz", Number.POSITIVE_INFINITY],
      ["targetRcsM2", 0],
      ["targetRcsM2", -0.5],
      ["bandwidthHz", 0],
      ["bandwidthHz", -1e6],
      ["noiseFigureDb", -0.1],
      ["systemLossesDb", -1],
      ["requiredSnrDb", Number.NaN],
      ["requiredSnrDb", Number.POSITIVE_INFINITY],
      ["systemTemperatureK", 0],
      ["systemTemperatureK", -10],
    ];

    it.each(invalidCases)(
      "rejects %s = %f and names the field",
      (field, badValue) => {
        const input = { ...REFERENCE_INPUT, [field]: badValue };

        expect(() => radarMaxRange(input)).toThrow(InvalidInputError);
        expect(() => radarMaxRange(input)).toThrow(field);
      },
    );
  });
});
