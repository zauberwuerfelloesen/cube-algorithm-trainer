'use strict';
const assert=require('node:assert/strict');
const {ALGORITHMS,inverse,clean}=require('./app.js');
// A sticker model independent of the trainer verifies last-layer algorithms.
function cube(){const s=[];for(let axis=0;axis<3;axis++)for(const sign of [-1,1])for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const p=[0,0,0],n=[0,0,0];p[axis]=sign;n[axis]=sign;p[(axis+1)%3]=a;p[(axis+2)%3]=b;s.push({p,n,id:s.length})}return s}
function rot(v,axis,dir){const r=[...v],a=(axis+1)%3,b=(axis+2)%3;r[a]=-dir*v[b];r[b]=dir*v[a];return r.map(x=>x===0?0:x)}
const faces={R:[0,1],L:[0,-1],U:[1,1],D:[1,-1],F:[2,1],B:[2,-1]};
function apply(s,sequence){for(const m of sequence.split(' ')){assert.match(m,/^[RLUDFB](2|')?$/);const [axis,side]=faces[m[0]],times=m.endsWith('2')?2:m.endsWith("'")?3:1;for(let i=0;i<times;i++)for(const t of s)if(t.p[axis]===side){t.p=rot(t.p,axis,-side);t.n=rot(t.n,axis,-side)}}return s}
const solved=cube();
for(const face of Object.keys(faces))assert.deepEqual(apply(cube(),Array(4).fill(face).join(' ')),solved);
for(const a of ALGORITHMS){
 assert.equal(inverse(inverse(a.moves)),a.moves);
 assert.deepEqual(apply(cube(),inverse(a.moves)+' '+a.moves),solved,a.name+' setup must solve');
 const result=apply(cube(),a.moves);
 for(const sticker of solved.filter(t=>t.p[1]<1))assert.deepEqual(result[sticker.id],sticker,a.name+' must preserve first two layers');
 if(a.group==='PLL')for(const t of result.filter(t=>t.n[1]===1))assert.equal(solved[t.id].n[1],1,a.name+' must preserve top orientation');
}
assert.deepEqual(clean(null),{});
assert.deepEqual(clean({sune:{attempts:-1,success:2,grade:2}}),{});
assert.deepEqual(clean({sune:{attempts:2,success:1,grade:2},unknown:{attempts:1,success:1,grade:2}}),{sune:{attempts:2,success:1,grade:2}});
console.log('PASS: five algorithms, inverse setups, F2L preservation, PLL orientation and saved-progress validation.');

