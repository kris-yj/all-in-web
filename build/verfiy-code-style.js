const chalk = require('chalk');
const kebabCase = require('lodash/kebabCase');
const { resolve, join } = require('path');
const { readdirSync, statSync } = require('fs');

const ignoreList = /i18n|fonts|.md/;

function scanTargetDir(target) {
  const invalidFiles = [];
  const scanDir = dir => {
    for (const item of readdirSync(dir)) {
      const itemDir = join(dir, item);
      if (isIgnore(itemDir)) continue;
      if (statSync(itemDir).isDirectory()) {
        scanDir(itemDir);
        if (!verifyName(item)) {
          invalidFiles.push([item, 'dir', itemDir]);
        }
      } else {
        const fileName = item.replace(/\.\w+$/, '').split('.')[0];
        if (!verifyName(fileName)) {
          invalidFiles.push([item, 'file', itemDir]);
        }
      }
    }
  }
  scanDir(target);
  return invalidFiles;
}

function verifyName(str) {
  return kebabCase(str) === str;
}

function isIgnore(str) {
  return ignoreList.test(str);
}

function suggest(name, type) {
  if (type === 'file') {
    return name.replace(/(.+?)(\.\w+)$/, (a, $1, $2) => {
      return kebabCase($1) + $2;
    });
  } 
  return kebabCase(name);
}

function logErr(names) {
  names = names.map(([name, type, dir]) => {
    return `    ${chalk.green(`${name} → ${suggest(name, type)}`)} ${chalk.gray(dir)}\n`;
  });
  console.log();
  console.error(
    `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(`invalid code style.`)}\n\n` +
    chalk.red(`  kebab-case style of a file or directory excepted. Suggest:\n\n`) +
    names.join('') + 
    chalk.green(`\n  See https://wiki.megvii-inc.com/pages/viewpage.action?pageId=58139483 for more details.\n`)
  );
  process.exit(1);
}

function verifyCodeStyle() {
  const targetDir = resolve(__dirname, '..', 'src');
  const invalidFiles = scanTargetDir(targetDir);
  if (invalidFiles.length) {
    logErr(invalidFiles);
  }
}

verifyCodeStyle();