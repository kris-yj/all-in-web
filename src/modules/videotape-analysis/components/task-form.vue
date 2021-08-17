<template>
  <meg-form
    ref="addForm"
    :label-width="'110px'"
    :rules="rules"
    class="search-form left-form-content">
    <meg-form-item
      prop="taskName"
      label="任务名称">
      <meg-input
        style="width:270px"
        v-model="form.taskName"
        clearable
        placeholder="请输入任务名称"></meg-input>
    </meg-form-item>
    <meg-form-item
      prop="time"
      :label="$t('起止时间')">
      <meg-date-picker
        style="width:270px"
        :prefix-icon-visible="false"
        type="datetimerange"
        @change="getDateValue"
        format="yyyy-MM-dd HH:mm"
        v-model="form.time"
        :start-placeholder="$t('开始时间')"
        :end-placeholder="$t('结束时间')"
        :range-separator="$t('至')"
        :picker-options="rangeTimeOptions">
      </meg-date-picker>
    </meg-form-item>
    <meg-form-item
      :label="$t('解析类型')"
      prop="analysisType"
      class="analysis-types-cont">
      <analysis-type
        :type="formType === 'add' ? 2 : 1"
        :analysis-type-arr="analysisTypeArr"
        v-model="form.analysisType"></analysis-type>
    </meg-form-item>
    <meg-form-item
      label="选择相机"
      class="analysis-types-cont inline-select-cameras">
      <slot name="select-camera"></slot>
    </meg-form-item>
    <meg-form-item
      prop="speed"
      label="解析倍速">
      <div>
        <meg-input
          v-model="form.speed"
          style="width:100px"></meg-input>
        <span class="calc-text">预估剩余算力/总算力:{{ monitorInfo.remainVideoPower }}/{{ monitorInfo.totalVideoPower }}</span>
      </div>
    </meg-form-item>
    <meg-form-item
      label="优先级">
      <meg-radio-group
        v-model="form.priority">
        <meg-radio :label="1">
          一般任务
        </meg-radio>
        <meg-radio :label="0">
          紧急任务
        </meg-radio>
      </meg-radio-group>
    </meg-form-item>
    <meg-form-item
      prop="autoCompare"
      label="自动比对">
      <div>
        <meg-switch
          @change="changeComparable"
          v-model="autoCompare"></meg-switch>
        <span class="calc-text">分析结果与底库进行比对，并产生报警</span>
      </div>
    </meg-form-item>
    <template v-if="autoCompare">
      <meg-form-item
        class="compre-sets"
        v-show="analysisTypes.doFace"
        :label="$t('人像库')"
        prop="compareFaceSets">
        <analysis-album-select
          ref="compareFaceSets"
          :album-type="1"
          :placeholder="$t('请选择人像库')"
          :album-data="faceSets"
          :default-threshold="alarmDeplyThreshold"
          :init-data="initData.compareFaceSets"
          @check-change="checkChange(...arguments, 'compareFaceSets')"></analysis-album-select>
      </meg-form-item>
      <meg-form-item
        class="compre-sets"
        v-show="analysisTypes.doBody"
        :label="$t('人体库')"
        prop="compareBodySets">
        <analysis-album-select
          ref="compareBodySets"
          :album-type="2"
          :placeholder="$t('请选择人体库')"
          :album-data="bodySets"
          :default-threshold="bodyThreshold"
          :init-data="initData.compareBodySets"
          @check-change="checkChange(...arguments, 'compareBodySets')"></analysis-album-select>
      </meg-form-item>
      <meg-form-item
        class="compre-sets"
        v-show="analysisTypes.doMotor"
        :label="$t('机动车库')"
        prop="compareMotorSets">
        <analysis-album-select
          ref="compareMotorSets"
          :album-type="3"
          :placeholder="$t('请选择机动车库')"
          :album-data="motorSets"
          :default-threshold="motorThreshold"
          :init-data="initData.compareMotorSets"
          @check-change="checkChange(...arguments, 'compareMotorSets')"></analysis-album-select>
      </meg-form-item>
      <meg-form-item
        class="compre-sets"
        v-show="analysisTypes.doNonMotor"
        :label="$t('非机动车库')"
        prop="compareNonMotorSets">
        <analysis-album-select
          ref="compareNonMotorSets"
          :album-type="4"
          :placeholder="$t('请选择非机动车库')"
          :album-data="nonMotorSets"
          :default-threshold="nonmotorThreshold"
          :init-data="initData.compareNonMotorSets"
          @check-change="checkChange(...arguments, 'compareNonMotorSets')"></analysis-album-select>
      </meg-form-item>
      <meg-form-item
        class="compre-sets"
        v-show="analysisTypes.doMotor"
        :label="$t('机动车车牌库')"
        prop="compareMotorLicenseSets">
        <analysis-album-select
          ref="compareMotorLicenseSets"
          is-license
          :album-type="5"
          :placeholder="$t('请选择机动车车牌库')"
          :album-data="motorLicenseSets.motor"
          :init-data="initData.compareMotorLicenseSets"
          @check-change="checkChange(...arguments, 'compareMotorLicenseSets')"></analysis-album-select>
      </meg-form-item>
      <meg-form-item
        class="compre-sets"
        v-show="analysisTypes.doNonMotor"
        :label="$t('非机动车车牌库')"
        prop="compareNonMotorLicenseSets">
        <analysis-album-select
          ref="compareNonMotorLicenseSets"
          is-license
          :album-type="6"
          :placeholder="$t('请选择非机动车车牌库')"
          :album-data="motorLicenseSets.nonMotor"
          :init-data="initData.compareNonMotorLicenseSets"
          @check-change="checkChange(...arguments, 'compareNonMotorLicenseSets')"></analysis-album-select>
      </meg-form-item>
    </template>
  </meg-form>
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import AnalysisType from '@/components/analysis/analysis-type';
import AnalysisAlbumSelect from '@/components/analysis/analysis-album-select';
import commonMapList from '@/utils/data-map.utils';

