/**
 * Decode a NORAD designator string into its integer value.
 *
 * Accepts plain numeric strings (e.g. "25544", "00007") and Alpha-5
 * designators (e.g. "A0123", "Z9999").
 *
 * @throws {Error} If the input is not a valid NORAD designator.
 */
export declare function decode(s: string): number;

/**
 * Encode an integer NORAD ID into its 5-character designator string.
 *
 * Values below 100,000 are zero-padded to 5 digits. Values 100,000–339,999
 * use the Alpha-5 letter prefix. Output is always exactly 5 characters
 * and never contains the reserved letters I or O.
 *
 * @throws {Error} If `n` is not a non-negative integer, or exceeds 339,999.
 */
export declare function encode(n: number): string;
