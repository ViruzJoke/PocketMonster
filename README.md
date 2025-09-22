PocketMon — 3D demo

This is a small demo that shows a procedurally generated 3D "monster" using Three.js. It includes simple UI (Feed, Play, Clean) that triggers animations and changes basic stats.

How to run
- Open `index.html` in a modern browser (Chrome, Edge, Firefox). For full feature support and to avoid CORS issues, serve the folder with a static server.

Quick server (recommended):
- If you have Python 3 installed:
```pwsh
# from repository root (c:\Webgame\PocketMon)
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Files
- `index.html` — main page
- `styles.css` — UI styling
- `app.js` — Three.js scene and game logic

Next steps
- Replace procedural geometry with glTF/GLB character models and animations (Three.js GLTFLoader)
- Add persistent state (localStorage or backend)
- Add more actions, sound, particle effects, and a simple backend for multiple monsters

Notes
- The demo loads Three.js from CDN. For production, pin a version and bundle.
- If the scene appears dark on some systems, tweak lighting in `app.js`.
