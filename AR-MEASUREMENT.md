# Experimental AR shin measurement

**Retired from the website:** The measurement step now provides instructions for Apple's iPhone Measure app and manual entry. index.html no longer loads shin-ar.js. The experimental implementation below is retained only for reference, not offered as a working site feature.

The measurement step offers **Measure with AR · Beta**. It starts an immersive WebXR AR session, places two spatial points with the centre aiming target, calculates their Euclidean separation in metres and converts it to centimetres and inches. The user must confirm that the markers stayed on the anatomical endpoints before copying an estimate into the form. Existing manual input remains available.

## Device requirements

HTTPS, WebXR immersive-ar, WebGL, hit-test, a screen DOM overlay, and mesh or feature-point hit testing are required. A normal camera permission is insufficient. Availability is determined at runtime; there is no claim of universal iPhone, Safari, Android or embedded-browser support. A denied permission or unsupported feature produces an explanation and leaves manual entry usable. No polyfill pretends to provide spatial depth from a normal video image.

The session requests mesh hits first, then feature points if mesh hit testing is unavailable. There is deliberately no fallback to plane-only hits behind a leg. Devices exposing only plane hits may therefore be unable to use this feature even if they support other AR experiences.

## Important limitations

This does not identify knees or ankles, and it cannot establish that a hit belongs to the body. A feature point or mesh may belong to the background. World points do not follow a moving leg. Ask another person to operate the phone, keep the leg still, remove the shin pad, and target the centre of the kneecap and outer ankle. Confirm with a tape before selecting equipment, particularly at size boundaries.

The eight-frame steadiness gate (less than 0.8 cm sample displacement) only prevents obviously unstable selection. It is **not an accuracy guarantee**. The 15 to 65 cm input gate is a plausibility limit, not validation of the endpoints. Remeasure if a marker drifts or is on the wall or floor. Reference-space resets and interrupted session visibility clear the measurement. No camera frames or spatial measurements are uploaded or persistently stored.

## Validation

Syntax and existing shin workflow/camera regression checks pass. Mock XR tests cover metric conversion, required features, mesh-to-point fallback, stable selection, missing hits, confirmation, result transfer callback, out-of-range distances, reset, interrupted tracking, rejected permission and resource cleanup. Real device support, overlay alignment and measurement accuracy still require physical testing; this release is Beta.

## Primary API references

* https://www.w3.org/TR/webxr-hit-test-1/
* https://www.w3.org/TR/webxr-dom-overlays-1/

These APIs provide spatial intersections and interactive overlays. They do not provide anatomical endpoint detection or guaranteed measurement precision.
