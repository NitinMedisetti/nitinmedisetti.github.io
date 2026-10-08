# nitinmedisetti.github.io

Personal portfolio of Nitin Medisetti, served by GitHub Pages at https://nitinmedisetti.github.io.

Plain HTML, CSS and JavaScript with no build step: edit `index.html` and push to `main`.

## Adding photos

Each image slot shows a placeholder until a file exists at its path. Save the photo with exactly this name and it appears on its own, with no code changes:

| Slot | File |
|---|---|
| Profile portrait (4:5) | `assets/img/profile.jpg` |
| Go2 campus navigation | `assets/img/projects/go2-navigation.jpg` |
| VR hazard perception | `assets/img/projects/vr-hazard-perception.jpg` |
| Quadrotor rotor failure | `assets/img/projects/quadrotor-rotor-failure.jpg` |
| STM32 firmware | `assets/img/projects/stm32-firmware.jpg` |
| Beveloid gear | `assets/img/projects/beveloid-gear.jpg` |

Project photos look best around 1600×1000 (16:10). Keep each under ~500 KB (squoosh.app compresses well). File names are case-sensitive on GitHub Pages.

## Layout

- `index.html`: all content
- `assets/css/style.css`: styles (colours and fonts are at the top)
- `assets/js/main.js`: scroll reveals, menu, image loading
