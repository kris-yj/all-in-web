/* eslint-disable import/no-unresolved */
import * as _ from 'lodash';
import { i18n } from '@/utils/i18n.utils';
import MultiPersonSrv from '@/modules/multi-person/multi-person.service';
import FrequencySrv from '@/modules/frequency/frequency.service';
import PeerSrv from '@/modules/peer/peer.service';
import AlbumRegionSrv from '@/modules/album-region/album-region.service';
import RegionSrv from '@/modules/region/region.service';

const frequencyName = () => async (rule, value, callback) => {
  console.log('value: ', value);
  if (value.trim() === '') {
    callback(new Error(i18n.t('{entity}不能为空', { entity: i18n.t('任务名称') })));
  } else {
    const params = {};
    params.name = encodeURIComponent(value);
    const result = await FrequencySrv.taskName(params);
    if (result.code !== 0) {
      this.$message({
        type: 'error',
        message: result.msg
      });
    }
    if (result.data === true) {
      callback(i18n.t('{entity}已存在', { entity: i18n.t('任务名称') }));
    }
    callback();
  }
};
const regionName = (id) => async (rule, value, callback) => {
  if (value.trim() === '') {
    callback(new Error(i18n.t('{entity}不能为空', { entity: i18n.t('任务名称') })));
  } else {
    const params = {
      id
    };
    params.name = encodeURIComponent(value);
    const result = await RegionSrv.taskName(params);
    if (result.code !== 0) {
      this.$message({
        type: 'error',
        message: result.msg
      });
    }
    if (result.data === true) {
      callback(i18n.t('{entity}已存在', { entity: i18n.t('任务名称') }));
    }
    callback();
  }
};
const peerName = () => async (rule, value, callback) => {
  console.log('value: ', value);
  if (value.trim() === '') {
    callback(new Error(i18n.t('{entity}不能为空', { entity: i18n.t('任务名称') })));
  } else {
    const params = {};
    params.name = encodeURIComponent(value);
    const result = await PeerSrv.taskName(params);
    if (result.code !== 0) {
      this.$message({
        type: 'error',
        message: result.msg
      });
    }
    if (result.data === true) {
      callback(i18n.t('{entity}已存在', { entity: i18n.t('任务名称') }));
    }
    callback();
  }
};

const personName = () => async (rule, value, callback) => {
  console.log('value: ', value);
  if (value.trim() === '') {
    callback(new Error(i18n.t('{entity}不能为空', { entity: i18n.t('任务名称') })));
  } else {
    const params = {};
    params.name = encodeURIComponent(value);
    const result = await MultiPersonSrv.taskName(params);
    if (result.code !== 0) {
      callback(new Error(result.msg));
    }
    if (result.data.exist === true) {
      callback(new Error(i18n.t('{entity}已存在', { entity: i18n.t('任务名称') })));
    }
    callback();
  }
};
const regionAblumName = () => async (rule, value, callback) => {
  console.log('value: ', value);
  if (value.trim() === '') {
    callback(new Error(i18n.t('{entity}不能为空', { entity: i18n.t('任务名称') })));
  } else {
    const params = {};
    params.name = encodeURIComponent(value);
    const result = await AlbumRegionSrv.taskName(params);
    if (result.code !== 0) {
      this.$message({
        type: 'error',
        message: result.msg
      });
    }
    if (result.data === true) {
      callback(i18n.t('{entity}已存在', { entity: i18n.t('任务名称') }));
    }
    callback();
  }
};

const ThreshhodRegion = () => async (rule, value, callback) => {
  const res = await AlbumRegionSrv.threshold({});
  const minValue = res.data.min;
  // const minValue = 0;
  const threshold = _.toNumber(value);
  const reg = /^([1-9]{1,2}|[0-9][1-9])$|^[1-9]\d{0,1}(\.\d{1,2}){0,1}$|^100(\.0{1,2}){0,1}$/;
  const re = RegExp(reg);
  const ifReg = re.test(value);
  if (_.isNaN(threshold)) {
    callback(i18n.t('请输入数字'));
  } else if (value < minValue || value > 100) {
    callback(i18n.t('请输入{from}-{to}之间的数字', { from: minValue, to: 100 }));
  } else if (!ifReg) {
    callback(i18n.t('请输入正确的格式'));
  } else {
    callback();
  }
};
const validateThreshhodRegion = () => async (rule, value, callback) => {
  const res = await RegionSrv.threshold({});
  const minValue = res.data.min;
  const threshold = _.toNumber(value);
  const reg = /^([1-9]{1,2}|[0-9][1-9])$|^[1-9]\d{0,1}(\.\d{1,2}){0,1}$|^100(\.0{1,2}){0,1}$/;
  const re = RegExp(reg);
  const ifReg = re.test(value);
  if (_.isNaN(threshold)) {
    callback(i18n.t('请输入数字'));
  } else if (value < minValue || value > 100) {
    callback(i18n.t('请输入{from}-{to}之间的数字', { from: minValue, to: 100 }));
  } else if (!ifReg) {
    callback(i18n.t('请输入正确的格式'));
  } else {
    callback();
  }
};
const total = () => ({
  path: [{
    required: true,
    message: i18n.t('{entity}不能为空', {
      entity: i18n.t('路径')
    }),
    trigger: ['blur', 'change']
  }],
});

