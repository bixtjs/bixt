const path = require('path');
const fs = require('fs-extra');
const prompts = require('prompts');
const validate = require('validate-npm-package-name');
const spawn = require('../lib/spawn');
const logInfo = require('../logger')('bixt:cmd:init');

const DEPENDENCIES = ['bixt', 'lit-element'];

module.exports = async function init (_, { workDir }) {
  workDir = path.resolve(workDir);

  await initApp({ workDir });
  await initDeps({ workDir });
  await initGit({ workDir });
  await showInfo({ workDir });
};

async function showInfo ({ workDir }) {
  logInfo(`Success initialize project at ${workDir}`);

  await require('./help')();

  logInfo('Start development with:');
  console.info('');
  console.info(`cd ${workDir}`);
  console.info('npm run dev');
  console.info('');
}

async function initGit ({ workDir }) {
  if (await fs.exists(path.join(workDir, '.git'))) {
    return;
  }

  logInfo('Initializing git repository ...');

  console.info('');
  await spawn('git', ['init'], { cwd: workDir });
  console.info('');
}

async function initDeps ({ workDir }) {
  const pjsFile = path.join(workDir, 'package.json');
  const pjs = require(pjsFile);

  if (!pjs.dependencies || !pjs.dependencies.bixt) {
    logInfo(`Installing ${DEPENDENCIES.join(', ')} ...`);

    console.info('');
    await spawn('npm', ['i', ...DEPENDENCIES, '--save'], { cwd: workDir });
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

async function initApp ({ workDir }) {
  const pjsFile = path.join(workDir, 'package.json');
  if (await fs.exists(pjsFile)) {
    return;
  }

  logInfo('Initializing bixt application ...');

  const questions = [
    {
      type: 'text',
      name: 'name',
      message: 'Project name?',
      initial: path.basename(workDir),
      validate: value => {
        const { validForNewPackages, validForOldPackages } = validate(value);
        return validForNewPackages && validForOldPackages;
      },
    },
  ];

  const result = await prompts(questions);

  const pjs = {
    name: result.name,
    version: '0.1.0',
    private: true,
  };

  await fs.ensureDir(workDir);
  await fs.writeFile(path.join(workDir, 'package.json'), JSON.stringify(pjs, null, 2));
}
