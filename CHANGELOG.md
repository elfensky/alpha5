# Changelog

All notable changes to this project will be documented in this file. The format
is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-05-21

### Changed

- Refined npm `keywords` for discoverability: added `norad-id`, `celestrak`,
  `satcat`, `catalog-number`, and `3le`; dropped the generic `designator`,
  `encoder`, and `decoder`. No source, API, or behavior changes.

## [1.0.0] - 2026-05-19

### Added

- Initial release.
- `decode(s)` — parse an Alpha-5 or plain numeric designator string into its
  canonical integer form. Accepts numeric strings of any length (for JSON-
  coerce compatibility) but rejects values outside the 0–339,999 range.
- `encode(n)` — encode an integer (0–339,999) into a 5-character designator
  string, using the Alpha-5 letter prefix for values 100,000 and above.
  Rejects every non-integer numeric kind (BigInt, boolean, string, null,
  undefined, NaN, Infinity, floats).
- Hand-written TypeScript declarations.
- Test suite covering every example in the Space-Track Alpha-5 documentation,
  the full A=10..Z=33 letter table, both I/O-skip boundaries in both
  directions, and a round-trip property check sampling the full 0–339,999
  range.
