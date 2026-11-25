# PassFuck

> Built with JavaScript. All six characters of it.

PassFuck generates passwords with `crypto.getRandomValues()` and then ships its entire browser script as [JSFuck](https://jsfuck.com/): JavaScript written using only `[]()!+`. The source is deliberately readable in `src/app.js`; `app.js` is the generated six-character artifact.

The generator supports lengths of 8–128 characters and uppercase, lowercase, number, and symbol sets. It includes at least one character from each selected set, then shuffles using unbiased random indexes. No password is sent to a server or saved by the app.

The **Generate cursed password** button turns the current password into a JSFuck expression. Evaluating that expression returns the password; the longer form is not encryption and must be kept private.

## Run locally

Serve the repository over `localhost` or HTTPS (clipboard access needs a secure context):

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Build

```sh
npm ci
npm run build
npm run check
```

`scripts/build.mjs` bundles the readable source and passes it through [aemkei/jsfuck](https://github.com/aemkei/jsfuck). The output is committed so static hosts can serve the repository directly.
