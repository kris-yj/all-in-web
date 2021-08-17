<template>
  <meg-form
    ref="addForm"
    label-position="top"
    :rules="rules"
    :label-width="'110px'"
    class="search-form"
    :class="{
      'horizontal': type === 1,
      'left-form-content': type === 2
    }">
    <template v-if="type === 2">
      <meg-form-item
        class="monitor-type"
        prop="cameraType"
        label="卡口类型">
        <meg-radio-group
          v-model="monitoringType"
          @change="handleRadioChange">
          <meg-radio
            v-for="item in monitoringTypeList"
            :key="item.code"
            :label="item.code">
            {{ item.value }}
          </meg-radio>
        </meg-radio-group>
      </meg-form-item>
    </template>
    <div class="form-left">
      <meg-form-item
        v-if="type === 1"
        :label="$t('相机名称')">
        <div
          class="camera-wrap">
          <span class="camera-name">{{ taskForm.cameraName }}</span>
          <span class="camera-play">
            <meg-icon
              @click="showPlayer = true;showRoi = false;"
              style="margin-right: 6px;"
              name="full_play"
              width="16"
              height="16"
              color="#21539b">
            </meg-icon>
            <meg-icon
              @click="showPlayer = true;showRoi = true;"
              name="setting_roi"
              color="#21539b"
              height="16"
              width="16"></meg-icon>
          </span>
        </div>
      </meg-form-item>
      <meg-form-item
        :label="$t('解析类型')"
        prop="analysisType">
        <analysis-type
          :type="type"
          :form-type="formType"
          :analysis-type-arr="analysisTypeArr"
          v-model="taskForm.analysisType"></analysis-type>
      </meg-form-item>
    </div>
    <div class="form-right">
      <meg-form-item
        label="选择相机"
        prop="cameraId">
        <slot name="select-camera"></slot>
      </meg-form-item>
      <meg-form-item
        :label="$t('解析时间')"
        prop="scheduleType">
        <meg-radio-group v-model="taskForm.scheduleType">
          <meg-radio :label="0">
            {{ $t('长期有效') }}
          </meg-radio>
          <meg-radio :label="1">
            {{ $t('循环设置') }}
          </meg-radio>
        </meg-radio-group>
      </meg-form-item>
      <!-- 起止时间 -->
      <meg-form-item
        v-if="taskForm.scheduleType"
        :label="$t('有效时间')"
        prop="time">
        <meg-date-picker
          popper-class="analysis-form-date"
          v-model="taskForm.time"
          type="daterange"
          :picker-options="rangeTimeOptions"
          format="yyyy-MM-dd"
          :prefix-icon-visible="false"
          :range-separator="$t('至')"
          :start-placeholder="$t('开始时间')"
          :end-placeholder="$t('结束时间')"
          @change="getDateValue">
        </meg-date-picker>
      </meg-form-item>
      <meg-form-item
        v-if="taskForm.scheduleType"
        :label="$t('循环每周')"
        prop="includeDays">
        <meg-checkbox-group
          v-model="taskForm.includeDays"
          size="medium">
          <meg-checkbox-button
            v-for="(item, index) in weekArr"
            :label="index"
            :key="index">
            {{ item }}
          </meg-checkbox-button>
        </meg-checkbox-group>
      </meg-form-item>
      <meg-form-item
        v-if="taskForm.scheduleType"
        :label="$t('循环时间段')"
        required>
        <div
          class="times-item">
          <meg-col :span="6">
            <meg-form-item
              prop="startHour">
              <meg-time-select
                popper-class="analysis-form-date"
                :prefix-icon-visible="false"
                :placeholder="$t('请选择')"
                v-model="taskForm.startHour"
                :picker-options="{
                  start: '00:00',
                  step: '01:00',
                  end: '23:00',
                  maxTime: taskForm.endHour
                }">
              </meg-time-select>
            </meg-form-item>
          </meg-col>
          <meg-col
            class="line"
            :span="2"
            style="text-align:center;">
            至
          </meg-col>
          <meg-col :span="6">
            <meg-form-item
              prop="endHour">
              <meg-time-select
                popper-class="analysis-form-date"
                :prefix-icon-visible="false"
                :placeholder="$t('请选择')"
                v-model="taskForm.endHour"
                :picker-options="{
                  start: '01:00',
                  step: '01:00',
                  end: '24:00',
                  minTime: taskForm.startHour
                }">
              </meg-time-select>
            </meg-form-item>
          </meg-col>
        </div>
      </meg-form-item>
    </div>
    <analysis-player
      v-if="showPlayer"
      :show-roi="showRoi"
      :task-data="taskForm"
      :init-roi-value="taskForm.recognitionArea"
      @roi-data="getRoiData"
      v-model="showPlayer"></analysis-player>
  </meg-form>
