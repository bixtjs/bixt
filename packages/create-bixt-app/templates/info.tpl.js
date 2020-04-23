const colors = require('colors');

module.exports = ({ workDir }) => {
  return `
${colors.green('Success!')} Initialize project at ${workDir}

Inside that directory, you can run several commands:

  ${colors.cyan('npm run dev')}
    Starts the development server.

  ${colors.cyan('npm run build')}
    Builds the app for production.

  ${colors.cyan('npm start')}
    Runs the built app in production mode.

We suggest that you begin by typing:
  ${colors.cyan(`
  cd ${workDir}
  npm run dev
  `)}
  `.trim();
};
