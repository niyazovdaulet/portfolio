# Portfolio media

- **`friscora-demo.m4v`** — 720p H.264 screen recording of Friscora (transcoded with macOS `avconvert` from the original `app-clip.mov` so the file stays under GitHub’s 100 MB limit and loads reasonably on Pages).

## AnotherLife demo (later)

1. Export or screen-record your AnotherLife build.
2. Transcode to a web-friendly file (under ~25 MB if possible), e.g.  
   `avconvert --source your-recording.mov --preset PresetAppleM4V720pHD --output anotherlife-demo.m4v --replace`
3. Save as **`anotherlife-demo.m4v`** in this folder.
4. In `index.html`, inside `.anotherlife-demo-wrap`, replace the `.anotherlife-demo-placeholder` block with a `<video>` (see the HTML comment next to that block).

GitHub does not accept single files larger than **100 MB**.
