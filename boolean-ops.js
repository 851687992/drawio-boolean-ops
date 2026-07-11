/**
 * Boolean path operations for diagrams.net / draw.io.
 *
 * MVP scope: unrotated rectangles, ellipses, rhombi, and triangles that
 * share the same parent. Results are inserted as scalable SVG image cells.
 */
Draw.loadPlugin(function(ui)
{
    'use strict';

    var PAPER_URL = 'https://cdn.jsdelivr.net/npm/paper@0.12.18/dist/paper-full.min.js';
    var paperLoading = false;
    var paperCallbacks = [];

    mxResources.parse('booleanOperations=Boolean Operations');
    mxResources.parse('booleanUnion=Union');
    mxResources.parse('booleanSubtract=Subtract');
    mxResources.parse('booleanIntersect=Intersect');
    mxResources.parse('booleanExclude=Exclude');

    function fail(message)
    {
        mxUtils.alert('Boolean Operations: ' + message);
    }

    function loadPaper(callback)
    {
        if (window.paper != null)
        {
            callback();
            return;
        }

        paperCallbacks.push(callback);

        if (!paperLoading)
        {
            paperLoading = true;

            mxscript(PAPER_URL, function()
            {
                paperLoading = false;
                var callbacks = paperCallbacks.slice();
                paperCallbacks.length = 0;

                for (var i = 0; i < callbacks.length; i++)
                {
                    callbacks[i]();
                }
            });
        }
    }

    function getRoundedRadius(style, width, height)
    {
        if (mxUtils.getValue(style, mxConstants.STYLE_ROUNDED, '0') !== '1')
        {
            return 0;
        }

        var arcSize = parseFloat(mxUtils.getValue(style,
            mxConstants.STYLE_ARCSIZE, mxConstants.RECTANGLE_ROUNDING_FACTOR * 100));

        if (!isFinite(arcSize))
        {
            arcSize = mxConstants.RECTANGLE_ROUNDING_FACTOR * 100;
        }

        return Math.max(0, Math.min(width, height) * arcSize / 200);
    }

    function createTriangle(scope, x, y, width, height, direction)
    {
        var path = new scope.Path();

        if (direction === mxConstants.DIRECTION_NORTH)
        {
            path.add(new scope.Point(x + width / 2, y));
            path.add(new scope.Point(x + width, y + height));
            path.add(new scope.Point(x, y + height));
        }
        else if (direction === mxConstants.DIRECTION_SOUTH)
        {
            path.add(new scope.Point(x, y));
            path.add(new scope.Point(x + width, y));
            path.add(new scope.Point(x + width / 2, y + height));
        }
        else if (direction === mxConstants.DIRECTION_WEST)
        {
            path.add(new scope.Point(x, y + height / 2));
            path.add(new scope.Point(x + width, y));
            path.add(new scope.Point(x + width, y + height));
        }
        else
        {
            path.add(new scope.Point(x, y));
            path.add(new scope.Point(x + width, y + height / 2));
            path.add(new scope.Point(x, y + height));
        }

        path.closed = true;
        return path;
    }

    function cellToPath(scope, graph, cell)
    {
        var model = graph.getModel();
        var geometry = model.getGeometry(cell);
        var style = graph.getCellStyle(cell);

        if (!model.isVertex(cell) || geometry == null || geometry.relative)
        {
            throw new Error('Select only basic, non-relative vertex shapes.');
        }

        if (model.getValue(cell) != null && String(model.getValue(cell)).trim() !== '')
        {
            throw new Error('Remove text labels before applying a Boolean operation.');
        }

        var rotation = parseFloat(mxUtils.getValue(style, mxConstants.STYLE_ROTATION, 0));

        if (isFinite(rotation) && Math.abs(rotation) > 0.001)
        {
            throw new Error('Rotated shapes are not supported in this MVP.');
        }

        var x = geometry.x;
        var y = geometry.y;
        var width = geometry.width;
        var height = geometry.height;
        var shape = mxUtils.getValue(style, mxConstants.STYLE_SHAPE,
            mxConstants.SHAPE_RECTANGLE);
        var rect = new scope.Rectangle(x, y, width, height);
        var path;

        if (shape === mxConstants.SHAPE_ELLIPSE || shape === 'ellipse')
        {
            path = new scope.Path.Ellipse(rect);
        }
        else if (shape === mxConstants.SHAPE_RHOMBUS || shape === 'rhombus')
        {
            path = new scope.Path();
            path.add(new scope.Point(x + width / 2, y));
            path.add(new scope.Point(x + width, y + height / 2));
            path.add(new scope.Point(x + width / 2, y + height));
            path.add(new scope.Point(x, y + height / 2));
            path.closed = true;
        }
        else if (shape === mxConstants.SHAPE_TRIANGLE || shape === 'triangle')
        {
            path = createTriangle(scope, x, y, width, height,
                mxUtils.getValue(style, mxConstants.STYLE_DIRECTION,
                    mxConstants.DIRECTION_EAST));
        }
        else if (shape === mxConstants.SHAPE_RECTANGLE || shape === 'rectangle')
        {
            var radius = getRoundedRadius(style, width, height);
            path = radius > 0 ?
                new scope.Path.Rectangle(rect, new scope.Size(radius, radius)) :
                new scope.Path.Rectangle(rect);
        }
        else
        {
            throw new Error('Unsupported shape type: ' + shape);
        }

        path.closed = true;
        return path;
    }

    function encodeSvg(svg)
    {
        return 'data:image/svg+xml,' + encodeURIComponent(svg)
            .replace(/'/g, '%27')
            .replace(/"/g, '%22');
    }

    function runBoolean(operation)
    {
        loadPaper(function()
        {
            var graph = ui.editor.graph;
            var model = graph.getModel();
            var cells = graph.getSelectionCells().slice();

            if (cells.length < 2)
            {
                fail('Select at least two shapes.');
                return;
            }

            var parent = model.getParent(cells[0]);

            for (var i = 1; i < cells.length; i++)
            {
                if (model.getParent(cells[i]) !== parent)
                {
                    fail('All selected shapes must share the same parent.');
                    return;
                }
            }

            cells.sort(function(a, b)
            {
                return model.getChildIndex(a) - model.getChildIndex(b);
            });

            var scope = new paper.PaperScope();
            scope.setup(document.createElement('canvas'));

            try
            {
                var paths = [];

                for (var j = 0; j < cells.length; j++)
                {
                    paths.push(cellToPath(scope, graph, cells[j]));
                }

                var result = paths[0];

                for (var k = 1; k < paths.length; k++)
                {
                    var next;

                    if (operation === 'union')
                    {
                        next = result.unite(paths[k]);
                    }
                    else if (operation === 'subtract')
                    {
                        next = result.subtract(paths[k]);
                    }
                    else if (operation === 'intersect')
                    {
                        next = result.intersect(paths[k]);
                    }
                    else
                    {
                        next = result.exclude(paths[k]);
                    }

                    result.remove();
                    result = next;
                }

                if (result == null || result.isEmpty() || result.bounds.width < 0.5 ||
                    result.bounds.height < 0.5)
                {
                    throw new Error('The operation produced an empty result.');
                }

                var firstStyle = graph.getCellStyle(cells[0]);
                var fillColor = mxUtils.getValue(firstStyle,
                    mxConstants.STYLE_FILLCOLOR, '#ffffff');
                var strokeColor = mxUtils.getValue(firstStyle,
                    mxConstants.STYLE_STROKECOLOR, '#000000');
                var strokeWidth = parseFloat(mxUtils.getValue(firstStyle,
                    mxConstants.STYLE_STROKEWIDTH, 1));

                result.fillColor = fillColor === mxConstants.NONE ? null : fillColor;
                result.strokeColor = strokeColor === mxConstants.NONE ? null : strokeColor;
                result.strokeWidth = isFinite(strokeWidth) ? strokeWidth : 1;

                var bounds = result.bounds.clone();
                result.translate(new scope.Point(-bounds.x, -bounds.y));

                var svgNode = result.exportSVG({asString: false});
                var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
                    bounds.width + ' ' + bounds.height + '" width="' + bounds.width +
                    '" height="' + bounds.height + '">' + svgNode.outerHTML + '</svg>';
                var image = encodeSvg(svg);
                var imageStyle = 'shape=image;imageAspect=0;aspect=fixed;' +
                    'verticalLabelPosition=bottom;verticalAlign=top;image=' + image + ';';

                model.beginUpdate();
                try
                {
                    graph.removeCells(cells, false);
                    var newCell = graph.insertVertex(parent, null, '', bounds.x, bounds.y,
                        bounds.width, bounds.height, imageStyle);
                    graph.setSelectionCell(newCell);
                }
                finally
                {
                    model.endUpdate();
                }
            }
            catch (error)
            {
                fail(error.message || String(error));
            }
            finally
            {
                scope.remove();
            }
        });
    }

    ui.actions.addAction('booleanUnion', function() { runBoolean('union'); });
    ui.actions.addAction('booleanSubtract', function() { runBoolean('subtract'); });
    ui.actions.addAction('booleanIntersect', function() { runBoolean('intersect'); });
    ui.actions.addAction('booleanExclude', function() { runBoolean('exclude'); });

    ui.menus.put('booleanOperations', new Menu(function(menu, parent)
    {
        ui.menus.addMenuItems(menu, [
            'booleanUnion',
            'booleanSubtract',
            'booleanIntersect',
            'booleanExclude'
        ], parent);
    }));

    var arrangeMenu = ui.menus.get('arrange');
    var oldArrangeMenu = arrangeMenu.funct;

    arrangeMenu.funct = function(menu, parent)
    {
        oldArrangeMenu.apply(this, arguments);
        menu.addSeparator(parent);
        ui.menus.addSubmenu('booleanOperations', menu, parent);
    };
});
