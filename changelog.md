## Changelog

### [Unreleased]

- Fixed duplicate form field IDs (`video-quality`, `audio-quality`) in the frontend HTML (`index.html` template) and updated JavaScript (`static/js/script.js`) to use unique IDs (`video-quality-select`, `audio-quality-select`). This resolved the `TypeError: Cannot set properties of null` and allowed the correct selected quality `itag` to be sent to the backend for progressive streams. 