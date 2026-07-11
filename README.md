# drawio-boolean-ops

Experimental Boolean path operations plugin for the diagrams.net/draw.io web editor.

## Operations

- Union
- Subtract
- Intersect
- Exclude

The plugin adds `Arrange > Boolean Operations` to the web editor.

## Install in diagrams.net

1. Open [app.diagrams.net](https://app.diagrams.net/?splash=0).
2. Select `Extras > Plugins`.
3. Click `Add`, choose the custom/external plugin option, and enter:

   ```text
   https://851687992.github.io/drawio-boolean-ops/boolean-ops.js
   ```

4. Click `Apply` and reload the editor tab.

Plugins are supported by the diagrams.net web editor and self-hosted Docker version. They are not supported by draw.io Desktop or the Confluence/Jira integrations.

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
