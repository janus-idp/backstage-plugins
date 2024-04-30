/* eslint-disable no-console */
const path = require('path');
const fs = require('fs-extra');

const scriptDir = path.dirname(__filename);

const distDynamic = path.join(scriptDir, '..', 'dist-dynamic');
const showcaseFolder =
  process.env.BACKSTAGE_SHOWCASE ||
  path.join(scriptDir, '..', '..', '..', '..', 'backstage-showcase');

const targetFolder = path.join(
  showcaseFolder,
  'dynamic-plugins-root',
  'orchestrator-plugin-backend',
);

console.log(new Date().toLocaleTimeString('en-US', { hour12: false }));
fs.removeSync(targetFolder);
fs.copySync(distDynamic, targetFolder);
console.log(`copied ${distDynamic} to ${targetFolder}}`);

console.log(
  `${new Date().toLocaleTimeString('en-US', {
    hour12: false,
  })}: done copying orchestrator-backend plugin to showcase`,
);
