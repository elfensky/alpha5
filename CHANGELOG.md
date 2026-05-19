# Changelog

All notable changes to this project will be documented in this file. The format
is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-19

### Added

- Initial release.
- `decodeNoradId(s)` — decode NORAD designator strings (plain numeric or
  Alpha-5) into their canonical integer form.
- `formatNoradId(n)` — encode integer NORAD IDs into 5-character designator
  strings, using Alpha-5 letter prefix for values 100,000–339,999.
- Hand-written TypeScript declarations.
- Test suite covering every example in the Space-Track Alpha-5 documentation,
  the full A=10..Z=33 letter table, both I/O-skip boundaries in both
  directions, and a round-trip property check sampling the full 0–339,999
  range.
