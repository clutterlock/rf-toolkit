import { describe, expect, it } from "vitest";
import {
  dbiToLinearGain,
  dbmToWatts,
  dbsmToSquareMeters,
  dbToLinear,
  dbwToWatts,
  linearToDb,
  squareMetersToDbsm,
  wattsToDbm,
  wattsToDbw,
} from "../src/units.js";

/** Linear-domain magnitudes spanning 1e-6 up to 1e6, one per decade. */
const MAGNITUDES = Array.from({ length: 13 }, (_, i) => Math.pow(10, i - 6));

function expectClose(actual: number, expected: number): void {
  expect(actual / expected).toBeCloseTo(1, 12);
}

describe("round trips across decades", () => {
  it("linearToDb ↔ dbToLinear", () => {
    for (const ratio of MAGNITUDES) {
      expectClose(dbToLinear(linearToDb(ratio)), ratio);
    }
  });

  it("dbToLinear ↔ linearToDb (dB-domain start)", () => {
    for (const ratio of MAGNITUDES) {
      const db = linearToDb(ratio); // -60 dB … +60 dB
      expect(linearToDb(dbToLinear(db))).toBeCloseTo(db, 10);
    }
  });

  it("dbiToLinearGain ↔ linearToDb", () => {
    for (const gain of MAGNITUDES) {
      expectClose(dbiToLinearGain(linearToDb(gain)), gain);
    }
  });

  it("squareMetersToDbsm ↔ dbsmToSquareMeters", () => {
    for (const m2 of MAGNITUDES) {
      expectClose(dbsmToSquareMeters(squareMetersToDbsm(m2)), m2);
    }
  });

  it("wattsToDbm ↔ dbmToWatts", () => {
    for (const w of MAGNITUDES) {
      expectClose(dbmToWatts(wattsToDbm(w)), w);
    }
  });

  it("wattsToDbw ↔ dbwToWatts", () => {
    for (const w of MAGNITUDES) {
      expectClose(dbwToWatts(wattsToDbw(w)), w);
    }
  });
});

describe("anchor values", () => {
  it("dbToLinear(0) === 1", () => {
    expect(dbToLinear(0)).toBe(1);
  });

  it("dbToLinear(10) === 10", () => {
    expect(dbToLinear(10)).toBe(10);
  });

  it("dbToLinear(3) ≈ 1.9953 (tolerance 1e-4)", () => {
    expect(Math.abs(dbToLinear(3) - 1.9953)).toBeLessThan(1e-4);
  });

  it("dbmToWatts(30) === 1", () => {
    expect(dbmToWatts(30)).toBe(1);
  });

  it("dbmToWatts(0) === 0.001", () => {
    expect(dbmToWatts(0)).toBe(0.001);
  });

  it("squareMetersToDbsm(1) === 0", () => {
    expect(squareMetersToDbsm(1)).toBe(0);
  });
});
