/**
 * @module alpha5.test
 *
 * Coverage for the NORAD Alpha-5 codec. Grounded in the official
 * Space-Track documentation:
 *   https://www.space-track.org/documentation#tle-alpha5
 */

import { describe, test, expect } from 'vitest';
import { decode, encode } from '../src/index.js';

describe('decode', () => {
    test('plain numeric designator', () => {
        expect(decode('1')).toBe(1);
    });

    test('plain numeric designator', () => {
        expect(decode('25544')).toBe(25544);
    });

    test('plain numeric with leading zeros', () => {
        expect(decode('00007')).toBe(7);
        expect(decode('00256')).toBe(256);
    });

    test('Alpha-5: A0000 == 100000', () => {
        expect(decode('A0000')).toBe(100000);
    });

    test('Alpha-5: A0123 == 100123', () => {
        expect(decode('A0123')).toBe(100123);
    });

    test('Alpha-5: B0000 == 110000', () => {
        expect(decode('B0000')).toBe(110000);
    });

    test('Alpha-5: H9999 == 179999 (last before I-skip)', () => {
        expect(decode('H9999')).toBe(179999);
    });

    test('Alpha-5: J0000 == 180000 (skips I)', () => {
        expect(decode('J0000')).toBe(180000);
    });

    test('Alpha-5: N9999 == 229999 (last before O-skip)', () => {
        expect(decode('N9999')).toBe(229999);
    });

    test('Alpha-5: P0000 == 230000 (skips O)', () => {
        expect(decode('P0000')).toBe(230000);
    });

    test('Alpha-5: Z9999 == 339999 (max representable)', () => {
        expect(decode('Z9999')).toBe(339999);
    });

    test('rejects I prefix (reserved)', () => {
        expect(() => decode('I0000')).toThrow(/Invalid NORAD/);
    });

    test('rejects O prefix (reserved)', () => {
        expect(() => decode('O0000')).toThrow(/Invalid NORAD/);
    });

    test('rejects lowercase prefix', () => {
        expect(() => decode('a0123')).toThrow(/Invalid NORAD/);
    });

    test('rejects empty string', () => {
        expect(() => decode('')).toThrow(/Invalid NORAD/);
    });

    test('rejects null', () => {
        expect(() => decode(/** @type {any} */ (null))).toThrow(/Invalid NORAD/);
    });

    test('rejects undefined', () => {
        expect(() => decode(/** @type {any} */ (undefined))).toThrow(/Invalid NORAD/);
    });

    test('rejects non-string', () => {
        expect(() => decode(/** @type {any} */ (12345))).toThrow(/Invalid NORAD/);
    });

    test('rejects special chars in prefix', () => {
        expect(() => decode('@0123')).toThrow(/Invalid NORAD/);
    });

    test('rejects non-numeric tail', () => {
        expect(() => decode('Axxxx')).toThrow(/Invalid NORAD/);
    });
});

describe('encode', () => {
    test('plain numeric is zero-padded to 5 chars', () => {
        expect(encode(7)).toBe('00007');
        expect(encode(25544)).toBe('25544');
        expect(encode(99999)).toBe('99999');
    });

    test('Alpha-5: 100000 → A0000', () => {
        expect(encode(100000)).toBe('A0000');
    });

    test('Alpha-5: 100123 → A0123', () => {
        expect(encode(100123)).toBe('A0123');
    });

    test('Alpha-5: 110000 → B0000', () => {
        expect(encode(110000)).toBe('B0000');
    });

    test('Alpha-5: 180000 → J0000 (skips I)', () => {
        expect(encode(180000)).toBe('J0000');
    });

    test('Alpha-5: 230000 → P0000 (skips O)', () => {
        expect(encode(230000)).toBe('P0000');
    });

    test('Alpha-5: 339999 → Z9999 (max)', () => {
        expect(encode(339999)).toBe('Z9999');
    });

    test('rejects negative', () => {
        expect(() => encode(-1)).toThrow(/Invalid NORAD/);
    });

    test('rejects NaN', () => {
        expect(() => encode(NaN)).toThrow(/Invalid NORAD/);
    });

    test('rejects non-integer', () => {
        expect(() => encode(1.5)).toThrow(/Invalid NORAD/);
    });

    test('rejects beyond Alpha-5 range', () => {
        expect(() => encode(340000)).toThrow(/exceeds Alpha-5/);
    });

    test('round-trip: decode(format(n)) == n for full range', () => {
        const samples = [
            0, 7, 25544, 99999, 100000, 100123, 110000, 179999, 180000, 229999, 230000,
            339999,
        ];
        for (const n of samples) {
            expect(decode(encode(n))).toBe(n);
        }
    });
});

