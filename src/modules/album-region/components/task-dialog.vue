<template>
  <meg-dialog
    class="region__new album-region-new"
    :visible="visible"
    :fullscreen="true"
    :show-close="false"
    :show-footer="false">
    <div
      class="region__content">
      <div class="region__title">
        <span class="form-title">
          {{ dialogName }}
        </span>
        <div>
          <meg-button
            @click="onDialogConfirm"
            type="primary">
            {{ $t('确定') }}
          </meg-button>
          <meg-button
            @click="onDialogClose"
            type="primary">
            {{ $t('取消') }}
          </meg-button>
        </div>
      </div>
      <div class="list-box">
        <div class="region__list">
          <meg-form
            ref="task"
            class="task-form-left"
            label-position="top"
            label-width="83px"
            :model="taskForm"
            :rules="taskRule">
            <div class="task__top__item">
              <div class="form-title">
                基本信息
              </div>
              <meg-form-item
                :label="$t('任务名称')"
                prop="jobName">
                <meg-input
                  :disabled="disiabled"
                  v-model.trim="taskForm.jobName"
                  :placeholder="$t('请输入{from}-{to}个汉字，字母，数字', { from: 2, to: 50 })">
                </meg-input>
              </meg-form-item>
              <meg-form-item
                class="threshold-form-item"
                :label="$t('比对阈值')"
                prop="threshold">
                <meg-input-number
                  class="similarity"
                  :controls="false"
                  v-model.number="taskForm.threshold">
                </meg-input-number>
                <span style="font-size:10px">({{ $t('输入范围：') }}{{ regionThreshold.min }}-100) </span>
              </meg-form-item>
              <meg-radio-group v-model="taskForm.compareMode">
                <meg-radio label="SEARCH_EQUIVALENT">
                  {{ $t('精度模式') }}
                </meg-radio>
                <meg-radio label="SPEED">
                  {{ $t('速度模式') }}
                </meg-radio>
              </meg-radio-group>
            </div>
            <div class="task__top__item">
              <div
                class="form-title">
                区域
              </div>
              <meg-form-item
                :label="$t('选择区域')"
                prop="jobType">
                <div>
                  <camera-select-region
                    ref="cameraFirst"
                    @cameraChoosed="cameraChoosed"
                    :default-select-array="defaultSelectArrayAll"
                    :camera-list="cameraList"
                    @onDeptCameraTreeUpdateReady="onDeptCameraTreeUpdateReady"></camera-select-region>
                  <div
                    v-show="cameraNum"
                    class="form-item__error">
                    {{ $t('相机不能为空') }}
                  </div>
                </div>
              </meg-form-item>
              <meg-form-item
                :label="$t('选择时间')"
                prop="jobType">
                <div>
                  <meg-date-picker
                    v-model="dateValue"
                    @change="getFirstDateValue"
                    format="yyyy-MM-dd HH:mm"
                    :default-time="['00:00:00','23:59:59']"
                    type="datetimerange"
                    :prefix-icon-visible="false"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :picker-options="pickerOptions">
                  </meg-date-picker>
                  <div
                    v-show="dateFirst"
                    class="form-item__error__date">
                    {{ $t('时间不能为空') }}
                  </div>
                </div>
              </meg-form-item>
            </div>
            <div class="task__top__item">
              <div class="form-title">
                底库
              </div>
              <meg-form-item
                :label="$t('选择底库')"
                prop="jobType">
                <div>
                  <meg-treeselect
                    ref="albumSelect"
                    :search-placeholder="$t('输入底库名进行搜索')"
                    :data="albumTreeSelectorData"
                    :props="{children: 'items', label: 'name'}"
                    :all-selected-text="$t('全部底库')"
                    :show-checkbox="true"
                    :default-checked-all="true"
                    @check-change="albumChange">
                  </meg-treeselect>
                  <div
                    v-if="albumNum"
                    class="form-item__album">
                    {{ $t('底库不能为空') }}
                  </div>
                </div>
              </meg-form-item>
            </div>
          </meg-form>
          <div class="region__map">
            <area-selector-map
              ref="mapSelectorDate"
              :default-feature="taskForm.region.regionLocation"
              @draw-change="onAddArea"
              @select-change="onMapSelectChanged"></area-selector-map>
          </div>
        </div>
      </div>
    </div>
  </meg-dialog>
