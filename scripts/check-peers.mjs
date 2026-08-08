#!/usr/bin/env node
/**
 * Guards the OpenHPS cross-module dependency policy. Dependency-free by design:
 * this runs as part of `npm run lint`, before any optional tooling is guaranteed
 * to be present.
 *
 * Rules enforced for every `@openhps/*` entry in peerDependencies:
 *   P1  the range must carry an upper bound  (">=1.0.16 <2", not ">=1.0.16")
 *   P2  a matching devDependency must exist, so CI tests what consumers get
 *   P3  the devDependency floor must satisfy the peer floor
 *
 * Historically every range was an unbounded ">=0.3.2"-style floor, which let a
 * future major resolve happily and then fail at runtime. A policy without a
 * check is a comment, so this is wired into lint.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pkgPath = resolve(process.argv[2] ?? 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

const peers = pkg.peerDependencies ?? {};
const devs = pkg.devDependencies ?? {};
const errors = [];
const warnings = [];

/** Parse a bare "1.2.3" / "1.2" / "1" triple. Returns null when unparseable. */
function triple(version) {
    const m = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?/.exec(version.trim());
    if (!m) return null;
    return [Number(m[1]), Number(m[2] ?? 0), Number(m[3] ?? 0)];
}

/** Lowest version a range admits, ignoring prerelease tags. */
function floorOf(range) {
    const m = /(?:>=|\^|~|=)?\s*(\d+(?:\.\d+){0,2})/.exec(range);
    return m ? triple(m[1]) : null;
}

function hasUpperBound(range) {
    // An explicit "<x" / "<=x", or the implicit bound that ^ and ~ carry.
    return /<\s*\d/.test(range) || /^\s*[\^~]/.test(range);
}

function cmp(a, b) {
    for (let i = 0; i < 3; i++) {
        if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
    }
    return 0;
}

for (const [name, range] of Object.entries(peers)) {
    if (!name.startsWith('@openhps/')) continue;

    if (!hasUpperBound(range)) {
        errors.push(
            `${name}: peer range "${range}" has no upper bound. ` +
                `Use ">=<floor> <<next-major>" (e.g. ">=1.0.16 <2") so an incompatible ` +
                `major fails at install instead of at runtime.`,
        );
    }

    const devRange = devs[name];
    if (!devRange) {
        errors.push(
            `${name}: declared as a peerDependency but absent from devDependencies. ` +
                `CI would never build against it, so the peer claim is untested.`,
        );
        continue;
    }

    const peerFloor = floorOf(range);
    const devFloor = floorOf(devRange);
    if (!peerFloor || !devFloor) {
        warnings.push(`${name}: could not parse peer "${range}" / dev "${devRange}" — skipped floor check.`);
        continue;
    }
    if (cmp(devFloor, peerFloor) < 0) {
        errors.push(
            `${name}: devDependency "${devRange}" resolves below the peer floor "${range}". ` +
                `CI tests an older version than consumers are promised.`,
        );
    }
}

// reflect-metadata is a peer everywhere decorators are used; an unbounded range
// there has bitten the fleet the same way.
const rm = peers['reflect-metadata'];
if (rm && !hasUpperBound(rm)) {
    errors.push(`reflect-metadata: peer range "${rm}" has no upper bound. Use ">=0.2.2 <1".`);
}

for (const w of warnings) console.warn(`warning  ${w}`);

if (errors.length > 0) {
    console.error(`\ncheck-peers: ${errors.length} problem(s) in ${pkg.name}\n`);
    for (const e of errors) console.error(`  error  ${e}`);
    console.error('');
    process.exit(1);
}

console.log(`check-peers: ${pkg.name} ok`);
