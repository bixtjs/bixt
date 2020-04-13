const fs = require('fs-extra');
const path = require('path');
const logInfo = require('../../logger')('bixt:compilers:webpack:writer');

module.exports = class Writer {
  constructor () {
    Object.defineProperty(this, 'assets', {
      value: {},
    });
  }

  async write (ctx, assetId, overrideFile) {
    const content = await readFile(overrideFile) || await this.renderTemplate(assetId, ctx);
    if (!this.assets[assetId] || this.assets[assetId] !== content) {
      this.assets[assetId] = content;
      await fs.writeFile(path.join(ctx.srcDir, assetId), content);
      logInfo('Asset written', assetId);
    }
  }

  renderTemplate (assetId, ctx) {
    const template = this.getTemplate(assetId);
    return template(ctx);
  }

  getTemplate (assetId) {
    return require(`./templates/${assetId}.tpl.js`);
  }
};

async function readFile (file) {
  if (await fs.exists(file)) {
    return fs.readFile(file, 'utf8');
  }
}

module.exports.readFile = readFile;
