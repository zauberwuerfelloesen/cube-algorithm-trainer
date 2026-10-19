'use strict';
const assert = require('node:assert/strict');
const Cube = require('./cube.js');
const { ALGORITHMS, clean, review, parseImport, mergeProgress, pick, DAY } = require('./app.js');
const solved = Cube.solved();
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
for (const move of 'RLUDFBMESrludfbxyz') {
  assert.deepEqual(Cube.apply(solved, Array(4).fill(move).join(' ')), solved, move + ' order four');
  assert.deepEqual(Cube.apply(solved, move + ' ' + Cube.inverse(move)), solved);
}
assert.deepEqual(Cube.apply(solved, 'r'), Cube.apply(solved, "R M'"));
assert.deepEqual(Cube.apply(solved, 'f'), Cube.apply(solved, 'F S'));
assert.throws(() => Cube.tokens('R <script>'));
assert.throws(() => Cube.tokens('R '.repeat(2001)));
assert.equal((Cube.svg(solved).match(/<rect /g) || []).length, 54);
assert.equal(new Set(ALGORITHMS.map(a => a.id)).size, 16);
for (const a of ALGORITHMS) {
  const setup = Cube.inverse(a.moves);
  const result = Cube.apply(solved, setup);
  assert.deepEqual(Cube.apply(result, a.moves), solved, a.name + ' inverse setup');
  for (const original of solved.filter(t => t.p[1] < 1)) {
    assert.ok(equal(original, result.find(t => t.id === original.id)), a.id + ' preserves F2L');
  }
  if (a.stage !== 'edges') assert.ok(result.filter(t => t.face === 'U' && t.p.filter(x => x === 0).length === 1).every(t => t.n[1] === 1), a.id + ' preserves cross');
  if (a.group === 'PLL') assert.ok(result.filter(t => t.face === 'U').every(t => t.n[1] === 1), a.id + ' preserves top orientation');
  if (a.stage === 'pedges') {
    for (const corner of solved.filter(t => t.p[1] === 1 && t.p.every(x => x !== 0))) {
      assert.ok(equal(corner, result.find(t => t.id === corner.id)), a.id + ' preserves corners');
    }
  }
}
function orientationKey(state, corners) {
  return state.filter(t => t.face === 'U' && (corners ? t.p.every(x => x !== 0) : t.p.filter(x => x === 0).length === 1))
    .map(t => [t.p.join(','), t.n.join(',')].join(':')).sort().join('|');
}
for (const [stage, expected] of [['edges', 8], ['corners', 27]]) {
  const seen = new Set([orientationKey(solved, stage === 'corners')]);
  for (const a of ALGORITHMS.filter(a => a.stage === stage)) {
    for (let u = 0; u < 4; u++) seen.add(orientationKey(Cube.apply(solved, Cube.inverse(a.moves) + ' ' + Array(u).fill('U').join(' ')), stage === 'corners'));
  }
  assert.equal(seen.size, expected, stage + ' complete orientation coverage');
}
const now = 1700000000000;
assert.equal(review(undefined, 0, now).due, now + 600000);
assert.equal(review(undefined, 1, now).due, now + DAY);
const first = review(undefined, 2, now), second = review(first, 2, now);
assert.equal(second.due, now + 3 * DAY);
assert.equal(review(second, 0, now).streak, 0);
assert.equal(review(second, 1, now).success, 2);
assert.throws(() => review(first, 9));
assert.deepEqual(clean(null), {});
assert.deepEqual(clean({ sune: { attempts: -1, success: 1, grade: 2 } }), {});
const legacy = parseImport(JSON.stringify({ version: 1, progress: { sune: { attempts: 2, success: 1, grade: 2 } } }));
assert.equal(legacy.sune.attempts, 2); assert.equal(legacy.sune.due, 0);
const incoming = parseImport(JSON.stringify({ version: 2, progress: { sune: first } }));
assert.deepEqual(mergeProgress({ sune: second }, incoming), { sune: second });
assert.equal(mergeProgress(legacy, incoming).sune.reviewed, now);
assert.throws(() => parseImport('{'));
assert.throws(() => parseImport('{"version":99,"progress":{}}'));
assert.throws(() => parseImport('{"version":2,"progress":{"sune":{"attempts":-1}}}'));
assert.throws(() => parseImport('x'.repeat(1024 * 1024 + 1)));
const pool = ALGORITHMS.slice(3, 5);
assert.equal(pick(pool, {}, null, true, now).id, 'sune');
assert.equal(pick(pool, { sune: first, antisune: first }, null, true, now), null);
assert.ok(pick(pool, { sune: first, antisune: first }, 'sune', false, now));
console.log('PASS: 16 algorithms; 8 edge and 27 corner orientations; cube moves, diagrams, F2L/PLL invariants, scheduling, migration, import, merge and review queue.');


function permutationKey(state, corners) {
  return state.filter(t => t.face === 'U' && (corners ? t.p.every(x => x !== 0) : t.p.filter(x => x === 0).length === 1))
    .sort((a, b) => a.id - b.id).map(t => t.p.join(',')).join('|');
}
const cornerCases = new Set(), edgeCases = new Set([permutationKey(solved, false)]);
for (const moves of ['', ...ALGORITHMS.filter(a => a.stage === 'pcorners').map(a => a.moves)]) {
  for (let before = 0; before < 4; before++) for (let after = 0; after < 4; after++) {
    cornerCases.add(permutationKey(Cube.apply(solved, [...Array(before).fill('U'), moves, ...Array(after).fill('U')].filter(Boolean).join(' ')), true));
  }
}
assert.equal(cornerCases.size, 24, 'all 24 corner permutations covered with AUF');
for (const a of ALGORITHMS.filter(a => a.stage === 'pedges')) for (let u = 0; u < 4; u++) {
  const turn = Array(u).fill('U').join(' ');
  edgeCases.add(permutationKey(Cube.apply(solved, [turn, a.moves, Cube.inverse(turn)].filter(Boolean).join(' ')), false));
}
assert.equal(edgeCases.size, 12, 'all 12 even edge permutations covered');
console.log('PASS: full two-look PLL permutation coverage (24 corners, 12 edges).');

