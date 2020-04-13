const Writer = require('../../../compilers/webpack/writer');
const assert = require('assert');
const sinon = require('sinon');
const fs = require('fs-extra');

describe('compilers:webpack Writer', () => {
  describe('#renderTemplate()', () => {
    it('render template', async () => {
      const writer = new Writer();
      sinon.stub(writer, 'getTemplate').returns(function (templateCtx) {
        assert.strictEqual(templateCtx, ctx);
        return 'foo';
      });

      const ctx = {};
      const content = await writer.renderTemplate('foo', ctx);
      assert.strictEqual(content, 'foo');
    });
  });

  describe('#write()', () => {
    it('write file with template', async () => {
      const writer = new Writer();
      sinon.stub(writer, 'renderTemplate').returns('hasil');

      const writeFileStub = sinon.stub(fs, 'writeFile');
      writeFileStub.withArgs('dir/foo', 'hasil').resolves();
      writeFileStub.rejects('Wrong file and content');

      try {
        const ctx = { srcDir: 'dir' };
        await writer.write(ctx, 'foo', 'index.html');
        assert.strictEqual(writeFileStub.callCount, 1);
      } finally {
        writeFileStub.restore();
      }
    });
  });
});
