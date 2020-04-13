const assert = require('assert');
const path = require('path');
const fs = require('fs-extra');
const Packer = require('../../../compilers/webpack/packer');
const Context = require('../../../compilers/webpack/context');
const Writer = require('../../../compilers/webpack/writer');

const testDir = path.join(process.cwd(), 'tmp-test');

describe('bixt:compilers:webpack:packer Packer', () => {
  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('#getConfig()', () => {
    it('get config', async () => {
      const writer = new Writer();
      const ctx = new Context({ workDir: testDir, mode: 'development' }, { writer });

      const packer = new Packer();

      const config = await packer.getConfig(ctx);

      assert.strictEqual(config.mode, 'development');
      assert.strictEqual(config.devtool, 'sourcemap');
    });

    it('get config with custom', async () => {
      const writer = new Writer();
      const config = {
        webpackConfig (c) {
          c.devtool = 'eval';
          return c;
        },
      };

      const ctx = new Context({ workDir: testDir, mode: 'development', config }, { writer });

      const packer = new Packer();

      {
        const config = await packer.getConfig(ctx);
        assert.strictEqual(config.mode, 'development');
        assert.strictEqual(config.devtool, 'eval');
      }
    });
  });
});
