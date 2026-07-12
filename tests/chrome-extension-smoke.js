const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const extensionDir = path.join(root, 'chrome-extension');
const manifestPath = path.join(extensionDir, 'manifest.json');
const paperPath = path.join(extensionDir, 'paper-core.min.js');
const pluginPath = path.join(extensionDir, 'boolean-ops.js');

assert(fs.existsSync(manifestPath), 'chrome-extension/manifest.json must exist');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert.strictEqual(manifest.manifest_version, 3);
assert.strictEqual(manifest.version, '0.1.1');
assert.strictEqual(manifest.content_scripts.length, 1);

const contentScript = manifest.content_scripts[0];
assert.deepStrictEqual(contentScript.matches, ['https://app.diagrams.net/*']);
assert.strictEqual(contentScript.run_at, 'document_start');
assert.strictEqual(contentScript.world, 'MAIN');
assert.deepStrictEqual(contentScript.js, ['paper-core.min.js', 'boolean-ops.js']);

assert(fs.existsSync(paperPath), 'bundled Paper.js must exist');
assert(fs.existsSync(pluginPath), 'bundled Boolean Operations plugin must exist');

const paperSource = fs.readFileSync(paperPath, 'utf8');
assert(paperSource.includes('Paper.js v0.12.18'), 'Paper.js version must be 0.12.18');
assert(
  paperSource.includes('window.paper = paper;'),
  'Paper.js must be exported to window.paper for the plugin runtime'
);

const pluginSource = fs.readFileSync(pluginPath, 'utf8');
assert(
  !pluginSource.includes('model.getChildIndex'),
  'plugin must not call the removed model.getChildIndex API'
);
assert(
  pluginSource.includes('parent.getIndex(a) - parent.getIndex(b)'),
  'plugin must sort selected cells through their common parent'
);
assert(
  pluginSource.includes("shape === 'label'"),
  'empty Draw.io label shapes must be handled as rectangles'
);
assert(
  pluginSource.includes('mxConstants.STYLE_IMAGE'),
  'image-backed label shapes must remain unsupported'
);
const actions = new Map();
const menus = new Map([['arrange', { funct() {} }]]);
const pageWindow = {
  document: { createElement() { return {}; } },
  mxResources: { parse() {} },
  mxUtils: { alert() {} },
  mxConstants: {},
  mxscript() {},
  Menu: function Menu(funct) { this.funct = funct; },
  Draw: {
    loadPlugin(callback) {
      callback({
        actions: { addAction(name, fn) { actions.set(name, fn); } },
        menus: {
          put(name, menu) { menus.set(name, menu); },
          get(name) { return menus.get(name); },
          addMenuItems() {},
          addSubmenu() {}
        }
      });
    }
  }
};
pageWindow.window = pageWindow;
pageWindow.setTimeout = setTimeout;

vm.runInNewContext(pluginSource, {
  window: pageWindow,
  setTimeout,
  isFinite,
  parseFloat,
  encodeURIComponent,
  Math,
  String,
  Error
});

for (const name of [
  'booleanUnion',
  'booleanSubtract',
  'booleanIntersect',
  'booleanExclude'
]) {
  assert(actions.has(name), `${name} must be registered`);
}

assert(menus.has('booleanOperations'), 'Boolean Operations submenu must be registered');
assert(
  String(menus.get('arrange').funct).includes('booleanOperations'),
  'Arrange menu must include the Boolean Operations submenu'
);

console.log('Chrome extension smoke test: PASS');
