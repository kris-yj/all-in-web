import { MessageBox, Message } from 'megvii-ui';//eslint-disable-line
import { set as setHttpConfig, transformParams, interceptors } from 'megvii-http';
import store from '@/store';

// 返回数据报错提示统一处理
const responseErrorHook = (config) => {
  // 此处的config为HttpOptions
  const isLogin = config.config && config.config.url && config.config.url.indexOf('users/login') > -1;
  if (!(config.data && config.data.code === 0) && !isLogin) {
    const data = config.config.data || '';
    const redirectedToLogin = window.location.hash === '#/';
    const defaultExpiredMsg = '登录失效请重新登录！';
    const option = {
      type: 'error',
      message: defaultExpiredMsg,
      showClose: true,
      customClass: 'custom-error-toast'
    };

    if (!redirectedToLogin && config.data.msg.trim() !== '') {
      option.message = config.data.msg;
    }

    if (redirectedToLogin) {
      if (data.indexOf('showErrorToast') > -1) {
        Message(option);
      }
    } else {
      Message(option);
    }
  }
};

/**
 * header 添加模块信息拦截器 add module info(alias source) to header
 * @param {*} config
 */
const setModuleInfo = (config) => {
  const { currentModule } = store.state;
  config.headers['Module-Alias'] = currentModule ? currentModule.alias : '';
  config.headers['Module-Source'] = currentModule ? currentModule.source : '';
  return config;
};

/**
 * 请求header 添加TTL，用于防止token 续命
 * @param {*} config
 */
const setTTL = (config) => {
  // 这些接口不续命
  const { addTTL = '' } = config;
  if (addTTL) {
    config.headers.TTL = 0;
  }
  return config;
};

setHttpConfig({
  transformParams: {
    common: [
      // 参数克隆
      transformParams.paramsClone,
      // 过滤空字段
      transformParams.paramsFilter.filters.filterEmptyAny
    ],
    // get请求增加随机值
    get: [transformParams.addRandom]
  },
  interceptors: {
    request: [
      // 拦截器设置token头
      interceptors.request.setToken,
      // 拦截器设置clientAppId头
      interceptors.request.setClientAppId,
      // 请求header添加模块信息，供日志统计使用
      setModuleInfo,
      // 请求header 添加TTL，用于防止token 续命
      setTTL
    ]
  },
  hooks: {
    response: {
      responseErrorHook,
      // token过期
      tokenExpire() {
        console.log(window.location.hash);
        if (window.location.hash === '#/') return;
        const msg = {
          msg: '登录失效请重新登录！',
          title: '登录失效',
          confirm: '确定',
        };
        window.msgAlertOvertime = window.msgAlertOvertime || MessageBox.alert(msg.msg, msg.title, {
          confirmButtonText: msg.confirm,
          showClose: false,
          callback: () => {
            window.msgAlertOvertime = null;
            window.location.hash = '#/login';
            window.location.reload();
          }
        });
      },
      // 接口不存在
      interfaceNoExist(response) {
        console.error(`interface not exist: ${response.config.url}`);
      }
    }
  }
});
