# Project Notes

- [x] Requirements: truck warehouse entry, randomized OEM reveal, country routing using the supplied ten OEM mappings.
- [x] Scaffold: standalone HTML, CSS, and JavaScript because Node.js is unavailable in the environment.
- [x] Customize: original SVG yard and truck artwork, ten-truck rounds, scores, feedback, replay, optional sound, and fullscreen.
- [x] Extensions: none required.
- [x] Compile: no build step; use browser execution and editor diagnostics for validation.
- [x] Task: not required for a standalone HTML game.
- [x] Launch: open index.html directly in a browser.
- [x] Documentation: README.md includes launch instructions and all OEM-country mappings.

Keep country mappings aligned with the supplied event list. Preserve routing guards during warehouse animations and cancellation of old animations when restarting. Do not introduce a server or build dependency unless requested.