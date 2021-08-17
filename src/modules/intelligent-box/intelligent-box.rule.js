import { i18n } from '@/utils/i18n.utils';
import BoxSrv from './intelligent-box.service';

const validatorBoxName = (id) => async (rule, value, callback) => {
  console.log('value', id);
  if (!value) {
    callback(new Error(i18n.t('请输入{from}-{to}个字符', {
      from: 2,
      to: 50
    })));
  } else {
    const params = {
      id,
      name: value
    };
    const result = await BoxSrv.checkBoxExist(params);
    if (result.code === 20100001) {
      callback(new Error(i18n.t('智能盒子名已存在')));
    } else {
      callback();
    }
  }
};
const validatorLon = (rule, value, callback) => {
  if (value) {
    if (value < -180
      || value > +180
      || (value.toString().split('.').length === 2 && !value.toString().split('.')[1]) // 如果只输入点不输入小数
      || (value.toString().split('.')[1] && value.toString().split('.')[1].length > 6) // 输入小数超出6位
      || (!Number(value) && value !== '0' && value !== 0)) { // 输入的不是数字
      callback(new Error(i18n.t('请输入-{from}-+{to}的数字,保留小数点后六位', {
        from: 180,
        to: 180
      })));
    } else {
      callback();
    }
  } else {
    callback();
  }
};
const validatorLat = (rule, value, callback) => {
  if (value) {
    if (value < -85
      || value > +85
      || (value.toString().split('.').length === 2 && !value.toString().split('.')[1]) // 如果只输入点不输入小数
      || (value.toString().split('.')[1] && value.toString().split('.')[1].length > 6) // 输入小数超出6位
      || (!Number(value) && value !== '0' && value !== 0)) { // 输入的不是数字
      callback(new Error(i18n.t('请输入-{from}-+{to}的数字,保留小数点后六位', {
        from: 85,
        to: 85
      })));
    } else {
      callback();
    }
  } else {
    callback();
  }
};
const validatorUrl = (id) => async (rule, value, callback) => {
  const urlReg = /(iot)(:)(\/\/)([^\s]+)(:)([^\s]+)(@)((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)(:)(\d{1,5})/;
  if (value) {
    if (!urlReg.test(value) || value.length > 2083) {
      callback(new Error(i18n.t('请输入正确的格式')));
    } else {
      const params = {
        id,
        url: value
      };
      const result = await BoxSrv.checkBoxUrl(params);
      if (result.code !== 0) {
        // callback(new Error('智能盒子url不可用'));
        callback();
      } else {
        callback();
      }
    }
  } else {
    callback(new Error(i18n.t('请输入智能盒子url')));
  }
};
const rules = {
  addBox: (id) => ({
    name: [{
      pattern: /^.{2,50}$/,
      message: i18n.t('请输入{from}-{to}个字符', {
        from: 2,
        to: 50
      }),
    },
    {
      required: true,
      validator: validatorBoxName(id),
      trigger: 'blur'
    }],
    manufacturer: [
      {
        required: true,
        trigger: 'blur',
        message: i18n.t('请选择相机厂商')
      }
    ],
    model: [
      {
        required: true,
        trigger: 'blur',
        message: i18n.t('请选择相机型号')
      }
    ],
    number: [{
      required: false
    }, {
      pattern: /^.{1,50}$/,
      message: i18n.t('请输入{from}-{to}个字符', {
        from: 1,
        to: 50
      }),
      trigger: ['blur', 'change']
    }],
    snNumber: [{
      required: false
    }, {
      pattern: /^.{1,50}$/,
      message: i18n.t('请输入{from}-{to}个字符', {
        from: 1,
        to: 50
      }),
      trigger: ['blur', 'change']
    }],
    gbPlatformId: [{
      required: false
    }, {
      pattern: /^.{20}$/,
      message: i18n.t('请输入{entity}个字符', { entity: 20 }),
      trigger: ['blur', 'change']
    }],
    gbPlatformDeviceId: [{
      required: false
    }, {
      pattern: /^.{20}$/,
      message: i18n.t('请输入{entity}个字符', { entity: 20 }),
      trigger: ['blur', 'change']
    }],
    lon: [{
      required: false,
      message: i18n.t('请输入-{from}-+{to}的数字,保留小数点后六位', {
        from: 180,
        to: 180
      }),
      trigger: 'blur'
    }, {
      validator: validatorLon,
      trigger: 'blur'
    }],
    lat: [{
      required: false,
      message: i18n.t('请输入-{from}-+{to}的数字,保留小数点后六位', {
        from: 85,
        to: 85
      }),
      trigger: 'blur'
    }, {
      validator: validatorLat,
      trigger: 'blur'
    }],
    remark: [{
      required: false,
      message: i18n.t('请输入{from}-{to}个字符', {
        from: 1,
        to: 100
      }),
      trigger: ['blur', 'change']
    }, {
      pattern: /^.{1,100}$/,
      message: i18n.t('请输入{from}-{to}个字符', {
        from: 1,
        to: 100
      }),
      trigger: ['blur', 'change']
    }],
    url: [{
      required: true,
      message: i18n.t('请输入合法的url地址'),
      trigger: 'blur'
    }, {
      validator: validatorUrl(id),
      trigger: 'blur'
    }],
    deptId: [{
      required: true,
      message: i18n.t('请选择所属部门'),
      trigger: ['blur', 'change']
    }],
    channelSize: [{
      required: true,
      message: i18n.t('请选择最大通道数'),
      trigger: ['blur', 'change']
    }]
  }),
};
export default rules;
