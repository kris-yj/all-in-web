import { curry } from 'lodash';
import { switchToModule, openByNewTab } from '@/utils/utils';

// const baseUrl = window.location.origin;
const urls = {

  cameraManage: '/camera-manage',
  mutipleSearch: '/multiple-search',
  alarmRealtime: '/alarm-realtime',
  portraitLibrary: '/portrait-library',
  deviceRegion: '/device-region',
  tactics: '/device-region',
  groupSetting: '/group-setting',
  gangControl: '/gang-control',
  focusGroup: '/focus-group',
  focusSituation: '/focus-situation',
  focusDocument: '/focus-document',
  unitSituation: '/control-unit-situation',
  unitDocument: '/control-unit-document',
  gridControl: '/grid-control',
  document: '/document',
};
export const controlBtnConf = {
  // 基础
  cameraManage: { name: '相机管理', path: urls.cameraManage },
  mutipleSearch: { name: '综合检索', path: urls.mutipleSearch },
  alarmRealtime: { name: '实时报警', path: urls.alarmRealtime },
  portraitLibrary: { name: '底库管理', path: urls.portraitLibrary },
  deviceRegion: { name: '区域管理', path: urls.deviceRegion },
  tactics: { name: '大数据研判', path: urls.tactics },
  tactics1: { name: '新建战法', path: urls.tactics },
  groupSetting: { name: '群体设置', path: urls.groupSetting },
  gangControl: { name: '团伙管控', path: urls.gangControl },
  focusGroup: { name: '群体管控', path: urls.focusGroup },
  focusSituation: { name: '人员管控', path: urls.focusSituation },
  focusDocument: { name: '关注人员档案', path: urls.focusDocument },
  unitSituation: { name: '防控单元管控', path: urls.unitSituation },
  unitDocument: { name: '防控单元档案', path: urls.unitDocument },
  gridControl: { name: '网格管控', path: urls.gridControl },
  gridSetting: { name: '网格配置', path: urls.gridControl },
  document: { name: '全息档案', path: urls.document },
};
const getModuleInfo = (path) => {
  const pathArr = path.split('/').filter((item) => item);
  const [module, child] = pathArr;
  return {
    module,
    ...(child ? { child } : {}),
  };
};
export const routerSwitch = (path) => {
  if (path.startsWith('http')) {
    // window.open(path);
    openByNewTab(path);
    return;
  }

  // setTimeout(() => {
  //   if (window.guideWindow) {
  //     alert('window.guideWindow focus');
  //     window.guideWindow.focus();
  //   }
  // }, 5000);

  const info = getModuleInfo(path);
  switchToModule({
    ...info,
    isBlank: true,
  });
};

export const checkDisabled = curry((permissions, path) => {
  if (!Array.isArray(permissions)) return true;
  if (path.startsWith('http')) return false;
  const info = getModuleInfo(path);
  const { module: name } = info;
  const checkArr = [...permissions];
  while (checkArr.length) {
    const checkItem = checkArr.shift();
    if (checkItem.alias === name) return false;
    if ('childPermissions' in checkItem) {
      checkArr.unshift(...([].concat(checkItem.childPermissions)));
    }
  }
  return true;
});

export const sectionEnum = (function (obj) {
  obj[obj[0] = 'common'] = 0;
  obj[obj[1] = 'base'] = 1;
  obj[obj[2] = 'after'] = 2;
  obj[obj[3] = 'middle'] = 3;
  obj[obj[4] = 'before'] = 4;
  obj[obj[5] = 'record'] = 5;
  return obj;
}({}));
