# drawio-boolean-ops

Experimental Boolean path operations plugin for the diagrams.net/draw.io web editor.

## Operations

- Union
- Subtract
- Intersect
- Exclude

The plugin adds `Arrange > Boolean Operations` to the web editor.

## Install as a Chrome extension (recommended)

This method uses locally bundled scripts and does not require Tampermonkey.

1. Download and extract `drawio-boolean-ops-chrome-extension.zip`, or use the
   `chrome-extension` directory from this repository.
2. Open `chrome://extensions/` in Chrome.
3. Enable `Developer mode`.
4. Click `Load unpacked` and select the extracted extension directory.
5. Close all open `app.diagrams.net` tabs and reopen the editor.
6. Look for `Arrange > Boolean Operations`.

The extension is restricted to `https://app.diagrams.net/*`. Paper.js Core and
the plugin are bundled locally, so no executable code is downloaded at runtime.

## Install in the official web editor

The hosted editor blocks arbitrary third-party plugin URLs by default. The
Tampermonkey userscript is retained as an alternative installation method:

1. Install [Tampermonkey](https://www.tampermonkey.net/) in the browser.
2. Open the [userscript installer](https://851687992.github.io/drawio-boolean-ops/boolean-ops.user.js).
3. Confirm `Install` in Tampermonkey.
4. Open or reload [app.diagrams.net](https://app.diagrams.net/?splash=0).
5. Look for `Arrange > Boolean Operations`.

The userscript runs only on `https://app.diagrams.net/*`. It loads Paper.js
0.12.18 and the plugin source before registering the menu commands.

## Install in a self-hosted editor

For a self-hosted diagrams.net deployment configured with
`ALLOW_CUSTOM_PLUGINS = true`, add this URL in `Extras > Plugins > Custom`:

```text
https://851687992.github.io/drawio-boolean-ops/boolean-ops.js
```

The plugin is not supported by draw.io Desktop or the Confluence/Jira
integrations.

## Use

1. Create two or more supported shapes with no text labels.
2. Place the base shape behind the cutter shape when using Subtract.
3. Select all participating shapes.
4. Choose `Arrange > Boolean Operations` and select an operation.

For Subtract, the bottommost selected shape is the base and all shapes above it are cutters.

## MVP limitations

Supported:

- Rectangle and rounded rectangle
- Circle and ellipse
- Rhombus
- Triangle
- Multiple shapes with the same parent
- Undo and redo

Not supported:

- Rotated shapes
- Text labels
- Connectors, images, groups, and relative child cells
- Arbitrary draw.io stencils and imported SVG paths
- Native node editing after the operation

The result is inserted as a scalable SVG image cell. Keep a copy of the source shapes until the result has been checked.

## Security

The plugin loads Paper.js 0.12.18 from jsDelivr at runtime. Review plugin source before installation. Draw.io plugins execute with access to the current editor and diagram.

## Development status

This is an experimental MVP intended for simple figure-construction tasks. Test on a copy of a diagram before using it in production work.

## License

MIT
