# Changelog

All notable changes to this project will be documented in this file. The format
is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-19

### Added

- Initial release.
- `decode(s)` — parse an Alpha-5 or plain numeric designator string into its
  canonical integer form.
- `encode(n)` — encode an integer (0–339,999) into a 5-character designator
  string, using the Alpha-5 letter prefix for values 100,000 and above.
- Hand-written TypeScript declarations.
- Test suite covering every example in the Space-Track Alpha-5 documentation,
  the full A=10..Z=33 letter table, both I/O-skip boundaries in both
  directions, and a round-trip property check sampling the full 0–339,999
  range.
