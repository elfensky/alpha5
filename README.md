# alpha5

NORAD Alpha-5 designator codec — encode and decode satellite catalog IDs between integers and the 5-character format used by Space-Track and modern TLE/3LE files.

Zero dependencies. Pure ESM. ~70 lines of source. One-and-done — the spec is frozen by the US Space Force.

## Why

When the satellite catalog approached the 100,000-object limit of the legacy 5-digit NORAD field, the US Space Force introduced **Alpha-5** as a stopgap: the first character of the 5-char field becomes a letter (`A`=10 through `Z`=33, skipping `I` and `O` to avoid confusion with `1` and `0`), extending the addressable range to 339,999 objects.

If you ingest TLE, 3LE, or GP/GP_HISTORY data from Space-Track, you need this codec. The official Space-Track API only accepts integer NORAD IDs for filtering, so any 5-char designator coming in must be decoded before you can use it as a database key or query parameter.

Spec: <https://www.space-track.org/documentation#tle-alpha5>

## Install

```bash
npm install @elfensky/alpha5
```

Requires Node.js 20 or newer. Works in browsers as well — no runtime dependencies.

## Usage

```js
import { decodeNoradId, formatNoradId } from '@elfensky/alpha5';

// Plain numeric designators round-trip unchanged.
decodeNoradId('25544'); // 25544
formatNoradId(25544); // '25544'

// Alpha-5 designators decode to their canonical integer.
decodeNoradId('A0123'); // 100123
formatNoradId(100123); // 'A0123'

// The I/O letters are reserved.
decodeNoradId('I0000'); // throws Error
decodeNoradId('O0000'); // throws Error

// Boundaries: A0000 = 100,000, Z9999 = 339,999.
formatNoradId(339999); // 'Z9999'
formatNoradId(340000); // throws Error: exceeds Alpha-5 range
```

## API

### `decodeNoradId(s: string): number`

Decode a NORAD designator string into its integer value.

Accepts both plain numeric strings (`"25544"`, `"00007"`) and Alpha-5 designators (`"A0123"`, `"Z9999"`). Numeric inputs of any length are accepted, so JSON sources that omit leading zeros (e.g. `"7"` instead of `"00007"`) still decode correctly.

Throws if the input is not a string, is empty, has whitespace or a sign prefix, uses a reserved letter (`I`/`O`), uses a lowercase letter, or has a non-digit tail.

### `formatNoradId(n: number): string`

Encode an integer NORAD ID into its 5-character designator string.

Values below 100,000 are zero-padded to 5 digits. Values 100,000–339,999 use the Alpha-5 letter prefix. Output is always exactly 5 characters and never contains the reserved letters `I` or `O`.

Throws if `n` is not a non-negative finite integer, or exceeds 339,999.

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

## License

MIT © Andrei Lavrenov