// ------------------------------------------------------------------
// Space-Track spec compliance — verbatim from documentation
// https://www.space-track.org/documentation#tle-alpha5
// ------------------------------------------------------------------

describe('Space-Track spec — reference examples (docs verbatim)', () => {
    // The six examples published on space-track.org/documentation:
    //   100000 => A0000
    //   148493 => E8493
    //   182931 => J2931
    //   234018 => P4018
    //   301928 => W1928
    //   339999 => Z9999
    const examples = /** @type {[number, string][]} */ ([
        [100000, 'A0000'],
        [148493, 'E8493'],
        [182931, 'J2931'],
        [234018, 'P4018'],
        [301928, 'W1928'],
        [339999, 'Z9999'],
    ]);

    test.each(examples)('decodes %s ← %s (per Space-Track docs)', (n, s) => {
        expect(decode(s)).toBe(n);
    });

    test.each(examples)('formats %s → %s (per Space-Track docs)', (n, s) => {
        expect(encode(n)).toBe(s);
    });
});

describe('Space-Track spec — full A=10..Z=33 letter table', () => {
    const letterTable = /** @type {[string, number][]} */ ([
        ['A', 10],
        ['B', 11],
        ['C', 12],
        ['D', 13],
        ['E', 14],
        ['F', 15],
        ['G', 16],
        ['H', 17],
        ['J', 18],
        ['K', 19],
        ['L', 20],
        ['M', 21],
        ['N', 22],
        ['P', 23],
        ['Q', 24],
        ['R', 25],
        ['S', 26],
        ['T', 27],
        ['U', 28],
        ['V', 29],
        ['W', 30],
        ['X', 31],
        ['Y', 32],
        ['Z', 33],
    ]);

    test('table has all 24 valid letters (no I, no O)', () => {
        expect(letterTable).toHaveLength(24);
        expect(letterTable.map(([l]) => l)).not.toContain('I');
        expect(letterTable.map(([l]) => l)).not.toContain('O');
    });

    test.each(letterTable)('decode %s0000 = %s * 10000', (letter, value) => {
        expect(decode(`${letter}0000`)).toBe(value * 10000);
    });

    test.each(letterTable)('decode %s9999 = %s * 10000 + 9999', (letter, value) => {
        expect(decode(`${letter}9999`)).toBe(value * 10000 + 9999);
    });

    test.each(letterTable)('format(%s * 10000) = %s0000', (letter, value) => {
        expect(encode(value * 10000)).toBe(`${letter}0000`);
    });

    test.each(letterTable)('format(%s * 10000 + 9999) = %s9999', (letter, value) => {
        expect(encode(value * 10000 + 9999)).toBe(`${letter}9999`);
    });
});

describe('Reserved letters — I and O rejected', () => {
    const reservedPrefixes = ['I0000', 'I9999', 'I5050', 'O0000', 'O9999', 'O5050'];
    test.each(reservedPrefixes)('decode rejects reserved prefix: %s', (s) => {
        expect(() => decode(s)).toThrow(/Invalid NORAD/);
    });

    const lettersInTail = ['A012B', 'B12C4', 'CABCD'];
    test.each(lettersInTail)('decode rejects letters in numeric tail: %s', (s) => {
        expect(() => decode(s)).toThrow(/Invalid NORAD/);
    });

    test('valid prefix + valid tail with digits passes (sanity: D1234 = 131234)', () => {
        expect(decode('D1234')).toBe(131234);
    });

    test('format() can never produce a string containing I or O', () => {
        for (let n = 100000; n <= 339999; n += 1) {
            const s = encode(n);
            expect(s).not.toMatch(/[IO]/);
        }
    });
});

