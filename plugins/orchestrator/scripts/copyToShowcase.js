/* eslint-disable no-console */
const path = require('path');
const fs = require('fs-extra');

const scriptDir = path.dirname(__filename);

const distScalprum = path.join(scriptDir, '..', 'dist-scalprum');
const packageJsonFile = path.join(scriptDir, '..', 'package.json');
const showcaseFolder =
  process.env.SHOWCASE_DIR ||
  path.join(scriptDir, '..', '..', '..', '..', 'backstage-showcase');

const targetFolder = path.join(
  showcaseFolder,
  'dynamic-plugins-root',
  'orchestrator-plugin',
);

fs.copySync(distScalprum, path.join(targetFolder, 'dist-scalprum'));
fs.copyFileSync(packageJsonFile, path.join(targetFolder, 'package.json'));

console.log(
  `copied ${distScalprum} and ${packageJsonFile} to ${targetFolder}}`,
);
console.log(
  `${new Date().toLocaleTimeString('en-US', {
    hour12: false,
  })}: done copying orchestrator plugin to showcase`,
);
