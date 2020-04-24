module.exports = ({ mode, bonoAssets, webpackAssets }) => {
  return `
module.exports = {
  mode: '${mode}',
  bonoAssets: ${JSON.stringify(bonoAssets, null, 2)},
  webpackAssets: ${JSON.stringify(webpackAssets, null, 2)},
};
  `.trim();
};