function pickArray(arr = []) {
  if (!arr.length) {
    return [];
  }
  console.log('arr', arr);
  arr.forEach((item) => {
    if (!item.id && item.albumId) {
      item.id = item.albumId;
    }
  });
  const keys = ['id', 'albumType', 'threshold'];
  return arr.map((item) => _.pick(item, keys));
}

export default {
  components: {
    AnalysisType,
    AnalysisAlbumSelect
  },
  props: {
    albums: {
      type: Object,
      default: () => ({})
    },
    monitorInfo: {
      type: Object,
      default: () => ({})
    },
    initData: {
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
    const { currentModule } = this.$store.state;
    const id = Math.random().toString(16).slice(2, 7);
    const defaultName = `${currentModule.alias}-${moment().format('YYYYMMDD')}-${id}`;
    return {
      analysisTypeArr: commonMapList.analysisTypeArr[2].slice(0, -2),
      albumData: {},
      autoCompare: false,
      form: {
        analysisType: null,
        taskName: defaultName,
        time: [],
        speed: '',
        autoCompare: 0,
        priority: 1, // 0 高优先级 1 一般优先级
      },
      rules: {
        taskName: {
          required: true,
          validator() {
            return true;
          }
        },
        time: {
          required: true,
          validator() {
            return true;
          }
        },
        analysisType: {
          required: true,
          validator() {
            return true;
          }
        },
        speed: {
          required: true,
          validator() {
            return true;
          }
        },
        cameraId: {
          required: true,
          validator() {
            return true;
          }
        }
      }
    };
  },
  computed: {
    rangeTimeOptions() {
      return {
        disabledDate(time) {
          const d = new Date();
          return time.getTime() > d.getTime();
        }
      };
    },
    bodyThreshold() {
      return parseFloat(this.$store.getters.systemByType('kunlun_body_identify_threshold').value);
    },
    motorThreshold() {
      return parseFloat(this.$store.getters.systemByType('kunlun_motor_identify_threshold').value);
    },
    nonmotorThreshold() {
      return parseFloat(this.$store.getters.systemByType('kunlun_non_motor_identify_threshold').value);
    },
    alarmDeplyThreshold() {
      return parseFloat(this.$store.getters.systemByType('kunlun_alarm_deployment_recommend_threshold').value);
    },
    analysisTypes() {
      let analysisTypes = {};
      this.analysisTypeArr.forEach((item) => {
        if (item.id === this.form.analysisType) {
          analysisTypes = item.val;
        }
      });
      return analysisTypes;
    },
    /**
     * 人像库
     */
    faceSets() {
      return this.albums[1];
    },
    /**
     * 人体库
     */
    bodySets() {
      return this.albums[2];
    },
    /**
     * 机动车库
     */
    motorSets() {
      return this.albums[3];
    },
    /**
     * 非机动车库
     */
    nonMotorSets() {
      return this.albums[5];
    },
    /**
     * 机动车车牌库
     * carType 1机动车、2非机动车
     */
    motorLicenseSets() {
      const licenseSets = this.albums[4];
      const motor = [];
      const nonMotor = [];
      if (licenseSets && licenseSets.length) {
        licenseSets.forEach((item) => {
          if (item.carType === '1') {
            motor.push(item);
          } else {
            nonMotor.push(item);
          }
        });
      }
      return {
        motor,
        nonMotor
      };
    },
  },
  watch: {
    monitorInfo(val) {
      const { remainVideoPower = 0 } = val;
      if (remainVideoPower > 0) {
        this.form.speed = Math.ceil(remainVideoPower / 2);
      }
    },
    initData: {
      immediate: true,
      handler(data) {
        console.log('data', data);
        data = JSON.parse(JSON.stringify(data || {}));
        if (this.formType === 'copy' && data) {
          const {
            startTime,
            endTime,
            doBody,
            doFace,
            doMotor,
            doNonMotor
          } = data;
          if (startTime && endTime) {
            data.time = [new Date(+startTime), new Date(+endTime)];
          } else {
            data.time = [];
          }
          const analysisType = {
            doFace: +doFace,
            doBody: +doBody,
            doMotor: +doMotor,
            doNonMotor: +doNonMotor
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
          data.analysisType = id;
          data.priority = data.priority === undefined ? 1 : +data.priority;
          this.autoCompare = Boolean(data.autoCompare);
          data.autoCompare = this.autoCompare ? 1 : 0;
          this.form = data;
        }
      }
    }
  },
  methods: {
    chosedAlbums() {
      let datas = [];
      const {
        compareFaceSets,
        compareBodySets,
        compareMotorSets,
        compareNonMotorSets,
        compareNonMotorLicenseSets,
        compareMotorLicenseSets
      } = this.$refs;
      if (compareFaceSets) {
        datas = [...datas, ...pickArray(compareFaceSets.chosedAlbums)];
      }
      if (compareBodySets) {
        datas = [...datas, ...pickArray(compareBodySets.chosedAlbums)];
      }
      if (compareMotorSets) {
        datas = [...datas, ...pickArray(compareMotorSets.chosedAlbums)];
      }
      if (compareNonMotorSets) {
        datas = [...datas, ...pickArray(compareNonMotorSets.chosedAlbums)];
      }
      if (compareNonMotorLicenseSets) {
        datas = [...datas, ...pickArray(compareNonMotorLicenseSets.chosedAlbums)];
      }
      if (compareMotorLicenseSets) {
        datas = [...datas, ...pickArray(compareMotorLicenseSets.chosedAlbums)];
      }
      return datas;
    },
    changeComparable(v) {
      this.form.autoCompare = v ? 1 : 0;
    },
    getDateValue(date) {
      if (date && date.length) {
        this.form.time = date;
      }
    }
  },
};
</script>
<style lang="scss" scoped>
.left-form-content {
  position: absolute;
  left: 0;
  top: 55px;
  width: 415px;
  bottom: 0;
  padding-top: 20px;
  overflow: auto;
  padding-left: 10px;
  box-sizing: border-box;
  z-index: 123;
  background: #fff;
  .meg-input__inner {
    width: 345px;
  }
}
.search-form {
  &.horizontal {
    .form-left {
      display: inline-block;
      margin-right: 40px;
      width: 515px;
      vertical-align: top;
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
  .calc-text {
    opacity: 0.5;
    font-size: 12px;
    color: #435068;
    margin-left: 10px;
  }
  v::deep .meg-form-item__label{
    padding-right: 20px;
  }
  v::deep .meg-checkbox-button .meg-checkbox-button__inner {
    padding: 10px 0;
    width: 39px;
  }
  v::deep .compre-sets.meg-form-item.is-error .meg-input-number .meg-input__inner{
    border-color: #bec2ca;
  }
  v::deep .compre-sets.meg-form-item.is-error .meg-treeselect{
    border-color: #f05353;
  }
  v::deep .meg-input-number{
    width: 100%;
  }
  .speed-info{
    margin-left: 11px
  }
  .form-item-inner{
    .analysis-speed{
      width: 270px;
    }
    .analysis-type-item{
      border-bottom: 1px solid #f3f3f3;
      padding: 14px 10px;
      line-height: 1;
      .title{
        position: relative;
        margin-bottom: 8px;
        .type-wrap{
          position: absolute;
          right: 0;
          top: 0;
        }
        .type{
          display: inline-block;
          opacity: 0.5;
        }
        .type-icon{
          width: 24px;
        }
      }
      .msg{
        margin-left: 28px;
        color: #999;
        font-size: 12px;
      }
    }
    .analysis-type-item:nth-child(2n-1) {
      background: #f9f9f9;
    }
  }
}
</style>
<style lang="scss">
.analysis-types-cont {
  margin-left: 19px;
  &.inline-select-cameras {
    display: flex;
    margin-left: 0;
  }
  .meg-form-item__label {
    float: none;
  }
  .meg-form-item__content {
    margin-left: 0!important;
  }
}
</style>
