# PassFuck

> Built with JavaScript. All six characters of it.

PassFuck generates passwords with `crypto.getRandomValues()`. Every JavaScript file in this repository is [JSFuck](https://jsfuck.com/): JavaScript written using only `[]()!+`.

The generator supports lengths of 8–128 characters and uppercase, lowercase, number, and symbol sets. It includes at least one character from each selected set, then shuffles using unbiased random indexes. No password is sent to a server or saved by the app.

The **Generate cursed password** button turns the current password into a JSFuck expression. Evaluating that expression returns the password; the longer form is not encryption and must be kept private.

## Run locally

Serve the repository over `localhost` or HTTPS (clipboard access needs a secure context):

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`.

There is no readable JavaScript source or build tool in this repository. `app.js` runs the generator; `curse.js` loads when you request the optional JSFuck expression.
