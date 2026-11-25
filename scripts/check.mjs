import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const app = await readFile('app.js', 'utf8');
const curse = await readFile('curse.js', 'utf8');
for (const [name, source] of [['app.js', app], ['curse.js', curse]]) {
  assert.match(source, /^[\[\]()!+]+$/, `${name} must contain only the six JSFuck characters`);
}

function element(value = '') {
  return {
    value,
    textContent: '',
    dataset: {},
    hidden: true,
    listeners: {},
    addEventListener(type, callback) { this.listeners[type] = callback; },
    async fire(type) { return this.listeners[type](); },
  };
}

const ids = Object.fromEntries([
  'length-slider', 'length-input', 'password-output', 'cursed-output',
  'cursed-panel', 'cursed-count', 'status', 'generate', 'curse',
  'copy-password', 'copy-cursed',
].map((id) => [id, element()]));
ids['length-slider'].value = '20';
ids['length-input'].value = '20';
const groups = ['upper', 'lower', 'numbers', 'symbols'].map((value) => ({ ...element(), value, checked: true }));
let draws = 0;
let state = 123456789;
let copied = '';
let context;
const document = {
  querySelector: (selector) => ids[selector.slice(1)],
  querySelectorAll: () => groups,
  createElement: () => element(),
  head: {
    append(script) {
      assert.equal(script.src, 'curse.js');
      vm.runInContext(curse, context, { timeout: 10000 });
      script.onload();
    },
  },
};
context = vm.createContext({
  document,
  navigator: { clipboard: { async writeText(value) { copied = value; } } },
  crypto: {
    getRandomValues(array) {
      draws++;
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      array[0] = state;
      return array;
    },
  },
  Uint32Array,
});

vm.runInContext(app, context, { timeout: 10000 });
const initial = ids['password-output'].textContent;
assert.equal(initial.length, 20);
assert.match(initial, /[A-Z]/);
assert.match(initial, /[a-z]/);
assert.match(initial, /[0-9]/);
assert.match(initial, /[!@#$%^&*()\-_=+\[\]{};:,.?/]/);
assert.ok(draws >= 20, 'password generation must draw secure random values');

ids['length-slider'].value = '64';
await ids['length-slider'].fire('input');
assert.equal(ids['password-output'].textContent.length, 64);
assert.equal(ids['length-input'].value, '64');

for (const group of groups) group.checked = group.value === 'numbers';
await groups[0].fire('change');
assert.match(ids['password-output'].textContent, /^\d{64}$/);

await ids['copy-password'].fire('click');
assert.equal(copied, ids['password-output'].textContent);

await ids.curse.fire('click');
assert.equal(ids['cursed-panel'].hidden, false, ids.status.textContent);
assert.match(ids['cursed-output'].textContent, /^[\[\]()!+]+$/);
assert.equal(vm.runInContext(ids['cursed-output'].textContent, context, { timeout: 10000 }), ids['password-output'].textContent);
await ids['copy-cursed'].fire('click');
assert.equal(copied, ids['cursed-output'].textContent);

const edgeCase = 'undefinedJO[]!+~';
const encodedEdgeCase = context.passfuckEncode(edgeCase);
assert.match(encodedEdgeCase, /^[\[\]()!+]+$/);
assert.equal(vm.runInContext(encodedEdgeCase, context, { timeout: 10000 }), edgeCase);

const entireAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{};:,.?/';
const encodedAlphabet = context.passfuckEncode(entireAlphabet);
assert.match(encodedAlphabet, /^[\[\]()!+]+$/);
assert.equal(vm.runInContext(encodedAlphabet, context, { timeout: 10000 }), entireAlphabet);

groups[2].checked = false;
await groups[2].fire('change');
assert.equal(ids['password-output'].textContent, '');
assert.equal(ids.status.dataset.error, 'true');

console.log('Checks passed: six-character bundles, secure draws, options, copy, and cursed round trip.');
