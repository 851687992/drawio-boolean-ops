# Draw.io Boolean Operations Chrome Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Package the Boolean Operations plugin as an unpacked Chrome extension that injects locally bundled scripts into `app.diagrams.net` without Tampermonkey.

**Architecture:** A Manifest V3 content script runs in Chrome's `MAIN` world at `document_start`. The Paper.js Core build loads first, followed by the existing Draw.io plugin, so no remote runtime script request or `eval` is required.

**Tech Stack:** Chrome Manifest V3, JavaScript, Paper.js 0.12.18, Node.js smoke tests, PowerShell ZIP packaging.

---

### Task 1: Define and validate the extension manifest

**Files:**
- Create: `chrome-extension/manifest.json`
- Create: `tests/chrome-extension-smoke.js`

- [x] Write a smoke test that requires Manifest V3, the `app.diagrams.net` match, `document_start`, `MAIN`, and the script order `paper-core.min.js` then `boolean-ops.js`.
- [x] Run `node tests/chrome-extension-smoke.js` and verify it fails because the manifest does not exist.
- [x] Add the minimal manifest and rerun the test.

### Task 2: Bundle runtime scripts

**Files:**
- Create: `chrome-extension/paper-core.min.js`
- Create: `chrome-extension/boolean-ops.js`

- [x] Download the Paper.js Core 0.12.18 build into the extension directory.
- [x] Copy the standalone plugin into the extension directory.
- [x] Extend the smoke test to check Paper.js identity, plugin syntax, and plugin registration against mocked Draw.io globals.
- [x] Run the smoke test and verify all assertions pass.

### Task 3: Document, package, and verify

**Files:**
- Create: `chrome-extension/README.md`
- Create: `drawio-boolean-ops-chrome-extension.zip`
- Modify: `README.md`

- [x] Document Chrome's `Load unpacked` workflow and the expected `Arrange > Boolean Operations` menu.
- [x] Create a ZIP whose root contains `manifest.json` and both scripts.
- [x] Inspect the ZIP entries, run `node --check`, and rerun the smoke test.
- [x] Commit the extension package and documentation.
