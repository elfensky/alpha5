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

const CODE_0 = 48; // '0'
const CODE_9 = 57; // '9'
const CODE_A = 65;
const CODE_I = 73;
const CODE_O = 79;
const CODE_Z = 90;

const MAX_NORAD = 339999;

/**
 * Decode a NORAD designator string into its integer value.
 *
 * Accepts both plain numeric strings (e.g. `"25544"`, `"00007"`) and
 * Alpha-5 designators (e.g. `"A0123"`, `"Z9999"`). Numeric inputs of
 * any length are accepted — `decodeNoradId("7")` returns `7` — to
 * accommodate JSON sources that omit leading zeros.
 *
 * @param {string} s - The NORAD designator. Must be a non-empty string.
 * @returns {number} The decoded integer NORAD ID (0..339,999).
 * @throws {Error} If the input is not a valid NORAD designator.
 *
 * @example
 *   decodeNoradId("25544")  // 25544
 *   decodeNoradId("00007")  // 7
 *   decodeNoradId("A0123")  // 100123
 *   decodeNoradId("Z9999")  // 339999
 */
export function decodeNoradId(s) {
    if (typeof s !== 'string' || s.length === 0) {
        throw new Error(`Invalid NORAD designator: ${String(s)}`);
    }
    const c = s.charCodeAt(0);

    if (c >= CODE_0 && c <= CODE_9) {
        if (!/^\d+$/.test(s)) {
            throw new Error(`Invalid NORAD designator: ${s}`);
        }
        return parseInt(s, 10);
    }

    if (c < CODE_A || c > CODE_Z || c === CODE_I || c === CODE_O) {
        throw new Error(`Invalid NORAD designator: ${s}`);
    }
    const tail = s.slice(1);
    if (!/^\d{4}$/.test(tail)) {
        throw new Error(`Invalid NORAD designator: ${s}`);
    }

    const skip = c > CODE_O ? 2 : c > CODE_I ? 1 : 0;
    const letterIdx = c - CODE_A - skip + 10;
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
 *   formatNoradId(7)        // "00007"
 *   formatNoradId(25544)    // "25544"
 *   formatNoradId(100123)   // "A0123"
 *   formatNoradId(339999)   // "Z9999"
 */
export function formatNoradId(n) {
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
        throw new Error(`Invalid NORAD ID: ${String(n)}`);
    }
    if (n < 100000) {
        return String(n).padStart(5, '0');
    }
    if (n > MAX_NORAD) {
        throw new Error(`NORAD ID ${n} exceeds Alpha-5 range (max ${MAX_NORAD})`);
    }
    const high = Math.floor(n / 10000);
    const low = n % 10000;
    let charIdx = high - 10;
    if (charIdx >= 8) charIdx++; // skip I
    if (charIdx >= 14) charIdx++; // skip O
    return String.fromCharCode(CODE_A + charIdx) + String(low).padStart(4, '0');
}