describe('I/O skip boundaries — bidirectional', () => {
    const boundaries = /** @type {[number, string][]} */ ([
        [179999, 'H9999'],
        [180000, 'J0000'],
        [229999, 'N9999'],
        [230000, 'P0000'],
    ]);

    test.each(boundaries)('decode %s ← %s', (n, s) => {
        expect(decode(s)).toBe(n);
    });
    test.each(boundaries)('format %s → %s', (n, s) => {
        expect(encode(n)).toBe(s);
    });

    test('no gap across I-skip', () => {
        expect(decode(encode(180000))).toBe(decode('H9999') + 1);
    });
    test('no gap across O-skip', () => {
        expect(decode(encode(230000))).toBe(decode('N9999') + 1);
    });
});

describe('Plain-numeric / Alpha-5 boundary at 99999 ↔ 100000', () => {
    test('decode 99999 (last plain) → 99999', () => {
        expect(decode('99999')).toBe(99999);
    });
    test('decode A0000 (first Alpha-5) → 100000', () => {
        expect(decode('A0000')).toBe(100000);
    });
    test('format 99999 → "99999" (no letter)', () => {
        expect(encode(99999)).toBe('99999');
    });
    test('format 100000 → "A0000" (letter required)', () => {
        expect(encode(100000)).toBe('A0000');
    });
    test('format always produces exactly 5 characters', () => {
        const samples = [0, 7, 99, 999, 9999, 99999, 100000, 200000, 339999];
        for (const n of samples) {
            expect(encode(n)).toHaveLength(5);
        }
    });
});

describe('Round-trip property: decode(format(n)) === n', () => {
    // Sample every 137th value. 137 is coprime with 10,000 (the per-letter
    // stride), so this catches off-by-one errors anywhere in the letter table.
    test('holds for every 137th value in 0..339999', () => {
        for (let n = 0; n <= 339999; n += 137) {
            expect(decode(encode(n))).toBe(n);
        }
    });

    test('holds for every I-skip and O-skip neighbour', () => {
        const neighbours = [
            170000, 179998, 179999, 180000, 180001, 189999, 220000, 229998, 229999,
            230000, 230001, 239999,
        ];
        for (const n of neighbours) {
            expect(decode(encode(n))).toBe(n);
        }
    });
});

describe('format() out-of-range rejections', () => {
    test('rejects 340000 (one past max)', () => {
        expect(() => encode(340000)).toThrow(/exceeds Alpha-5/);
    });
    test('rejects Number.MAX_SAFE_INTEGER', () => {
        expect(() => encode(Number.MAX_SAFE_INTEGER)).toThrow(/exceeds Alpha-5/);
    });
    test('rejects Infinity', () => {
        expect(() => encode(Infinity)).toThrow(/Invalid NORAD/);
    });
    test('rejects -Infinity', () => {
        expect(() => encode(-Infinity)).toThrow(/Invalid NORAD/);
    });
});

describe('decode() input shape — strict vs permissive', () => {
    test('accepts unpadded short numeric (JSON sources may omit padding)', () => {
        expect(decode('7')).toBe(7);
    });
    test('accepts 5-char zero-padded numeric', () => {
        expect(decode('00007')).toBe(7);
    });
    test('rejects mixed alphanumeric tail "1234A" (parseInt-truncation guard)', () => {
        expect(() => decode('1234A')).toThrow(/Invalid NORAD/);
    });
    test('rejects leading whitespace', () => {
        expect(() => decode(' 25544')).toThrow(/Invalid NORAD/);
    });
    test('rejects trailing whitespace', () => {
        expect(() => decode('25544 ')).toThrow(/Invalid NORAD/);
    });
    test('rejects sign prefix', () => {
        expect(() => decode('+25544')).toThrow(/Invalid NORAD/);
        expect(() => decode('-25544')).toThrow(/Invalid NORAD/);
    });
    test('rejects all 26 lowercase letter prefixes (a–z)', () => {
        for (let c = 'a'.charCodeAt(0); c <= 'z'.charCodeAt(0); c++) {
            const s = String.fromCharCode(c) + '0123';
            expect(() => decode(s)).toThrow(/Invalid NORAD/);
        }
    });
});

