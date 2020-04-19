#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const prompts = require('prompts');
const validate = require('validate-npm-package-name');
const { spawn } = require('child_process');
const colors = require('colors');

const DEPENDENCIES = [
  'bixt',
  'lit-element',
];
const GITIGNORES = [
  'node_modules',
  '.bixt',
  'www',
];

(async () => {
  try {
    const workDir = await initApp(process.argv.slice(2)[0]);
    await initDeps(workDir);
    await initFiles(workDir);
    await initGit(workDir);
    await showInfo(workDir);
  } catch (err) {
    console.info(`
Usage:
  npx create-bixt-app [dir]
  npm init bixt-app [dir]
    `.trim());
  }
})();

async function initFiles (workDir) {
  await fs.ensureDir(path.join(workDir, 'pages'));
  await fs.ensureDir(path.join(workDir, 'pages/api'));
  await fs.writeFile(path.join(workDir, 'pages/index.js'), `
import { LitElement, html } from 'lit-element';
import { shady } from 'bixt/shady';

export default class Home extends shady(LitElement) {
  static get properties () {
    return {
      name: { type: String },
      version: { type: String },
    };
  }

  connectedCallback () {
    super.connectedCallback();

    this.name = '.........';
    this.version = '0.0.0';

    setTimeout(async () => {
      const resp = await fetch('/api');
      const { name, version } = await resp.json();
      this.name = name;
      this.version = version;
    }, 1000);
  }

  render () {
    return html\`
      <style>
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
      </style>

      <div class="container">
        <div>
          <h1>Hello world</h1>
          <p>Welcome to <strong style="color: red">bixt</strong></p>
          <p>API Status</p>
          <p>\${this.name} v\${this.version}</p>
        </div>
      </div>
    \`;
  }

  createRenderRoot () {
    return this;
  }
}
  `.trim());

  await fs.writeFile(path.join(workDir, 'pages/api/index.js'), `
module.exports = ctx => {
  const pkg = require('../../package.json');
  return {
    name: pkg.name,
    version: pkg.version,
  };
};
  `.trim());
}

function showInfo (workDir) {
  console.info(`
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
  cd my-app
  npm run dev
  `)}
  `.trim());
}

async function initGit (workDir) {
  if (await fs.exists(path.join(workDir, '.git'))) {
    return;
  }

  console.info('');
  console.info('Initializing git repository ...');

  const gitignoreFile = path.join(workDir, '.gitignore');
  if (!await fs.exists(gitignoreFile)) {
    await fs.writeFile(gitignoreFile, GITIGNORES.join('\n'));
  }

  console.info('');
  await spawnAsync('git', ['init'], { cwd: workDir });
  console.info('');
}

async function initDeps (workDir) {
  const pjsFile = path.join(workDir, 'package.json');
  const pjs = require(pjsFile);

  if (!pjs.dependencies || !pjs.dependencies.bixt) {
    console.info('');
    console.info(`Installing ${DEPENDENCIES.map(d => colors.cyan(d)).join(', ')} ...`);

    console.info('');
    await spawnAsync('npm', ['i', ...DEPENDENCIES, '--save'], { cwd: workDir });
    console.info('');
  }

  pjs.scripts = {
    ...pjs.scripts,
    dev: 'bixt dev',
    build: 'bixt build',
    start: 'bixt start',
  };

  await fs.writeFile(pjsFile, JSON.stringify(pjs, null, 2));
}

async function initApp (workDir) {
  const initialName = workDir ? path.basename(workDir) : 'my-app';

  console.info('');
  console.info('Initializing bixt application ...');

  const questions = [
    {
      type: 'text',
      name: 'name',
      message: 'Project name?',
      initial: initialName,
      validate: value => {
        const { validForNewPackages, validForOldPackages } = validate(value);
        return validForNewPackages && validForOldPackages;
      },
    },
  ];

  const { name } = await prompts(questions);

  workDir = path.resolve(workDir || name);
  const pjsFile = path.join(workDir, 'package.json');
  if (await fs.exists(pjsFile)) {
    console.error('Project directory already initialized');
    return;
  }

  const pjs = {
    name,
    version: '0.1.0',
    private: true,
  };

  await fs.ensureDir(workDir);
  await fs.writeFile(path.join(workDir, 'package.json'), JSON.stringify(pjs, null, 2));

  return workDir;
}

function spawnAsync (cmd, args, opts) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      env: { ...process.env },
      ...opts,
    });
    child.on('close', code => {
      if (code === 0) return resolve();
      reject(new Error(`Caught error on spawn: ${cmd} ${args.join(' ')}`));
    });
  });
}
