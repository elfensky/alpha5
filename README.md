# alpha5

[![CI](https://github.com/elfensky/alpha5/actions/workflows/ci.yml/badge.svg)](https://github.com/elfensky/alpha5/actions/workflows/ci.yml)

NORAD Alpha-5 designator codec — encode and decode satellite catalog IDs between integers and the 5-character format used by Space-Track and modern TLE/3LE files.

Zero dependencies. Pure ESM. ~70 lines of source. One-and-done — the spec is frozen by the US Space Force.

## Why

When the satellite catalog approached the 100,000-object limit of the legacy 5-digit NORAD field, the US Space Force introduced **Alpha-5** as a stopgap: the first character of the 5-char field becomes a letter (`A`=10 through `Z`=33, skipping `I` and `O` to avoid confusion with `1` and `0`), extending the addressable range to 339,999 objects.

If you ingest TLE, 3LE, or GP/GP_HISTORY data from Space-Track, you need this codec. The official Space-Track API only accepts integer NORAD IDs for filtering, so any 5-char designator coming in must be decoded before you can use it as a database key or query parameter.

Spec: <https://www.space-track.org/documentation#tle-alpha5>

## Install

```bash
npm install alpha5
```

Requires Node.js 20 or newer. Works in browsers as well — no runtime dependencies.

## Usage

```js
import { decode, encode } from 'alpha5';
// or, for a namespace import:
//   import * as alpha5 from 'alpha5';
//   alpha5.decode('A0123');

// Plain numeric designators round-trip unchanged.
decode('25544'); // 25544
encode(25544); // '25544'

// Alpha-5 designators decode to their canonical integer.
decode('A0123'); // 100123
encode(100123); // 'A0123'

// The I/O letters are reserved.
decode('I0000'); // throws Error
decode('O0000'); // throws Error

// Boundaries: A0000 = 100,000, Z9999 = 339,999.
encode(339999); // 'Z9999'
encode(340000); // throws Error: exceeds Alpha-5 range
```

## API

### `decode(s: string): number`

Decode a NORAD designator string into its integer value in the range `0..339_999`.

Accepts both plain numeric strings (`"25544"`, `"00007"`) and Alpha-5 designators (`"A0123"`, `"Z9999"`). Numeric inputs of any length are accepted, so JSON sources that omit leading zeros (e.g. `"7"` instead of `"00007"`) still decode correctly.

Throws if the input:

- is not a string, or is empty
- has whitespace, a sign prefix, or a decimal/scientific/hex/octal/binary marker
- uses a reserved letter (`I` or `O`)
- uses a lowercase letter
- has a non-digit tail after the letter prefix
- decodes to a value greater than `339_999`

### `encode(n: number): string`

Encode an integer NORAD ID into its 5-character designator string.

- Values `0..99_999` are zero-padded to 5 digits (`encode(7) === "00007"`).
- Values `100_000..339_999` use the Alpha-5 letter prefix (`encode(100123) === "A0123"`).
- Output is **always exactly 5 characters** and never contains the reserved letters `I` or `O`.

Throws if `n` is not a non-negative finite integer, or exceeds `339_999`. `BigInt`, booleans, strings, `null`, `undefined`, `NaN`, `±Infinity`, and non-integer floats are all rejected — only plain finite integers are accepted.

## The full letter table

Verbatim from the [Space-Track Alpha-5 documentation](https://www.space-track.org/documentation#tle-alpha5):

| Letter | Value |     | Letter | Value |     | Letter | Value |
| ------ | ----- | --- | ------ | ----- | --- | ------ | ----- |
| A      | 10    |     | J      | 18    |     | S      | 26    |
| B      | 11    |     | K      | 19    |     | T      | 27    |
| C      | 12    |     | L      | 20    |     | U      | 28    |
| D      | 13    |     | M      | 21    |     | V      | 29    |
| E      | 14    |     | N      | 22    |     | W      | 30    |
| F      | 15    |     | P      | 23    |     | X      | 31    |
| G      | 16    |     | Q      | 24    |     | Y      | 32    |
| H      | 17    |     | R      | 25    |     | Z      | 33    |

`I` and `O` are omitted.

## Stability

The Alpha-5 spec is frozen by the US Space Force. This library follows it exactly and is tested against every example in the official documentation, the full letter table, both I/O-skip boundaries in both directions, and a round-trip property check across the entire 0–339,999 range.

If the spec ever changes (Space-Track recommends migrating to XML/JSON/KVN for new work — Alpha-5 is itself a stopgap), this library will follow.

## What's not provided

- **No unpadded output option.** The library produces canonical 5-character Alpha-5; if you want unpadded output for IDs below 100,000, that's just `String(n)`. Variable-width output is not part of the Alpha-5 spec and would dilute the library's purpose.
- **No bulk parsing of TLE/3LE lines.** This is a codec for the catalog-ID field only. Use a TLE parser like [`tle.js`](https://www.npmjs.com/package/tle.js) for full TLE/3LE handling and pass the catalog field through `decode` after extraction.
- **No error subclasses.** All failures throw a plain `Error` with a descriptive message. If you need to distinguish failure modes, match on the message.

## License

MIT © Andrei Lavrenov
