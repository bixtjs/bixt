const Bundle = require('bono');

const bundle = new Bundle();

bundle.get('/', ctx => {
  return {
    bar: 'bar',
  };
});

module.exports = bundle;
