import { i18n } from '@/utils/i18n.utils';

const rules = {
  eventConfig: {
    deploy: {
      assembleNum: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('人群聚集人数')
          }),
        }],
        trigger: 'blur'
      },
    },
    alarm: {
      bodyThreshold: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('人体识别布控阈值')
          }),
        }],
        trigger: 'blur'
      },
      deploymentThreshold: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('报警布控推荐阈值')
          }),
        }],
        trigger: 'blur'
      },
      motorThreshold: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('机动车识别布控阈值')
          }),
        }],
        trigger: 'blur'
      },
      nonMotorThreshold: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('非机动车识别布控阈值')
          }),
        }],
        trigger: 'blur'
      },
      attrThreshold: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('属性检测布控阈值')
          }),
        }],
        trigger: 'blur'
      },
      warningVideoTime: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('报警视频长度')
          }),
        }],
        trigger: 'blur'
      },
      durationXzone: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('报警活动轨迹检索时长')
          }),
        }],
        trigger: 'blur'
      },
      retrievalThreshold: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('报警活动轨迹人体检索推荐阈值')
          }),
        }],
        trigger: 'blur'
      },
      alarmSound: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('报警声音')
          }),
        }],
        trigger: 'blur'
      },
      alarmInterval: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('报警间隔')
          }),
        }],
        trigger: 'blur'
      },
      distinctInterval: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('报警去重间隔')
          }),
        }],
        trigger: 'blur'
      },
      fullShowTime: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('抓拍图展示时间')
          }),
        }],
        trigger: 'blur'
      },
    }
  },
  searchConfig: {
    search: {
      captureFaceThreshold: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('人像检索推荐阈值')
          }),
        }],
        trigger: 'blur'
      },
      otherFaceThreshold: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('人机非检索推荐阈值')
          }),
        }],
        trigger: 'blur'
      },
      captureFaceLimit: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('人脸检索单个目标返回数量')
          }),
        }],
        trigger: 'blur'
      },
      captureOtherLimit: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('人机非检索单个目标返回数量')
          }),
        }],
        trigger: 'blur'
      },
    },
    capture: {
      alarmVideoLengthSec: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('抓拍视频长度')
          }),
        }],
        trigger: 'blur'
      },
      threshold: {
        value: [{
          required: true,
          message: i18n.t('{entity}不能为空', {
            entity: i18n.t('抓怕检索默认阈值')
          }),
        }],
        trigger: 'blur'
      },
    }
  },
  judgeConfig: {
    judgeThreshold: {
      value: [{
        required: true,
        message: i18n.t('{entity}不能为空', {
          entity: i18n.t('研判阈值')
        }),
      }],
      trigger: 'blur'
    },
    durationFacebodyXzone: {
      value: [{
        required: true,
        message: i18n.t('{entity}不能为空', {
          entity: i18n.t('小范围人体检索时长')
        }),
      }],
      trigger: 'blur'
    },
    thresholdFacebodyXzone: {
      value: [{
        required: true,
        message: i18n.t('{entity}不能为空', {
          entity: i18n.t('小范围人体检索推荐阈值')
        }),
      }],
      trigger: 'blur'
    },
    trackingMapRange: {
      value: [{
        required: true,
        message: i18n.t('{entity}不能为空', {
          entity: i18n.t('默认追踪地图范围')
        }),
      }],
      trigger: 'blur'
    },
  },
  analyzeConfig: {
    platformCapabilities: {
      value: [{
        required: true,
        message: i18n.t('{entity}不能为空', {
          entity: i18n.t('第三方平台转发能力上限')
        }),
      }],
      trigger: 'blur'
    },
  }
};

export default rules;
