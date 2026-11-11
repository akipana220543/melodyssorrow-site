# Portfolio

Static portfolio site (no build step). Works on GitHub Pages: Settings → Pages → deploy from the `main` branch, root folder.

- Content lives in `data/site.json`; uploaded images go in `images/`.
- The admin editor publishes by committing to this repo through the GitHub API using a fine-grained token (Contents: read/write, this repo only, with an expiry). The token is stored AES-encrypted (passphrase-locked) in the editor’s browser.
