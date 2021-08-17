
const rm = require('rimraf')
const path = require('path');
const chalk = require('chalk');
const firendOutput = require('./firend-cmd.js');

const moduleName = process.argv[2];

const OUTPUT_PATH = path.join(__dirname, `../src/modules/${moduleName}`);

rm(OUTPUT_PATH, err => {
  if (err) {
    throw err;
  }
  console.log(`${firendOutput.formatTitle('success', 'DONE')} ${firendOutput.formatText('success', `Module (${moduleName}) deleted successfully ! `)}`)
});
