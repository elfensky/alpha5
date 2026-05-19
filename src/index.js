/**
 * @module alpha5
 *
 * NORAD designator encode/decode for the US Space Force Alpha-5 scheme.
 *
 * Alpha-5 is a stopgap numbering schema introduced when the satellite
 * catalog approached the 100,000-object limit of the legacy 5-digit
 * NORAD field. It replaces the first character of the 5-char field
 * with a letter (A=10..Z=33, skipping the visually-ambiguous I and O),
 * extending the addressable range from 99,999 to 339,999.
 *
 * Objects below 100,000 are unchanged; they remain plain zero-padded
 * 5-digit strings. The codec round-trips losslessly across the whole
 * 0..339,999 range.
 *
 * Spec: https://www.space-track.org/documentation#tle-alpha5
 */

// ASCII code points for the Alpha-5 character set. Using charCodeAt with
// integer comparisons keeps the hot decode path allocation-free and avoids
// per-call regex or string scans. I and O are reserved by the spec to avoid
// visual confusion with the digits 1 and 0.
const CODE_0 = 48; // '0'
const CODE_9 = 57; // '9'
const CODE_A = 65; // 'A'
const CODE_I = 73; // 'I' — reserved
const CODE_O = 79; // 'O' — reserved
const CODE_Z = 90; // 'Z'

// Hard upper bound: Z9999 = 33 * 10000 + 9999. Spec is frozen; this never changes.
const MAX_NORAD = 339999;

/**
 * Decode a NORAD designator string into its integer value.
 *
 * Accepts both plain numeric strings (e.g. `"25544"`, `"00007"`) and
 * Alpha-5 designators (e.g. `"A0123"`, `"Z9999"`). Numeric inputs of
 * any length are accepted — `decode("7")` returns `7` — to accommodate
 * JSON sources that omit leading zeros. The decoded value is always
 * in the range 0..339,999; values outside that range are rejected.
 *
 * @param {string} s - The NORAD designator. Must be a non-empty string.
 * @returns {number} The decoded integer NORAD ID (0..339,999).
 * @throws {Error} If the input is not a valid NORAD designator, or
 *   if it decodes to a value outside the Alpha-5 range.
 *
 * @example
 *   decode("25544")  // 25544
 *   decode("00007")  // 7
 *   decode("A0123")  // 100123
 *   decode("Z9999")  // 339999
 */
export function decode(s) {
    // Reject non-strings and empty strings; String() in the message renders
    // null/undefined safely instead of throwing on .toString().
    if (typeof s !== 'string' || s.length === 0) {
        throw new Error(`Invalid NORAD designator: ${String(s)}`);
    }
    const c = s.charCodeAt(0);

    // Numeric branch: first char is a digit, parsed as a plain integer designator.
    if (c >= CODE_0 && c <= CODE_9) {
        // First-char test only validates position 0; ensure the whole string is digits.
        if (!/^\d+$/.test(s)) {
            throw new Error(`Invalid NORAD designator: ${s}`);
        }
        const n = parseInt(s, 10);
        // Reject inputs whose value exceeds the spec range (e.g. "999999").
        if (n > MAX_NORAD) {
            throw new Error(`NORAD ID ${n} exceeds Alpha-5 range (max ${MAX_NORAD})`);
        }
        return n;
    }

    // Letter branch: must be uppercase A-Z, excluding the two reserved letters.
    if (c < CODE_A || c > CODE_Z || c === CODE_I || c === CODE_O) {
        throw new Error(`Invalid NORAD designator: ${s}`);
    }
    // Positions 1-4 (the tail) must be exactly four ASCII digits.
    const tail = s.slice(1);
    if (!/^\d{4}$/.test(tail)) {
        throw new Error(`Invalid NORAD designator: ${s}`);
    }

    // step over the I/O gaps so letters map to contiguous values 10..33
    const skip = c > CODE_O ? 2 : c > CODE_I ? 1 : 0;
    // (c - CODE_A) is the raw alphabet offset; -skip compresses past I/O;
    // +10 shifts to the spec's letter-value baseline (A=10).
    const letterIdx = c - CODE_A - skip + 10;
    // Letter holds the ten-thousands digit; tail holds the lower four.
    return letterIdx * 10000 + parseInt(tail, 10);
}

/**
 * Encode an integer NORAD ID into its 5-character designator string.
 *
 * Values below 100,000 are zero-padded to 5 digits. Values 100,000
 * and above use the Alpha-5 letter prefix. Output is always exactly
 * 5 characters and never contains the reserved letters I or O.
 *
 * @param {number} n - Non-negative integer NORAD ID (max 339,999).
 * @returns {string} The 5-character NORAD designator.
 * @throws {Error} If `n` is not a finite non-negative integer, or
 *   exceeds the Alpha-5 maximum of 339,999.
 *
 * @example
 *   encode(7)        // "00007"
 *   encode(25544)    // "25544"
 *   encode(100123)   // "A0123"
 *   encode(339999)   // "Z9999"
 */
export function encode(n) {
    // Reject every non-integer numeric kind: BigInt, booleans, strings, null,
    // undefined, NaN, ±Infinity, and floats. Number.isFinite does not coerce.
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
        throw new Error(`Invalid NORAD ID: ${String(n)}`);
    }
    // Legacy range: plain zero-padded decimal, no letter prefix.
    if (n < 100000) {
        return String(n).padStart(5, '0');
    }
    // Upper bound for the letter-prefixed range; below 100k was returned above.
    if (n > MAX_NORAD) {
        throw new Error(`NORAD ID ${n} exceeds Alpha-5 range (max ${MAX_NORAD})`);
    }
    // Split n into letter-value (10..33) and the 4-digit tail (0..9999).
    const high = Math.floor(n / 10000);
    const low = n % 10000;
    // Zero-based offset; bumps below step over I (offset 8) and O (offset 14).
    let charIdx = high - 10;
    if (charIdx >= 8) charIdx++; // skip I
    if (charIdx >= 14) charIdx++; // skip O
    // Assemble: 1 letter + 4 zero-padded digits = exactly 5 chars, no I or O.
    return String.fromCharCode(CODE_A + charIdx) + String(low).padStart(4, '0');
}
