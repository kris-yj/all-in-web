<template>
  <meg-dialog
    class="region__new"
    :visible="visible"
    v-if="visible"
    :fullscreen="true"
    :show-close="false"
    @confirm="onDialogConfirm">
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
            {{ $t('保存') }}
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
            class="form-left"
            label-position="top"
            label-width="83px"
            :model="taskForm"
            :rules="taskRule">
            <div class="task__top">
              <div class="form-title">
                基本信息
              </div>
              <meg-form-item
                :label="$t('任务名称')"
                prop="jobName">
                <meg-input
                  :disabled="disiabled"
                  v-model.trim="taskForm.jobName"
                  :placeholder="$t('请输入{from}-{to}个汉字，字母，数字', { from: 2, to: 50})">
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
                <span style="font-size:10px;color:#869ABB">  ({{ $t('输入范围：') }}{{ regionThreshold.min }}-100)</span>
              </meg-form-item>
              <meg-form-item
                label="选择相机"
                required>
                <camera-select-region
                  ref="cameraFirst"
                  @cameraChoosed="cameraChoosed"
                  :default-select-array="defaultSelectArrayAll"
                  :camera-list="cameraList"
                  @onDeptCameraTreeUpdateReady="onDeptCameraTreeUpdateReady">
                </camera-select-region>
                <div
                  v-show="cameraNum"
                  class="form-item__error">
                  {{ $t('相机不能为空') }}
                </div>
              </meg-form-item>
            </div>
            <div class="task__center__new">
              <div class="date-box">
                选择时间
              </div>
              <div
                v-for="(timeItem, index) of defaultDate"
                :key="index"
                @click="chooseBox(index)"
                :class="['choose-time']">
                <div class="choose-title">
                  {{ '时间' + (index + 1) }}
                </div>
                <div class="choose-item">
                  <meg-date-picker
                    class="date-picker"
                    :ref="'datePicker'+index"
                    v-model="defaultDate[index]"
                    type="datetimerange"
                    format="yyyy-MM-dd HH:mm"
                    :default-time="['00:00:00','23:59:59']"
                    :prefix-icon-visible="false"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :picker-options="pickerOptions">
                  </meg-date-picker>
                  <div
                    class="del-icon"
                    @click="delChoose(index)">
                    <meg-icon
                      name="close_hover"
                      :color="isShowDelButton ? '#21539b' : '#ccc'"></meg-icon>
                  </div>
                </div>
              </div>
              <div
                class="add-button-box"
                v-if="isShowAddButton">
                <div
                  @click="addChoose"
                  class="add-button">
                  <meg-icon name="plus"></meg-icon>
                  {{ `新建时间（${defaultDate.length}/5）` }}
                </div>
              </div>
            </div>
          </meg-form>
          <div class="region__map">
            <area-selector-map
              ref="mapSelectorDate"
              :active-feature="taskForm.timeRegions.cameraIds"
              :default-feature="taskForm.timeRegions.regionLocation"
              @draw-change="onAddArea"
              @select-change="onMapSelectChanged"></area-selector-map>
          </div>
        </div>
      </div>
    </div>
  </meg-dialog>
</template>
<script>
// import _ from 'lodash';
import AreaSelectorMap from '@/common-components/common-maps/area-selector-map';
import cameraSelectRegion from '@/components/judge/judge-camera-select';
import rule from '@/modules/common/judge.rule';

