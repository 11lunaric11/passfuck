import { build } from 'esbuild';
import jsfuck from 'jsfuck';
import { writeFile } from 'node:fs/promises';

for (const name of ['app', 'curse']) {
  const result = await build({
    entryPoints: [`src/${name}.js`],
    bundle: true,
    minify: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    write: false,
  });
  // jsfuck 0.4.0 incorrectly turns the complete word "undefined" into an empty
  // string. Unicode escapes keep the JavaScript equivalent while avoiding that
  // encoder shortcut in bundled source.
  const source = result.outputFiles[0].text.replaceAll('undefined', '\\u0075ndefined');
  const encoded = jsfuck.JSFuck.encode(source, true);
  if (!/^[\[\]()!+]+$/.test(encoded)) {
    throw new Error(`${name}.js contains non-JSFuck characters.`);
  }
  await writeFile(`${name}.js`, encoded);
  console.log(`Built ${name}.js: ${encoded.length.toLocaleString()} characters, six unique symbols.`);
}
