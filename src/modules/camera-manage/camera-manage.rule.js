import {
  i18n
} from '@/utils/i18n.utils';
import CameraManageSrv from './camera-manage.service';

// const validatorLabel = () => (rule, value, callback) => {
//   if (value) {
//     if (value.length < 33) {
//       callback();
//     } else {
//       callback(i18n.t('最多选择32个标签'));
//     }
//   } else {
//     callback();
//   }
// };
/**
 * 校验相机是否重名
 */
const validatorCameraName = (data) => async (rule, value, callback) => {
  console.log(data);
  if (!value) {
    callback(new Error(i18n.t('请输入{from}-{to}位字符', {
      from: 2,
      to: 50
    })));
  } else {
    const id = data && data.id;
    const params = {
      id,
      name: value
    };
    const result = await CameraManageSrv.checkCameraExist(params);
    if (result.code === 0) {
      callback();
    } else {
      callback(new Error(i18n.t('相机名已存在')));
    }
  }
};
const validateDeviceLabel = (data) => (rule, value, callback) => {
  if (data.tagCodes.length > 32) {
    callback(new Error(i18n.t('最多选择{entity}个标签', {
      entity: 32
    })));
  } else {
    callback();
  }
};
const validatorCmdPort = (rule, value, callback) => {
  if (/^\d{1,5}$/.test(value) && value > 0 && value < 65536) {
    callback();
  } else {
    callback(new Error(i18n.t('请输入纯数字,最大{entity}位', {
      entity: 5
    })));
  }
};
const validatorChannelNumber = (data) => async (rule, value, callback) => {
  if (value) {
    const params = {
      cameraId: data.id || null,
      // type: data.type,
      boxId: data.boxId,
      boxChannelNo: value
    };
    const result = await CameraManageSrv.checkChannelExists(params);
    if (result.code === 0) {
      callback();
    } else {
      callback(new Error(result.msg || i18n.t('当前通道号不可用')));
    }
  } else {
    callback(i18n.t('请选择通道号'));
  }
};
const validatorNumberByType = (data) => (rule, value, callback) => {
  console.log(data);
  if (data.recordType === 1) {
    if (Number(value) > 60 || Number(value) < 10 || (!Number(value) && value !== '0')) {
      callback(new Error(i18n.t('请输入{from}~{to}之间的数字', {
        from: 10,
        to: 60
      })));
    } else {
      callback();
    }
  } else if (data.recordType === 2) {
    if (Number(value) > 3600 || Number(value) < 10 || (!Number(value) && value !== '0')) {
      callback(new Error(i18n.t('请输入{from}~{to}之间的数字', {
        from: 10,
        to: 3600
      })));
    } else {
      callback();
    }
  } else {
    callback();
  }
};
const rules = {
  addCamera: (data) => ({
    name: [{
      required: true,
      validator: validatorCameraName(data),
      trigger: 'blur'
    }, {
      pattern: /^.{2,50}$/,
      message: i18n.t('请输入{from}-{to}个字符', {
        from: 2,
        to: 50
      }),
    }],
    type: [{
      required: true,
      trigger: ['blur', 'change'],
      message: i18n.t('请选择相机类型')
    }],
    manufacturer: [{
      required: true,
      trigger: ['blur', 'change'],
      message: i18n.t('请选择相机协议')
    }],
    monitoringType: [{
      required: true,
      trigger: ['blur', 'change'],
      message: i18n.t('请选择卡口类型')
    }],
    ipAddr: [{
      required: true,
      trigger: 'blur',
      message: i18n.t('请输入IP或字符串')
    }, {
      // validator: validatorIpAddr(data),
      trigger: 'blur'
    }],
    password: [{
      required: true,
      trigger: 'blur',
      message: i18n.t('请输入密码')
    }, {
      min: 2,
      max: 50,
      message: i18n.t('请输入{from}-{to}个字符', {
        from: 2,
        to: 50
      }),
      trigger: 'blur'
    }],
    username: [{
      required: true,
      trigger: 'blur',
      message: i18n.t('请输入用户名')
    }, {
      min: 2,
      max: 50,
      message: i18n.t('请输入{from}-{to}个字符', {
        from: 2,
        to: 50
      }),
      trigger: 'blur'
    }],
    cmdPort: [{
      required: true,
      trigger: 'blur',
      message: i18n.t('请输入信令端口')
    }, {
      // pattern: /^\d{1,5}$/,
      // message: i18n.t('请输入纯数字,最大{entity}位', {
      //   entity: 5
      // }),
      validator: validatorCmdPort,
      trigger: 'blur',
    }],
    videoPort: [{
      required: true,
      trigger: 'blur',
      message: i18n.t('请输入视频流端口')
    }, {
      pattern: /^\d{1,5}$/,
      message: i18n.t('请输入纯数字,最大{entity}位', {
        entity: 5
      }),
    }],
    managementId: [{
      required: true,
      trigger: ['blur', 'change'],
      message: i18n.t('请选择应用管理部门')
    }],
    location: [{
      pattern: /^.{2,50}$/,
      message: i18n.t('请输入{from}-{to}个字符', {
        from: 2,
        to: 50
      }),
      trigger: 'blur'
    }],
    numeration: [{
      required: false
    }, {
      pattern: /^.{2,50}$/,
      message: i18n.t('请输入{from}-{to}个字符', {
        from: 2,
        to: 50
      }),
      trigger: ['blur', 'change']
    }],
    boxId: [{
      required: true,
      trigger: ['blur', 'change'],
      message: i18n.t('请选择相关联的智能盒')
    }],
    chanelNum: [{
      required: true,
      message: i18n.t('请选择通道号')
    }, {
      validator: validatorChannelNumber(data),
      trigger: ['blur', 'change']
    }],
    storageScheme: [{
      required: true,
      trigger: ['blur', 'change'],
      message: i18n.t('请选择存储方案')
    }],
    ptz: [{
      required: true,
      trigger: ['change'],
      message: i18n.t('请选择云台状态')
    }],
    statusSyncInterval: [{
      required: true,
      trigger: ['blur', 'change'],
      message: i18n.t('请选择状态刷新事件')
    }],
    lowQuality: [{
      required: true,
      trigger: ['change'],
      message: i18n.t('请选择是否保存低质量图片')
    }],
    fullRectModel: [{
      required: true,
      trigger: ['blur', 'change'],
      message: i18n.t('请选择人脸框模式')
    }],
    alarmShortVideo: [{
      required: true,
      trigger: ['change'],
      message: i18n.t('请选择报警短视频状态')
    }],
    tagCodes: [{
      validator: validateDeviceLabel(data),
      trigger: 'change'
    }],
    period: [{
      validator: validatorNumberByType(data),
      trigger: 'blur'
    }],
  }),
  addGroup: {
    name: [{
      required: true,
      message: i18n.t('请输入{from}-{to}位字符', {
        from: 1,
        to: 12
      }),
      trigger: ['blur', 'change']
    }, {
      pattern: /^.{1,12}$/,
      message: i18n.t('请输入{from}-{to}位字符', {
        from: 1,
        to: 12
      }),
      trigger: ['blur', 'change']
    }],
    remark: [{
      required: false,
      message: i18n.t('请输入{from}-{to}位字符', {
        from: 1,
        to: 50
      }),
      trigger: ['blur', 'change']
    }, {
      pattern: /^.{1,50}$/,
      message: i18n.t('请输入{from}-{to}位字符', {
        from: 1,
        to: 50
      }),
      trigger: ['blur', 'change']
    }]
  }
};
export default rules;
