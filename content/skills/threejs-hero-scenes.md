---
name: Three.js Hero Scenes
description: Adds a lightweight, interactive three.js scene behind or beside the hero, with HTML text on top, a static fallback, and strict GPU and battery limits.
author: Kenji Watanabe
source: webgl-garden/hero-scenes
tags: [threejs, webgl, 3d, hero]
views: 9700
uses: 520
---

## Setup

- This skill allows three.js. Load it with an import map and a module script at the end of `<body>`:
  - `<script type="importmap">{ "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js", "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/" } }</script>`
  - `<script type="module">import * as THREE from "three"; ...</script>`
- Pin the version. Never import from an unversioned URL.

## Composition

- Keep the headline, subhead, and buttons in HTML, layered above the canvas with `relative z-10`. Never render text in WebGL.
- Place the canvas in an `absolute inset-0` container with `aria-hidden="true"` and `pointer-events-none` unless the scene is interactive.
- Choose one subject: a slowly rotating abstract form, a particle field, a gradient blob, or a floating product object. One idea, done well.
- Match the scene's colors to the page palette. Use the accent at most once.

## Renderer

- `new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })`
- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`
- Size from the container with a `ResizeObserver`, not `window.resize`. Update `camera.aspect` and call `camera.updateProjectionMatrix()`.
- For realistic materials, use `MeshPhysicalMaterial` with a `RoomEnvironment` from `three/addons/environments/RoomEnvironment.js` through `PMREMGenerator`. No external HDR files.

## Budgets

- Under 50 draw calls and under 100k triangles.
- Particle fields: at most 5,000 points with `THREE.Points`.
- No post-processing passes unless the brief asks for them.
- Total scene code under 150 lines.

## Motion and interaction

- Drive animation with `renderer.setAnimationLoop()` and a `THREE.Clock`. Keep motion slow: full rotations take 20s or more.
- Pointer parallax: ease the camera or object toward the pointer with lerp factor 0.05. Never snap.
- Pause rendering when the hero leaves the viewport (`IntersectionObserver`) and when `document.hidden` is true.

## Fallbacks

- Put a CSS gradient or SVG poster behind the canvas so the hero looks finished before WebGL loads or if it fails.
- If `prefers-reduced-motion: reduce` matches, render a single frame and stop the loop.
- On screens narrower than 768px, cut particle and segment counts in half.
- Wrap renderer creation in `try/catch`. On failure, remove the canvas and keep the poster.

## Don't

- Don't block the headline from rendering while the scene loads.
- Don't load 3D model files, textures, or fonts from external hosts.
- Don't use OrbitControls on a hero. Scroll must keep working.
