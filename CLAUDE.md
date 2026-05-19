# CLAUDE.md

NORAD Alpha-5 designator codec. Two functions, frozen spec, write-once.

## What this is

A ~70-line ESM library that encodes and decodes NORAD satellite catalog IDs between integers and the 5-character Space-Track format (`A0123` ↔ `100123`). Published as `alpha5` on npm.

Originally extracted from [descent-app](https://github.com/drunikbe/descent-app)'s Space-Track ingestion pipeline. That's still the canonical first consumer — most real-world testing comes from there.

## Source of truth

The Alpha-5 scheme is defined by the US Space Force and documented at:

→ <https://www.space-track.org/documentation#tle-alpha5>

**This URL is the spec.** When in doubt about behavior, defer to that page. Every test in `test/index.test.js` is grounded in something there. If you add a test case, cite which part of the spec it covers — comments like `// per Space-Track docs` are the convention.

## Resist the urge to add things

This library is intentionally minimal. **Before adding anything, ask whether it's actually warranted, or whether you're padding.** The spec is frozen by USSF; once the tests pass, there is no maintenance work pending. New surface area is new failure surface.

Specifically, **do not add**:

- **A TypeScript build step.** Source is plain `.js` with a hand-written `.d.ts`. Build tools (tsup/tsdown/esbuild/rollup) rev every six months — that's the biggest maintenance cost of small libs.
- **ESLint.** Prettier alone is enough for ~70 LOC of pure functions. ESLint plugin ecosystems drift constantly.
- **Runtime dependencies.** Zero is correct. The codec is letter math.
- **CommonJS dual-build.** Pure ESM (`"type": "module"`) is right for 2026+; CJS would double every config surface.
- **Error subclasses (`InvalidDesignatorError`, etc).** Plain `Error` with a clear message is fine. Subclasses are a public API commitment we don't need.
- **New exports.** The API is `decode` and `encode`. If a use case seems to want a third function, it's almost certainly application logic that belongs in the caller (see `tleBatchNumber` in descent-app — it's S3-partition logic, NOT part of this lib).

## Invariants that must not break

The codec contract — these are tested but worth stating explicitly so you don't undermine them while "improving" something:

1. `decode(encode(n)) === n` for every integer in `0..339_999`.
2. `encode(n).length === 5` for every valid `n`.
3. `encode(n)` never contains the letters `I` or `O`.
4. `decode` accepts unpadded numeric strings (`"7"` → `7`), not just zero-padded ones — JSON sources from Space-Track sometimes omit padding.
5. `decode` rejects whitespace, sign prefixes, lowercase letters, and letters inside the numeric tail.
6. `decode` rejects any input that would produce a value outside `0..339_999` — including arbitrarily long numeric strings like `"999999"` or `"100000000"`. The input format is permissive, but the value range is not.
7. `encode` rejects every non-integer numeric kind: `BigInt`, booleans, strings, `null`, `undefined`, `NaN`, `±Infinity`, and floats. Only plain finite integers pass.

If you change the codec, the round-trip property test (`every 137th value in 0..339999`) is the most important guard — `137` is coprime with `10000` (the per-letter stride), so it can't miss a single letter row.

## Tooling

- **Node 20+** (engines field in `package.json`).
- **Vitest** for tests. The one dev dep that earns its keep.
- **Prettier** for formatting. That's it.
- **GitHub Actions** runs lint + tests on Node 20, 22, 24 (`.github/workflows/ci.yml`).

## Verification

Run all three before pushing or publishing:

```bash
npm run lint     # prettier --check
npm test         # vitest run — 179 tests
npm audit        # should be 0 vulnerabilities
```

If any fail, report the actual output. Do not suppress failures.

## Publishing

```bash
git push origin main
npm login                 # elfensky account
npm whoami                # verify
npm publish --dry-run     # preview tarball contents
npm publish               # ship — no --access flag (unscoped package)
```

After publish, bump `version` in `package.json` and add a `CHANGELOG.md` entry **in the same commit** for the next release. Follow [keep-a-changelog](https://keepachangelog.com/en/1.1.0/) format. Patch for bug fixes, minor for additive API (unlikely), major for breaking changes (also unlikely — spec is frozen).

## Identity

Repo is on the `elfensky` personal GitHub account. Same git identity (`andrei@lav.ren`) as descent-app. If `gh auth status` or `git config user.email` shows anything else, stop and switch before committing.

## Branch model

`main` only. No feature branches, no `develop`. For a ~70-LOC library with one author and a frozen spec, Git Flow is overhead. Small fixes commit directly to `main`; large changes (none anticipated) get a short-lived branch.

## File guidelines

- **Source**: keep `src/index.js` under 100 LOC. If it's growing, you're probably solving the wrong problem.
- **Tests**: it's fine for `test/index.test.js` to be 5–10× the size of source. Spec-anchored test coverage is the product.
- **README**: the public contract. Update it whenever `decode` or `encode` changes semantics, never to document internals.
