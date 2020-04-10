const Bundle = require('bono');

module.exports = class extends Bundle {
  constructor () {
    super();

    this.get('/', ctx => {
      return {
        foo: 'foo',
      };
    });
  }
};