const TaskForm = function (threshold) {
  this.jobName = '';
  this.jobType = '1';
  this.threshold = threshold;
  this.timeRegions = {};
  this.timeRegions.times = [];
  this.timeRegions.cameraIds = [];
  this.timeRegions.regionLocation = '';
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
    operateType: {
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
    }
  },
  data() {
    return {
      pickerOptions: {
        shortcuts: [
          'today',
          'pastThreeDays',
          'pastWeek',
          'pastMonth'
        ]
      },
      defaultDate: [
        [],
        []
      ],
      chooseActive: -1,
      taskForm: new TaskForm(this.regionThreshold.thresholdNum),
      taskRule: rule.regionDate,
      defaultSelectArray: [],
      // 地图需要的相机列表
      selectCameraIds: [],
      cameraNum: false,
      defaultSelectArrayAll: [],
      timeError: false,
    };
  },
  computed: {
    /**
     * 查看模式下，只读
     */
    disiabled() {
      return this.operateType === 'check';
    },
    isShowAddButton() {
      return this.defaultDate.length <= 4;
    },
    isShowDelButton() {
      return this.defaultDate.length > 2;
    },
    dialogName() {
      return (this.visible && this.operateType === 'add') ? this.$t('新建时间碰撞任务') : this.$t('复制时间碰撞任务');
    }
  },

  watch: {
    visible: {
      handler() {
        if (this.visible && this.operateType === 'add') {
          this.chooseReset();
        }
        if (!this.visible) {
          this.defaultDate = [[], []];
          this.chooseActive = -1;
        }
      }
    },
    formData() {
      if (this.visible && this.operateType === 'copy') {
        this.copyDate();
      } else {
        this.taskForm.threshold = this.regionThreshold.thresholdNum;
      }
      if (this.$refs.task) {
        this.$refs.task.resetFields();
      }
    },
  },
  created() {
    this.selectCameraIds = this.taskForm.timeRegions.cameraIds;
  },
  methods: {
    /**
     * 新建时间碰撞初始化数据
     */
    chooseReset() {
      this.cameraNum = false;
      this.taskForm = new TaskForm(this.regionThreshold.thresholdNum);
      this.defaultSelectArrayAll = [];
      this.taskForm.timeRegions.cameraIds = [];
      this.taskForm.timeRegions.regionLocation = '';
      this.$nextTick(() => {
        this.$refs.mapSelectorDate.setDrawType('');
      });
    },
    copyDate() {
      this.cameraNum = false;
      this.taskForm = {
        jobType: this.formData.jobType,
        jobName: this.formData.jobName,
        threshold: this.formData.threshold,
        timeRegions: this.formData.timeRegions
      };
      if (this.formData.timeRegions) {
        this.formData.timeRegions.times.forEach((item, ind) => {
          this.defaultDate[ind] = [new Date(item.beginTime), new Date(item.endTime)];
        });
      }
      this.$nextTick(() => {
        this.$refs.cameraFirst.setTreeChecked(this.formData.timeRegions.cameraIds);
        this.$refs.mapSelectorDate.setDrawType('');
      });
      this.defaultSelectArrayAll = this.formData.timeRegions.cameraIds;
    },
    /**
     * 接受地图坐标信息
     * @param {areaInfo} 坐标信息
     */
    onAddArea(areaInfo) {
      this.taskForm.timeRegions.regionLocation = areaInfo;
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
        this.defaultSelectArrayAll = this.defaultSelectArrayAll.slice(0, 40);
        this.$message({
          type: 'warning',
          message: this.$t('摄像机选择上限40个，已为您选择前40个摄像机'),
        });
      }
      this.$refs.cameraFirst.setTreeChecked(this.defaultSelectArrayAll);
      if (this.defaultSelectArrayAll.length !== 0) {
        this.cameraNum = false;
      }
      this.taskForm.timeRegions.cameraIds = this.defaultSelectArrayAll;
      if (this.$refs.mapSelectorDate) {
        this.$refs.mapSelectorDate.selectFeatures(this.taskForm.timeRegions.cameraIds);
      }
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

      this.taskForm.timeRegions.cameraIds = arr;
      this.$refs.mapSelectorDate.selectFeatures(arr);
    },
    onDeptCameraTreeUpdateReady(dataMap) {
      const cameraDataForMap = dataMap.filter((item) => item.flag === 'camera');
      if (this.$refs.mapSelectorDate) this.$refs.mapSelectorDate.setFeatures(cameraDataForMap);
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
    getDateValue() {
      this.timeError = false;
      const arr = this.defaultDate.filter((val) => val && val.length > 0);
      if (arr.length >= 2) {
        arr.forEach((item, ind) => {
          if (!this.taskForm.timeRegions.times[ind]) {
            this.taskForm.timeRegions.times[ind] = {
              beginTime: 0,
              endTime: 0
            };
          }
          if (item.length > 0) {
            this.taskForm.timeRegions.times[ind].beginTime = item[0].getTime();
            this.taskForm.timeRegions.times[ind].endTime = item[1].getTime();
          }
        });
      } else {
        this.$message.error('至少填些两个时间段');
        this.timeError = true;
      }
    },
    onDialogConfirm() {
      this.getDateValue();
      if (this.timeError) return;
      // 在提交数据的情况下，由父组件控制是否关闭弹窗
      if (this.operateType !== 'check') {
        this.$refs.task.validate((valid) => {
          if (valid) {
            if (this.taskForm.timeRegions.cameraIds.length === 0) {
              this.cameraNum = true;
            } else {
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
    chooseBox(ind) {
      this.chooseActive = ind;
    },
    addChoose() {
      this.defaultDate.push([]);
    },
    delChoose(ind) {
      if (!this.isShowDelButton) return;
      this.defaultDate.splice(ind, 1);
    },
  }
};
</script>
<style lang="scss" scoped>
.region__new ::v-deep .meg-dialog .meg-dialog__body {
  height: calc(100% - 56px);
  padding: 0px;
}
.list-box {
  height: calc(100% - 76px);
  padding: 20px 20px 0  20px;
}
.region__list {
  height: 100%;
  background-color: #eee;
  box-shadow: 1px 3px 1px rgba(0, 0, 0, 0.1);
  display: flex;
}
.region__new {
  .region__content {
    width: 100%;
    height: 100%;
  }
  .choose-time {
    margin-left: 15px;
    .choose-title {
      white-space:nowrap;
      font-family: MicrosoftYaHei;
      font-size: 14px;
      color: #000000;
      font-weight: 400;
      height: 30px;
      line-height: 30px;
    }
    .date-picker {
      width:270px;
      height: 34px;
      margin: 5px;
    }
    .choose-item {
      display: flex;
      align-items: center;
    }
  }
  .region__title {
    display: flex;
    justify-content: space-between;
    height: 55px;
    border-bottom: 1px solid #d6d9e1;
    align-items: center;
    padding: 0 20px;
    box-shadow: 0 2px 6px 0 rgba(0,0,0,0.12);;
  }

  .task__top {
    padding: 15px;
    background: #fff;
    border-bottom: 1px solid #d6d9e1;
  }
  .form-title {
    height: 35px;
    line-height: 35px;
    font-size: 16px;
    font-weight: 800;
  }
  .date-box {
    border-bottom: 1px solid #D6D9E1;
    border-top: 1px solid #D6D9E1;
    height: 44px;
    line-height: 44px;
    padding-left: 15px;
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;
    color: #435068;
    font-weight: 500;
  }
  .form-item__error{
    color: #f05353;
    font-size: 12px;
    line-height: 1;
    padding-top: 4px;
    position: absolute;
    top: 100%;
    left: 0;
  }
  .task__center__new {
    background: #fff;
    margin-top: 20px;
    padding-bottom: 20px
  }
  .region__map {
    flex: 1;
  }
  .similarity {
    width: 140px;
  }
  .form-left {
    width: 320px;
    box-sizing: border-box;
    background-color:  #d6d9e1;
    border: 1px solid #D6D9E1;
    .threshold-form-item {
      .threshold-input {
        width: 150px;
        margin: 0 6px;
      }
    }
  }
  .add-button-box {
    padding: 0 6px;
    cursor: pointer;
    display: flex;
    justify-content: center;
  }
  .add-button {
    height: 48px;
    width: 270px;
    background-color: #fff;
    color: #21539b;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 16px;
    border: 1px dashed #CED2DB;
  }
}

</style>