</template>
<script>
import _ from 'lodash';
import AreaSelectorMap from '@/common-components/common-maps/area-selector-map';
import cameraSelectRegion from '@/components/judge/judge-camera-select';
import Rule from '@/modules/common/judge.rule';

const TaskForm = function () {
  this.jobName = '';
  this.threshold = 80;
  this.region = {};
  this.region.beginTime = '';
  this.region.endTime = '';
  this.region.cameraIds = [];
  this.region.regionLocation = '';
  this.albumIds = [];
  this.jobType = '1';
  this.compareMode = 'SEARCH_EQUIVALENT';
};
export default {
  components: {
    cameraSelectRegion,
    AreaSelectorMap
  },
  props: {
    regionThreshold: {
      type: Object,
      default() {
        return {
          min: 20,
          thresholdNum: 85,
        };
      }
    },
    albumTreeSelectorData: {
      type: Array,
      default() {
        return [];
      }
    },
    taskType: {
      type: String,
      default: 'add'
    },
    visible: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default() {
        return {};
      }
    },
    cameraList: {
      type: Array,
      default() {
        return [];
      }
    },
  },
  data() {
    return {
      dateValue: [],
      pickerOptions: {
        shortcuts: [
          'today',
          'pastThreeDays',
          'pastWeek',
          'pastMonth'
        ]
      },
      albumNum: false,
      dateFirst: false,
      dateSecond: false,
      taskForm: new TaskForm(),
      taskRule: Rule.albumRegion,
      regionColor: false,
      defaultSelectArray: [],
      cameraNum: false,
      defaultSelectArrayAll: [],
    };
  },
  computed: {
    /**
     * 查看模式下，只读
     */
    disiabled() {
      return this.taskType === 'check';
    },
    dialogName() {
      return this.taskType === 'add' ? this.$t('新建区域底库碰撞') : this.$t('复制区域底库碰撞');
    }
  },
  watch: {
    taskType(val) {
      this.regionColor = true;
      if (this.visible && val === 'add') {
        this.chooseReset();
        this.taskForm.threshold = this.regionThreshold.thresholdNum;
      }
    },
    visible() {
      this.$nextTick(() => {
        if (this.$refs.mapSelectorDate) {
          this.$refs.mapSelectorDate.setDrawType('');
        }
      });
    }
  },
  methods: {
    albumChange() {
      this.albumNum = false;
    },
    /**
     * 新建初始化数据
     */
    chooseReset() {
      this.cameraNum = false;
      this.dateFirst = false;
      this.albumNum = false;
      this.dateValue = [];
      this.defaultSelectArrayAll = [];
      this.taskForm.region.cameraIds = [];
      this.$refs.mapSelectorDate.selectFeatures([]);
      this.taskForm.region.regionLocation = '';
    },
    /**
     * 复制初始化
     */
    copyDate() {
      this.taskForm = _.cloneDeep(this.formData);
      if (this.$refs.task) {
        this.$refs.task.resetFields();
      }
      this.cameraNum = false;
      this.dateFirst = false;
      this.dateValue = [this.taskForm.region.beginTime, this.taskForm.region.endTime];
      this.$nextTick(() => {
        if (this.$refs.albumSelect) this.$refs.albumSelect.setCheckedKeys(this.formData.albumIds);
        if (this.$refs.cameraFirst) this.$refs.cameraFirst.setTreeChecked(this.taskForm.region.cameraIds);
      });

      this.defaultSelectArrayAll = this.taskForm.region.cameraIds;
    },
    /**
    /**
     * 接受地图坐标信息
     * @param {areaInfo} 坐标信息
     */
    onAddArea(areaInfo) {
      this.taskForm.region.regionLocation = areaInfo;
    },
    /**
     *
     * 当地图相机改变触发该事件
     * @param {selectCameraList} 返回地图中被选相机
     */
    onMapSelectChanged(ids, checked) {
      const cameraIds = this.defaultSelectArrayAll;
      if (checked) {
        ids.forEach((id) => {
          if (cameraIds.indexOf(id) === -1) cameraIds.push(id);
          else if (cameraIds.indexOf(id) !== -1) cameraIds.splice(cameraIds.indexOf(id), 1);
        });
        this.defaultSelectArrayAll = cameraIds;
      } else {
        this.defaultSelectArrayAll = [];
      }
      if (this.defaultSelectArrayAll.length > 40) {
        cameraIds.splice(0, 40);
        this.$message({
          type: 'warning',
          message: this.$t('摄像机选择上限40个，已为您选择前40个摄像机'),
        });
      }
      if (this.defaultSelectArrayAll.length !== 0) {
        this.cameraNum = false;
      }
      this.$refs.cameraFirst.setTreeChecked(this.defaultSelectArrayAll);
      this.taskForm.region.cameraIds = this.defaultSelectArrayAll;
      this.$refs.mapSelectorDate.selectFeatures(this.defaultSelectArrayAll);
    },
    cameraChoosed(arr) {
      if (arr.length !== 0) {
        this.cameraNum = false;
      }
      if (arr.length > 40) {
        arr = arr.slice(0, 40);
        this.$message({
          type: 'warning',
          message: this.$t('摄像机选择上限40个，已为您选择前40个摄像机'),
        });
        this.$refs.cameraFirst.setTreeChecked(arr);
      }
      this.defaultSelectArrayAll = arr;

      this.taskForm.region.cameraIds = arr;

      this.$refs.mapSelectorDate.selectFeatures(arr);
    },
    onDeptCameraTreeUpdateReady(dataMap) {
      this.$refs.mapSelectorDate.setFeatures(dataMap.filter((item) => item.flag === 'camera'));
    },
    /**
     * 弹窗关闭
     */
    onDialogClose() {
      this.$confirm(this.$t('当前内容已被编辑，如果退出，已编辑信息不再保留'), this.$t('确认放弃编辑'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
      }).then(() => {
        this.$emit('update:visible', false);
      }).catch(() => {
      });
      // if (this.$refs.task) { this.$refs.task.resetFields(); }
    },
    /**
     * 时间过滤函数
     */
    getFirstDateValue() {
      if (this.dateValue.length > 0) {
        let startTime = 0;
        let endTime = 0;
        [startTime, endTime] = this.dateValue;
        this.taskForm.region.beginTime = startTime.getTime();
        this.taskForm.region.endTime = endTime.getTime();
      } else {
        this.taskForm.region.beginTime = '';
        this.taskForm.region.endTime = '';
      }
      if (this.taskForm.region.beginTime) {
        this.dateFirst = false;
      } else {
        this.dateFirst = true;
      }
    },
    /**
     * 提交确定
     */
    onDialogConfirm() {
      this.taskForm.albumIds = this.$refs.albumSelect.getCheckedKeys(null, true);
      // 在提交数据的情况下，由父组件控制是否关闭弹窗
      if (this.taskType !== 'check') {
        this.$refs.task.validate((valid) => {
          if (valid) {
            if (this.taskForm.region.cameraIds.length === 0) {
              this.cameraNum = true;
            } else if (!this.taskForm.region.beginTime) {
              this.dateFirst = true;
            } else if (this.taskForm.albumIds.length === 0) {
              this.albumNum = true;
            } else {
              this.taskForm.jobType = '';
              this.taskForm.region.cameraVos = [];
              this.$emit('taskConfirm', this.taskForm);
            }
          } else {
            return false;
          }
          return false;
        });
      } else {
        this.$emit('update:visible', false);
      }
    },

  }
};
</script>
<style lang="scss" scoped>
.region__new ::v-deep .meg-dialog .meg-dialog__body {
  height: 100%;
  padding: 0px;
}
.region__list {
  width: 100%;
  height: 100%;
  display: flex;
  background-color: rgb(240, 240, 240);
  box-shadow: 1px 3px 1px rgba(0, 0, 0, 0.1);
}
.region__content {
  width: 100%;
  height: 100%;
}
.region__title {
  display: flex;
  justify-content: space-between;
  height: 55px;
  border-bottom: 1px solid #f3f3f3;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 6px 0 rgba(0,0,0,0.12);
}

.region__map {
  flex: 1;
}
.similarity {
  width: 76px;
  .el-input__inner {
    padding: 0;
    text-align: center;
  }
}
.list-box {
  height: calc(100% - 76px);
  padding: 20px 20px 0  20px;
}
.task-form-left {
  width: 320px;
  box-sizing: border-box;
  background-color:  #E5E7ED ;
  border: 1px solid #D6D9E1;
}
.form-item__error {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
  position: absolute;
}
.form-item__album {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
}
.form-item__error__date {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
}
.task__top__item {
  border-bottom:  1px solid #ccc;
  margin-bottom: 20px;
  background: #fff;
  padding: 20px;
}
.form-title{
  height: 35px;
  line-height: 35px;
  font-size: 16px;
  font-weight: 800;
}
</style>
