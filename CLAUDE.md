\# rf-toolkit



Open-source RF and radar engineering calculations. TypeScript, zero runtime dependencies.

Published under MIT by ClutterLock (clutterlock.com).



\## Invariants — do not violate these



\- \*\*No DOM, no framework, no browser APIs, no Node-only APIs.\*\* This library takes numbers

&#x20; and returns numbers. It must not know that a website exists.

\- \*\*Zero runtime dependencies.\*\* Dev dependencies (TypeScript, vitest) are fine.

\- \*\*Never inline unit conversions.\*\* Every dB↔linear, dBsm↔m², dBm↔W conversion goes through

&#x20; a named function in `units.ts`. No scattered `Math.pow(10, x/10)` anywhere else.

\- \*\*Do not "simplify" or refactor the radar equation into a one-liner.\*\* Step-by-step

&#x20; readability is a deliberate feature — this file exists so that people can verify the math.

\- \*\*Every formula cites its source\*\* in a code comment.

\- \*\*Power quantities use 10·log10, not 20·log10.\*\* Everything in this library is a power

&#x20; quantity: gain (dBi), RCS (dBsm), noise figure (dB), losses (dB), SNR (dB).



\## Testing



Vitest. Expected values given in a prompt are ground truth — \*\*never change an expected

value to make a test pass.\*\* If a test fails, the implementation is wrong, not the test.



\## Style



\- TypeScript strict mode

\- Named exports, no default exports

\- Explicit units in every variable name (`transmitPowerW`, `frequencyHz`, `rangeM`)

\- JSDoc on every exported function