</template>
<script>
import _ from 'lodash';
import commonMapList from '@/utils/data-map.utils';
import AnalysisType from '@/components/analysis/analysis-type';
import AnalysisPlayer from '@/components/analysis/analysis-player';
import { editTaskRules, addTaskRules } from '../realtime.rule';

export default {
  name: 'TaskForm',
  components: {
    AnalysisType,
    AnalysisPlayer
  },
  props: {
    type: {
      type: Number,
      default: 1 // 1，编辑；2，新建
    },
    taskData: {
      type: Object,
      default: () => ({})
    },
    formType: {
      type: String,
      default: 'add'
    },
    camerasCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    this.rules = this.type === 1 ? editTaskRules : addTaskRules;
    const defaultMonitorType = this.$store.getters.systemByType('analysisBayonetDefaultType').value;
    const supportMotorOrNonmotor = window.config.globalConfig.clientAppId === 'bigdata-web';
    const { analysisTypeArr } = commonMapList;
    if (supportMotorOrNonmotor) {
      const supportBody = this.$store.getters.systemByType('body_enable').value === '1';
      const regex = /\u{975e}?\u{673a}\u{52a8}\u{8f66}/gu; // 机动车非机动车
      Object.entries(analysisTypeArr).forEach(([key, value]) => {
        const filterValue = value.filter((item) => {
          regex.lastIndex = 0;
          return !regex.test(item.label);
        });
        if (filterValue.length > 0) {
          analysisTypeArr[key] = filterValue;
        } else {
          delete analysisTypeArr[key];
        }
      });
      if (!supportBody) {
        Object.entries(analysisTypeArr).forEach(([key, value]) => {
          const filterValue = value.filter((item) => {
            regex.lastIndex = 0;
            return !/人体/.test(item.label);
          });
          if (filterValue.length > 0) {
            analysisTypeArr[key] = filterValue;
          } else {
            delete analysisTypeArr[key];
          }
        });
      }
    }
    // 卡口类型对象
    return {
      count: 1,
      socketUrl: '',
      showRoi: true,
      showPlayer: false,
      supportMotorOrNonmotor,
      analysisTypes: analysisTypeArr,
      analysisTypeArr: analysisTypeArr[defaultMonitorType],
      weekArr: ['日', '一', '二', '三', '四', '五', '六'],
      monitoringType: defaultMonitorType,
      taskForm: {},
      taskForm2: {},
      taskForm3: {},
      taskForm4: {},
      taskForm5: {},
      form: {
        recognitionArea: null,
        analysisType: null,
        time: [],
        scheduleType: 0, // 0-长期任务 1-周期任务
        includeDays: [],
        startHour: '',
        endHour: '',
        sourceType: 1 // 数据来源：1-本地创建；2-双网同步
      }
    };
  },
  computed: {
    // 卡口类型
    monitoringTypeList() {
      let list = this.$store.getters.dataMapByType('kunlun_analysis_bayonet_type') || [];
      if (this.supportMotorOrNonmotor) {
        list = list.filter((item) => item.code.toString() !== '4');
      }
      return list;
    },
    rangeTimeOptions() {
      const $this = this;
      return {
        disabledDate(time, which) {
          if (which === 'left') {
            const d = new Date();
            return time.getTime() < new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
          }
          const d = ($this.form.time || [])[0] || new Date();
          return time.getTime() < new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        }
      };
    }
  },
  watch: {
    taskData: {
      immediate: true,
      handler(v) {
        const { type } = this;

        if (type === 1 && Object.keys(v).length) {
          // 编辑
          const taskData = _.cloneDeep(v);
          this.analysisTypeArr = this.analysisTypes[taskData.monitoringType] || [];
          const {
            startTime,
            endTime,
            doBody,
            doFace,
            doMotor,
            doNonMotor
          } = taskData;
          if (startTime && endTime) {
            taskData.time = [new Date(startTime), new Date(endTime)];
          } else {
            taskData.time = [];
          }
          const analysisType = {
            doFace,
            doBody,
            doMotor,
            doNonMotor
          };
          let id = 0;
          this.analysisTypeArr.forEach((item) => {
            if (item.val) {
              const match = Object.keys(item.val).every((key) => item.val[key] === analysisType[key]);
              if (match) {
                id = item.id;
              }
            }
          });
          taskData.analysisType = id;
          if (taskData.scheduleType === 0 || !taskData.includeDays) {
            taskData.includeDays = [];
          }
          taskData.includeDays = taskData.includeDays.map((item) => Number(item) - 1);
          this.taskForm = taskData;
        }
        if (type === 2) {
          console.log('vvvvv', v);
          if (this.formType === 'copy') {
            const taskData = _.cloneDeep(v);
            this.monitoringType = taskData.monitoringType.toString();
            const datas = this.analysisTypes[this.monitoringType];
            this.analysisTypeArr = datas;
            const {
              startTime,
              endTime,
              doBody,
              doFace,
              doMotor,
              doNonMotor
            } = taskData;
            const analysisType = {
              doFace,
              doBody,
              doMotor,
              doNonMotor
            };
            if (startTime && endTime) {
              taskData.time = [new Date(startTime), new Date(endTime)];
            } else {
              taskData.time = [];
            }
            let id = 0;
            datas.forEach((item) => {
              if (item.val) {
                const match = Object.keys(item.val).every((key) => item.val[key] === analysisType[key]);
                if (match) {
                  console.log('id', item.id);
                  id = item.id;
                }
              }
            });
            taskData.analysisType = id;
            if (taskData.scheduleType === 0) {
              taskData.includeDays = [];
            }
            if (taskData.includeDays && taskData.includeDays.length) {
              taskData.includeDays = taskData.includeDays.map((item) => Number(item) - 1);
            }
            if (!taskData.scheduleType) {
              taskData.scheduleType = 0;
            }
            this.taskForm = taskData;
          } else {
            // 新建
            this.taskForm = this.form;
          }
        }
      }
    }
  },
  methods: {
    plus() {
      if (this.count < 5) {
        this.count += 1;
      }
    },
    minus() {
      if (this.count > 1) {
        this.count -= 1;
      }
    },
    getRoiData(data) {
      this.taskForm.recognitionArea = data;
      this.form.recognitionArea = data;
    },
    handleRadioChange(v) {
      const analysisType = this.supportMotorOrNonmotor && v.toString() === '3' ? '5' : v;
      this.analysisTypeArr = this.analysisTypes[analysisType];
      this.$emit('monitoring-type-change', v);
    },
    getDateValue(date) {
      if (date && date.length) {
        this.form.time = date;
      } else {
        this.form.time = [];
      }
    }
  },
};
</script>
<style lang="scss">
.analysis-form-date {
  z-index: 20000!important;
}
</style>
<style lang="scss" scoped>
.left-form-content {
  position: absolute;
  left: 0;
  top: 55px;
  width: 400px;
  bottom: 0;
  padding-top: 20px;
  overflow: auto;
  padding-left: 25px;
  box-sizing: border-box;
  z-index: 123;
  background: #fff;
  .meg-input__inner {
    width: 345px;
  }
}
.search-form {
  .monitor-type {
    margin-bottom: 10px;
    .meg-radio {
      margin-bottom: 10px;
    }
  }
  &.horizontal {
    .form-left {
      display: inline-block;
      margin-right: 40px;
      width: 515px;
      vertical-align: top;
      .camera-name {
        margin-right: 5px;
      }
    }
    .form-right {
      display: inline-block;
      width: 365px;
    }
  }
  v::deep .meg-form-item__label{
    padding-right: 30px;
  }
  v::deep .meg-checkbox-button .meg-checkbox-button__inner {
    padding: 10px 0;
    width: 39px;
  }
  v::deep .meg-col-6{
    width: 120px;
  }
  v::deep .meg-col-6{
    width: 120px;
  }
  v::deep .meg-col-2{
    width: 34px;
  }
  .times-item {
    height: 35px;
    margin-bottom: 10px;
    .meg-col-6+.meg-icon,.meg-col-6+.plus-icon {
      margin-left: 15px;
    }
  }
  .plus-icon {
    width: 20px;
    height: 20px;
    margin-right: 5px;
    border-radius: 50%;
    cursor: pointer;
    background: #99bc6f;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
  }
}
</style>