consola.info('i18n merge rules');

const rules = {
  frequency: {
    jobName: [{
      required: true,
      validator: frequencyName(),
      trigger: ['blur']
    }, {
      pattern: /^.{2,50}$/,
      message: i18n.t('请输入{from}-{to}个汉字，字母，数字', {
        from: 2,
        to: 50
      }),
      trigger: ['blur', 'change']
    }],
    appearCount: [{
      required: true,
      message: i18n.t('{entity}不能为空', {
        entity: i18n.t('频次阈值')
      }),
      trigger: 'blur'
    },
    {
      pattern: /^([2-9]|[1-9][0-9]|100)$/,
      message: '频次阈值为2-100的整数',
      trigger: ['blur', 'change']
    }],
    startTime: [{
      type: 'date',
      required: true,
      message: i18n.t('{entity}不能为空', {
        entity: i18n.t('起止时间')
      }),
      trigger: 'blur'
    }],
    cameraIds: [{
      required: true, message: ' ', trigger: 'blur'
    }],
  },
  region(id) {
    return {
      jobName: [{
        required: true,
        validator: regionName(id),
        trigger: 'blur'
      }, {
        pattern: /^.{2,50}$/,
        message: i18n.t('请输入{from}-{to}个汉字，字母，数字', {
          from: 2,
          to: 50
        }),
        trigger: ['blur', 'change']
      }],
      threshold: [{
        required: true,
        message: i18n.t('{entity}不能为空', {
          entity: i18n.t('比对阈值')
        }),
        trigger: 'blur'
      },
      {
        validator: validateThreshhodRegion(),
        trigger: 'blur'
      }],
      jobType: [{
        required: true, message: ' ', trigger: 'blur'
      }],
    };
  },
  regionDate: {
    jobName: [{
      required: true,
      validator: regionName(),
      trigger: 'blur'
    }, {
      pattern: /^.{2,50}$/,
      message: i18n.t('请输入{from}-{to}个汉字，字母，数字', {
        from: 2,
        to: 50
      }),
      trigger: ['blur', 'change']
    }],
    threshold: [{
      required: true,
      message: i18n.t('{entity}不能为空', {
        entity: i18n.t('比对阈值')
      }),
      trigger: 'blur'
    },
    {
      validator: validateThreshhodRegion(),
      trigger: 'blur'
    }],
    jobType: [{
      required: true, message: ' ', trigger: 'blur'
    }],
  },
  peer: {
    jobName: [{
      required: true,
      validator: peerName(),
      trigger: 'blur'
    }, {
      pattern: /^.{2,50}$/,
      message: i18n.t('请输入{from}-{to}个汉字，字母，数字', {
        from: 2,
        to: 50
      }),
      trigger: ['blur', 'change']
    }],
    appearCount: [{
      required: true,
      message: i18n.t('{entity}不能为空', {
        entity: i18n.t('同行次数')
      }),
      trigger: 'blur'
    },

    {
      pattern: /^([2-9]|[1-9][0-9]|100)$/,
      message: i18n.t('{entity}为{from}-{to}的整数', {
        entity: i18n.t('同行次数'),
        from: 2,
        to: 100
      }),
      trigger: ['blur', 'change']
    }],
    interval: [{
      required: true,
      message: i18n.t('{entity}不能为空', {
        entity: i18n.t('同行间隔')
      }),
      trigger: 'blur'
    }],
    startTime: [],
    cameraIds: [{
      required: true, message: ' ', trigger: 'blur'
    }],
  },
  person: {
    name: [{
      required: true,
      validator: personName(),
      trigger: 'blur'
    }, {
      pattern: /^.{2,50}$/,
      message: i18n.t('请输入{from}-{to}个汉字，字母，数字', {
        from: 2,
        to: 50
      }),
      trigger: ['blur', 'change']
    }],
    uploadFile: [{
      required: true,
      message: i18n.t('{entity}不能为空', {
        entity: i18n.t('人像压缩包')
      }),
      trigger: ['blur', 'change']
    }],
    uploadType: [{
      required: true, message: '', trigger: 'change'
    }],
  },
  albumRegion: {
    jobName: [{
      required: true,
      validator: regionAblumName(),
      trigger: 'blur'
    }, {
      pattern: /^.{2,50}$/,
      message: i18n.t('请输入{from}-{to}个汉字，字母，数字', {
        from: 2,
        to: 50
      }),
      trigger: ['blur', 'change']
    }],
    jobType: [{
      required: true, message: ' ', trigger: 'blur'
    }],
    threshold: [{
      required: true,
      message: i18n.t('{entity}不能为空', {
        entity: i18n.t('比对阈值')
      }),
      trigger: 'blur'
    },
    {
      validator: ThreshhodRegion(),
      trigger: 'blur'
    }]
  },
  total
};
export default rules;
