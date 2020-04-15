const path = require('path');
const fs = require('fs-extra');

module.exports = class WebpackContext {
  /**
   * Create webpack context
   * @param {object} param0
   * @param {object} param0.config
   * @param {function} param0.config.webpackConfig
   * @param {string} param0.workDir
   * @param {string} param0.mode
   * @param {object} param1
   * @param {import('./writer')} param1.writer
   */
  constructor ({ config = {}, workDir, mode }, { writer }) {
    this.mode = mode;
    this.srcDir = path.join(workDir, '.bixt');
    this.wwwDir = path.join(workDir, 'www');
    this.writer = writer;
    this.webpackConfig = config.webpackConfig || (c => c);
    this.middlewares = (config.middlewares || []).map(mw => path.join(workDir, mw));

    this.pages = [];
    this.staticPages = [];

    fs.ensureDirSync(this.srcDir);
  }
};
