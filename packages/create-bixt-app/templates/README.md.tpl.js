module.exports = ({ name }) => {
  return `
# ${name}

Starts the development server

\`\`\`sh
npm run dev
\`\`\`

Builds the app for production.

\`\`\`sh
npm run build
\`\`\`

Runs the built app in production mode.

\`\`\`sh
npm start
\`\`\`
  `.trim();
};
