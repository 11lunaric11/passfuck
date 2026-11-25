const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/';
const LIMIT = 0x100000000;

const lengthSlider = document.querySelector('#length-slider');
const lengthInput = document.querySelector('#length-input');
const passwordOutput = document.querySelector('#password-output');
const cursedOutput = document.querySelector('#cursed-output');
const cursedPanel = document.querySelector('#cursed-panel');
const cursedCount = document.querySelector('#cursed-count');
const status = document.querySelector('#status');
const generateButton = document.querySelector('#generate');
const curseButton = document.querySelector('#curse');
const copyPasswordButton = document.querySelector('#copy-password');
const copyCursedButton = document.querySelector('#copy-cursed');
const groupInputs = [...document.querySelectorAll('input[name="group"]')];

let password = '';
let cursed = '';
let curseLoader;
const randomWord = new Uint32Array(1);

function randomIndex(size) {
  const ceiling = LIMIT - (LIMIT % size);
  do {
    crypto.getRandomValues(randomWord);
  } while (randomWord[0] >= ceiling);
  return randomWord[0] % size;
}

function selectedGroups() {
  return groupInputs.filter((input) => input.checked).map((input) => ({
    upper: UPPER,
    lower: LOWER,
    numbers: NUMBERS,
    symbols: SYMBOLS,
  })[input.value]);
}

function setStatus(message, error = false) {
  status.textContent = message;
  status.dataset.error = String(error);
}

function clearCursed() {
  cursed = '';
  cursedOutput.textContent = '';
  cursedCount.textContent = '0 characters';
  cursedPanel.hidden = true;
}

function loadCurseEncoder() {
  if (!curseLoader) {
    curseLoader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'curse.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }
  return curseLoader;
}

function makePassword() {
  const groups = selectedGroups();
  if (!groups.length) {
    password = '';
    passwordOutput.textContent = '';
    clearCursed();
    setStatus('Select at least one character set.', true);
    return;
  }
  if (!globalThis.crypto?.getRandomValues) {
    setStatus('Secure randomness is unavailable in this browser.', true);
    return;
  }

  const length = Number(lengthInput.value);
  if (!Number.isInteger(length) || length < 8 || length > 128) {
    setStatus('Choose a length from 8 to 128.', true);
    return;
  }

  const pool = groups.join('');
  const chars = groups.map((group) => group[randomIndex(group.length)]);
  while (chars.length < length) chars.push(pool[randomIndex(pool.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  password = chars.join('');
  passwordOutput.textContent = password;
  clearCursed();
  setStatus('Generated locally with crypto.getRandomValues().');
}

async function copy(value, label) {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    setStatus(`${label} copied to clipboard.`);
  } catch {
    setStatus('Clipboard access failed. Select and copy the text manually.', true);
  }
}

lengthSlider.addEventListener('input', () => {
  lengthInput.value = lengthSlider.value;
  makePassword();
});
lengthInput.addEventListener('change', () => {
  const value = Math.max(8, Math.min(128, Number(lengthInput.value) || 8));
  lengthInput.value = String(value);
  lengthSlider.value = String(value);
  makePassword();
});
groupInputs.forEach((input) => input.addEventListener('change', makePassword));
generateButton.addEventListener('click', makePassword);
copyPasswordButton.addEventListener('click', () => copy(password, 'Password'));
copyCursedButton.addEventListener('click', () => copy(cursed, 'JSFuck expression'));
curseButton.addEventListener('click', async () => {
  if (!password) return;
  curseButton.disabled = true;
  setStatus('Preparing the curse…');
  try {
    await loadCurseEncoder();
    cursed = globalThis.passfuckEncode(password);
    cursedOutput.textContent = cursed;
    cursedCount.textContent = `${cursed.length.toLocaleString()} characters`;
    cursedPanel.hidden = false;
    setStatus('This expression evaluates to your password. Keep it private.');
  } catch {
    curseLoader = null;
    setStatus('Could not load the JSFuck encoder. Try again.', true);
  } finally {
    curseButton.disabled = false;
  }
});

makePassword();