describe('decode() accepts zero-padded numeric strings of any length', () => {
    // Padding is a string property — JS number literals can't carry leading
    // zeros (strict-mode SyntaxError on `0007`). Any string that's all-digits
    // and decodes to a value ≤ 339,999 is accepted, regardless of width.
    // Real Space-Track sources emit 5-char fields, but JSON consumers often
    // see unpadded or differently-padded forms via z.coerce.string().
    test.each(['7', '07', '007', '0007', '00007', '000007', '0000000007'])(
        'decode(%j) === 7',
        (s) => {
            expect(decode(s)).toBe(7);
        },
    );

    test.each(['25544', '025544', '00025544', '000000025544'])(
        'decode(%j) === 25544',
        (s) => {
            expect(decode(s)).toBe(25544);
        },
    );

    test('arbitrarily-padded max value still decodes (within bound)', () => {
        expect(decode('0000339999')).toBe(339999);
    });
});

describe('decode() output bound check — value must be in 0..339,999', () => {
    // The decoder accepts numeric strings of any length (for JSON-coerce
    // compatibility), but the resulting integer must still be a valid
    // NORAD ID. A 6+ digit numeric input that exceeds the Alpha-5 range
    // is meaningless — no real Space-Track source emits it, and
    // encode() would refuse to round-trip it.
    test('accepts max value via numeric string (339999)', () => {
        expect(decode('339999')).toBe(339999);
    });
    test('rejects 340000 via numeric string', () => {
        expect(() => decode('340000')).toThrow(/exceeds Alpha-5/);
    });
    test('rejects 999999 via numeric string', () => {
        expect(() => decode('999999')).toThrow(/exceeds Alpha-5/);
    });
    test('rejects very long numeric string (precision-loss region)', () => {
        expect(() => decode('100000000')).toThrow(/exceeds Alpha-5/);
    });
    test('accepts 6+ digit numeric below max (100000 via "100000")', () => {
        // Non-canonical input (the canonical form is "A0000") but accepted
        // for permissiveness — value is in range.
        expect(decode('100000')).toBe(100000);
    });
});

describe('decode() rejects floats and special numeric strings', () => {
    test('rejects decimal: "1.5"', () => {
        expect(() => decode('1.5')).toThrow(/Invalid NORAD/);
    });
    test('rejects scientific notation: "1e5"', () => {
        expect(() => decode('1e5')).toThrow(/Invalid NORAD/);
    });
    test('rejects "NaN" (N is valid letter but tail "aN" is non-numeric)', () => {
        expect(() => decode('NaN')).toThrow(/Invalid NORAD/);
    });
    test('rejects "Infinity" (I is reserved)', () => {
        expect(() => decode('Infinity')).toThrow(/Invalid NORAD/);
    });
    test('rejects "0x10" (hex)', () => {
        expect(() => decode('0x10')).toThrow(/Invalid NORAD/);
    });
    test('rejects "0b10" (binary)', () => {
        expect(() => decode('0b10')).toThrow(/Invalid NORAD/);
    });
    test('rejects "0o10" (octal)', () => {
        expect(() => decode('0o10')).toThrow(/Invalid NORAD/);
    });
});

describe('decode() rejects non-ASCII-space whitespace and mid-string whitespace', () => {
    // The leading/trailing-space tests cover ASCII U+0020. Other whitespace
    // characters and embedded whitespace also need to be rejected for the
    // regex-based digit/letter validation to hold.
    test.each([
        ['tab', '\t25544'],
        ['newline', '\n25544'],
        ['carriage return', '25544\r'],
        ['mid-string space', '255 44'],
        ['mid-string tab', '255\t44'],
    ])('decode rejects %s: %j', (_label, s) => {
        expect(() => decode(s)).toThrow(/Invalid NORAD/);
    });
});

describe('decode() rejects non-ASCII Unicode prefixes', () => {
    // The charCodeAt-based prefix check only accepts 0x30..0x39 (digits) or
    // 0x41..0x5A (A..Z). Everything else — Greek capital alpha (U+0391),
    // fullwidth digits (U+FF10..), emoji surrogate halves — falls through.
    test.each([
        ['Greek capital Α (U+0391)', 'Α0123'],
        ['Cyrillic A (U+0410)', 'А0123'],
        ['fullwidth digit (U+FF10)', '００００５'],
        ['emoji prefix', '🚀0123'],
        ['BOM (U+FEFF)', '﻿25544'],
    ])('decode rejects %s', (_label, s) => {
        expect(() => decode(s)).toThrow(/Invalid NORAD/);
    });
});

