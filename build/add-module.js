/**
 * 自动生成module目录
 * src/modules/
 */
const fs = require('fs');
const path = require('path');
const render = require('json-templater/string');
const _ = require('lodash');
const camelCase = require('camelcase');
const endOfLine = require('os').EOL;
const firendOutput = require('./firend-cmd.js');

const moduleName = process.argv[2];
const moduleFileName = _.kebabCase(moduleName); // 所有涉及到moulde path的命名以中划线形式
const camelModuleName = _.camelCase(moduleName); // 所有涉及到代码中moulde name的命名以小驼峰形式

const MODULE_OUTPUT_PATH = path.join(__dirname, `../src/modules/${moduleFileName}`);

const PAGES_PATH = path.join(MODULE_OUTPUT_PATH, 'pages');
const COMPONENTS_PATH = path.join(MODULE_OUTPUT_PATH, 'components');
const I18N_PATH = path.join(MODULE_OUTPUT_PATH, 'i18n');
const STORE_PATH = path.join(MODULE_OUTPUT_PATH, 'store');
const INDEX_PATH = path.join(PAGES_PATH, `${moduleFileName}.vue`);
const ROUTER_PATH = path.join(MODULE_OUTPUT_PATH, `${moduleFileName}.router.js`);
const SERVICE_PATH = path.join(MODULE_OUTPUT_PATH, `${moduleFileName}.service.js`);
const EXPORT_PATH = path.join(MODULE_OUTPUT_PATH, 'export.js');
const PRESET_PATH = path.join(MODULE_OUTPUT_PATH, 'preset.js');

const serviceTpl = require('./tpl/service.tpl.js');
const routerTpl = require('./tpl/router.tpl.js');
const moduleTpl = require('./tpl/module.tpl.js');
const exportTpl = require('./tpl/export.tpl.js');
const presetTpl = require('./tpl/preset.tpl.js');

const storeIndexTpls = {
  'indexTpl': require('./tpl/store/index.tpl.js'),
  'actionsTpl': require('./tpl/store/actions.tpl.js'),
  'mutationsTpl': require('./tpl/store/mutations.tpl.js'),
  'gettersTpl': require('./tpl/store/getters.tpl.js')
};

//检查是否已经有同名module
if(fs.existsSync(MODULE_OUTPUT_PATH)) {
  console.log(`${firendOutput.formatTitle('error', 'ERROR')} ${firendOutput.formatText('error', `${moduleFileName} module already exist! `)}`)
  return;
}

//service
const serviceStr = render(serviceTpl, {
  moduleFileName,
  camelModuleName
})

//router
const routerStr = render(routerTpl, {
  moduleFileName,
  camelModuleName
})

//module
const moduleStr = render(moduleTpl, {
  moduleFileName
})

//export
const exportStr = render(exportTpl, {
  moduleFileName,
  camelModuleName
})

//preset
const presetStr = render(presetTpl, {
  moduleFileName
})

//store
const storeStrs = {
  'indexStr': render(storeIndexTpls['indexTpl'], { camelModuleName }),
  'actionsStr': render(storeIndexTpls['actionsTpl']),
  'mutationsStr': render(storeIndexTpls['mutationsTpl']),
  'gettersStr': render(storeIndexTpls['gettersTpl'])
};

//i18 zh-CN
const i18nStr = render(require('./tpl/i18n.tpl.js'));

fs.mkdir(MODULE_OUTPUT_PATH, err => {
  if(err) {
    console.log(`${firendOutput.formatTitle('error', 'ERROR')} ${firendOutput.formatText('error', `Create new module dir failed! `)}`)
    throw(err);
  };
  fs.mkdir(PAGES_PATH, err => {
    fs.writeFileSync(INDEX_PATH, moduleStr);
  });
  fs.mkdir(COMPONENTS_PATH, err => {
    // .gitkeep
    fs.writeFileSync(path.join(COMPONENTS_PATH, '.gitkeep'), '');
  });
  fs.mkdir(I18N_PATH, err => {
    fs.writeFileSync(path.join(I18N_PATH, 'zh-CN.js'), i18nStr);
  });
  fs.mkdir(STORE_PATH, err => {
    fs.writeFileSync(path.join(STORE_PATH, 'index.js'), storeStrs['indexStr']);
    fs.writeFileSync(path.join(STORE_PATH, 'actions.js'), storeStrs['actionsStr']);
    fs.writeFileSync(path.join(STORE_PATH, 'mutations.js'), storeStrs['mutationsStr']);
    fs.writeFileSync(path.join(STORE_PATH, 'getters.js'), storeStrs['gettersStr']);
  });

  fs.writeFileSync(ROUTER_PATH, routerStr);
  fs.writeFileSync(SERVICE_PATH, serviceStr);
  fs.writeFileSync(EXPORT_PATH, exportStr);
  fs.writeFileSync(PRESET_PATH, presetStr);
  

  console.log(`${firendOutput.formatTitle('success', 'DONE')} ${firendOutput.formatText('success', `New module (${moduleFileName}) created successfully ! `)}`)
});


