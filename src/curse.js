import jsfuck from 'jsfuck';

globalThis.passfuckEncode = (text) => [...text]
  .map((character) => jsfuck.JSFuck.encode(character, false))
  .join('+');
