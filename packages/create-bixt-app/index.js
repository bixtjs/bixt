#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const prompts = require('prompts');
const validate = require('validate-npm-package-name');
const spawn = require('./lib/spawn');
const colors = require('colors');

const DEPENDENCIES = [
  'bixt',
  'lit-element',
];

const DEV_DEPENDENCIES = [
  'eslint',
  'eslint-config-xinix',
];

const GITIGNORES = [
  'node_modules',
  '.bixt',
  'www',
];

(async () => {
  try {
    const workDir = process.argv.slice(2)[0];
    const data = await initApp({ workDir });
    await initDeps(data);
    await initFiles(data);
    await initGit(data);
    await showInfo(data);
  } catch (err) {
    console.info(`
Usage:
  npm init bixt-app [dir]
  npx create-bixt-app [dir]
    `.trim());
    console.error(colors.red('Error caught,'), err);
  }
})();

async function initFiles ({ name, workDir }) {
  await fs.ensureDir(path.join(workDir, 'pages'));
  await fs.ensureDir(path.join(workDir, 'pages/api'));
  await fs.writeFile(path.join(workDir, 'pages/index.js'), require('./templates/index.js.tpl')());
  await fs.writeFile(path.join(workDir, 'pages/api/index.js'), require('./templates/api-index.js.tpl')());

  await fs.writeFile(path.join(workDir, 'README.md'), require('./templates/README.md.tpl')({ name }));
  await fs.writeFile(path.join(workDir, '.editorconfig'), require('./templates/editorconfig.tpl')());
  await fs.writeFile(path.join(workDir, '.eslintrc.js'), require('./templates/eslintrc.js.tpl')());
}

function showInfo ({ workDir }) {
  console.info(require('./templates/info.tpl')({ workDir }));
}

async function initGit ({ workDir }) {
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
  await spawn('git', ['init'], { cwd: workDir });
  console.info('');
}

async function initDeps ({ workDir }) {
  const pjsFile = path.join(workDir, 'package.json');
  const pjs = JSON.parse(await fs.readFile(pjsFile));

  pjs.scripts = {
    ...pjs.scripts,
    dev: 'bixt dev',
    build: 'bixt build',
    start: 'bixt start',
  };

  await fs.writeFile(pjsFile, JSON.stringify(pjs, null, 2));

  console.info('');
  console.info(`Installing ${DEPENDENCIES.map(d => colors.cyan(d)).join(', ')} ...`);

  console.info('');
  await spawn('npm', ['install', ...DEPENDENCIES, '--save'], { cwd: workDir });
  await spawn('npm', ['install', ...DEV_DEPENDENCIES, '-D'], { cwd: workDir });
  console.info('');
}

async function initApp ({ workDir }) {
  if (workDir) {
    workDir = path.resolve(workDir);
  }

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

  return { name, workDir };
}