describe('decode() rejects exotic non-string types', () => {
    // The typeof check at the top of decode() is the gate; pinning these
    // ensures a future refactor can't accidentally relax it (e.g. by
    // accepting array-likes after toString coercion).
    test('rejects Symbol', () => {
        expect(() => decode(/** @type {any} */ (Symbol('x')))).toThrow(/Invalid NORAD/);
    });
    test('rejects empty array', () => {
        expect(() => decode(/** @type {any} */ ([]))).toThrow(/Invalid NORAD/);
    });
    test('rejects object', () => {
        expect(() => decode(/** @type {any} */ ({}))).toThrow(/Invalid NORAD/);
    });
    test('rejects function', () => {
        expect(() => decode(/** @type {any} */ (() => {}))).toThrow(/Invalid NORAD/);
    });
    test('rejects boolean true', () => {
        expect(() => decode(/** @type {any} */ (true))).toThrow(/Invalid NORAD/);
    });
    test('rejects boolean false', () => {
        expect(() => decode(/** @type {any} */ (false))).toThrow(/Invalid NORAD/);
    });
    test('rejects number', () => {
        expect(() => decode(/** @type {any} */ (25544))).toThrow(/Invalid NORAD/);
    });
});

describe('encode() rejects every non-integer numeric kind', () => {
    test('rejects BigInt', () => {
        expect(() => encode(/** @type {any} */ (BigInt(100123)))).toThrow(
            /Invalid NORAD/,
        );
    });
    test('rejects boolean true', () => {
        expect(() => encode(/** @type {any} */ (true))).toThrow(/Invalid NORAD/);
    });
    test('rejects boolean false', () => {
        expect(() => encode(/** @type {any} */ (false))).toThrow(/Invalid NORAD/);
    });
    test('rejects null', () => {
        expect(() => encode(/** @type {any} */ (null))).toThrow(/Invalid NORAD/);
    });
    test('rejects undefined', () => {
        expect(() => encode(/** @type {any} */ (undefined))).toThrow(/Invalid NORAD/);
    });
    test('rejects string-encoded number', () => {
        expect(() => encode(/** @type {any} */ ('100'))).toThrow(/Invalid NORAD/);
    });
    test('rejects 2^53 (above MAX_SAFE_INTEGER, in exceeds-range branch)', () => {
        expect(() => encode(2 ** 53)).toThrow(/exceeds Alpha-5/);
    });
    test('rejects -0.5 (negative non-integer)', () => {
        expect(() => encode(-0.5)).toThrow(/Invalid NORAD/);
    });
    test('accepts 0 (boundary — valid catalog ID)', () => {
        expect(encode(0)).toBe('00000');
    });
    test('accepts 339999 (max boundary)', () => {
        expect(encode(339999)).toBe('Z9999');
    });
});

describe('encode() rejects exotic non-number types', () => {
    test('rejects Symbol', () => {
        expect(() => encode(/** @type {any} */ (Symbol('x')))).toThrow(/Invalid NORAD/);
    });
    test('rejects empty array', () => {
        expect(() => encode(/** @type {any} */ ([]))).toThrow(/Invalid NORAD/);
    });
    test('rejects single-element array (no coercion shortcut)', () => {
        expect(() => encode(/** @type {any} */ ([100123]))).toThrow(/Invalid NORAD/);
    });
    test('rejects object', () => {
        expect(() => encode(/** @type {any} */ ({}))).toThrow(/Invalid NORAD/);
    });
    test('rejects function', () => {
        expect(() => encode(/** @type {any} */ (() => {}))).toThrow(/Invalid NORAD/);
    });
    test('rejects Date', () => {
        expect(() => encode(/** @type {any} */ (new Date()))).toThrow(/Invalid NORAD/);
    });
});

describe('encode() — numeric special cases', () => {
    test('accepts -0 (canonically equal to 0)', () => {
        // -0 === 0 in JS; Number.isInteger(-0) === true.
        expect(encode(-0)).toBe('00000');
    });
    test('2^53 + 1 rounds to 2^53 by IEEE-754; rejected by bound check', () => {
        // Above MAX_SAFE_INTEGER, integer arithmetic loses precision.
        // The bound check still catches the value (which rounds to 2^53).
        expect(() => encode(2 ** 53 + 1)).toThrow(/exceeds Alpha-5/);
    });
});
