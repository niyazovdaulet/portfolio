# Portfolio (GitHub Pages)

Static portfolio for **Daulet Niyazov** — iOS apps, case studies, and links. Live site:

**https://niyazovdaulet.github.io/portfolio/**

## Run locally

Open `index.html` in a browser, or from this directory:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy (overwrite existing Pages site)

1. Ensure this repository is named **`portfolio`** under the **`niyazovdaulet`** GitHub account (URL must match `https://niyazovdaulet.github.io/portfolio/`).
2. Commit and push `main` (or your default branch):

   ```bash
   git add -A && git commit -m "Rebuild portfolio site" && git push
   ```

3. In GitHub: **Settings → Pages → Build and deployment → Source**: **Deploy from a branch**, branch **`main`**, folder **`/` (root)**.
4. Wait for the Pages build to finish; hard-refresh the site if you still see the old version.

## Update Friscora App Store link

When the App Store URL is available, add a dedicated **App Store** button in the **Friscora** spotlight section in `index.html` (and on [Friscora-Landing](https://niyazovdaulet.github.io/Friscora-Landing/)) next to the existing GitHub and landing links.

## Assets

- Project screenshots live under `assets/images/projects/`.
- **Friscora demo video:** `assets/media/friscora-demo.m4v` — see `assets/media/README.md` for transcoding and file-size notes (original `app-clip.mov` is too large for GitHub).
- **AnotherLife demo:** add `assets/media/anotherlife-demo.m4v` and swap the placeholder in `index.html` (comment in markup explains how).
- CV is served as `assets/cv.pdf` (replace this file when your résumé changes).
- **WeatherApp Clone** screenshots live in `assets/images/projects/weather/` (replace the PNGs there if you refresh captures).

## License

Site content © Daulet Niyazov. Project screenshots are from your own apps.
