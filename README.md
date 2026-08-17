# rf-toolkit

rf-toolkit is an open-source TypeScript library of RF and radar engineering
calculations, published under the MIT license by [ClutterLock](https://clutterlock.com).
It currently implements the monostatic radar range equation, together with the unit
conversions (dB, dBm, dBW, dBsm) and physical constants the calculation depends on. It is
written for radar and RF engineers, students, and tool builders who want math they can
verify line by line: the implementation is deliberately step-by-step rather than condensed,
every formula cites its source, every variable name states its unit, and the library has
zero runtime dependencies and no coupling to any framework or runtime API — it takes
numbers and returns numbers.

## Installation

The package is not yet published to npm. Install directly from GitHub:

```bash
npm install github:clutterlock/rf-toolkit
```

npm publication is planned once the API stabilises.

## Usage

```ts
import { radarMaxRange } from "rf-toolkit";

const result = radarMaxRange({
  transmitPowerW: 1e6,     // 1 MW peak
  antennaGainDbi: 45,      // monostatic: one antenna for Tx and Rx
  frequencyHz: 10e9,       // X-band, 10 GHz
  targetRcsM2: 1,          // 1 m² target
  bandwidthHz: 1e6,        // 1 MHz receiver noise bandwidth
  noiseFigureDb: 3,
  systemLossesDb: 5,       // total two-way losses
  requiredSnrDb: 13,       // detection threshold
  // systemTemperatureK defaults to 290 K
});

console.log(result.maxRangeM);            // ≈ 173134 m
console.log(result.wavelengthM);          // 0.0299792458 m
console.log(result.noisePowerW);          // ≈ 7.989e-15 W
console.log(result.minDetectableSignalW); // ≈ 1.594e-13 W
```

Invalid inputs (non-positive power, frequency, RCS, bandwidth or temperature, negative
noise figure or losses, non-finite values) throw `InvalidInputError` naming the offending
field. The function never returns `NaN` or `Infinity`.

## The radar range equation

```text
R_max = [ (Pt · G² · λ² · σ) / ((4π)³ · k · T · B · F · SNR_min · L) ]^(1/4)
```

| Symbol  | Meaning                                  | Unit          |
| ------- | ---------------------------------------- | ------------- |
| R_max   | maximum detection range                  | m             |
| Pt      | peak transmit power                      | W             |
| G       | antenna gain (same antenna Tx and Rx)    | linear        |
| λ       | wavelength, c / f                        | m             |
| σ       | target radar cross section               | m²            |
| k       | Boltzmann constant, 1.380649e-23         | J/K           |
| T       | system noise temperature                 | K             |
| B       | receiver noise bandwidth                 | Hz            |
| F       | receiver noise figure                    | linear        |
| SNR_min | required SNR at the detection threshold  | linear        |
| L       | total two-way system losses              | linear        |

The API accepts gain in dBi and noise figure, losses, and required SNR in dB; each is
converted to linear before any arithmetic, through the named conversion functions in
`src/units.ts`. All quantities in this library are power quantities, so every dB
conversion uses 10·log10, never 20·log10.

## Worked example

The following reproduces the library's reference test case
(`tests/radar/rangeEquation.test.ts`, Test 1) by hand. Inputs: Pt = 1 MW, G = 45 dBi,
f = 10 GHz, σ = 1 m², B = 1 MHz, F = 3 dB, L = 5 dB, SNR_min = 13 dB, T = 290 K.

Wavelength:

```text
λ = c / f = 299,792,458 / 10e9 = 0.0299792458 m
```

dB inputs to linear (10^(dB/10)):

```text
G       = 10^(45/10) ≈ 31,623
F       = 10^(3/10)  ≈ 1.9953
L       = 10^(5/10)  ≈ 3.1623
SNR_min = 10^(13/10) ≈ 19.953
```

Noise power:

```text
N = k · T · B · F
  = 1.380649e-23 · 290 · 1e6 · 1.9953
  ≈ 7.989e-15 W        (−111.0 dBm)
```

Minimum detectable signal:

```text
S_min = N · SNR_min ≈ 7.989e-15 · 19.953 ≈ 1.594e-13 W        (−98.0 dBm)
```

Numerator and denominator of the range equation:

```text
numerator   = Pt · G² · λ² · σ = 1e6 · (31,623)² · (0.0299792458)² · 1 ≈ 8.988e11
denominator = (4π)³ · S_min · L ≈ 1984.4 · 1.594e-13 · 3.1623          ≈ 1.0003e-9
```

Fourth root:

```text
R_max = (8.988e11 / 1.0003e-9)^(1/4) = (8.985e20)^(1/4) ≈ 173,134 m ≈ 173.1 km
```

These values are locked in the test suite; if the implementation ever drifts from them,
the tests fail.

## Assumptions and limitations

- Monostatic geometry: a single antenna serves both transmit and receive, so one gain
  value G appears squared.
- Free-space propagation: no atmospheric absorption, no rain attenuation, no multipath,
  no Earth curvature. Real-world detection ranges will generally be shorter.
- Non-fluctuating target with a fixed SNR detection threshold. Target fluctuation models
  (Swerling cases) and probability-of-detection statistics are not modeled.
- System noise temperature defaults to 290 K (the IEEE reference temperature) unless
  overridden via `systemTemperatureK`.

## Sources

- M. I. Skolnik, *Introduction to Radar Systems*, 3rd ed., McGraw-Hill.
- M. A. Richards, *Fundamentals of Radar Signal Processing*, McGraw-Hill.
- IEEE Std 686, *IEEE Standard Radar Definitions* (terminology).
- [radartutorial.eu](https://www.radartutorial.eu) (open-access reference).

## Interactive version

An interactive version of this calculator will be available at
[clutterlock.com/tools/radar-range-calculator/](https://clutterlock.com/tools/radar-range-calculator/).

## License

MIT.
