const fs = require('fs-extra');
const path = require('path');

module.exports = async function clean (_, { workDir }) {
  await fs.remove(path.join(workDir, '.bixt'));
  await fs.remove(path.join(workDir, 'www'));
};
