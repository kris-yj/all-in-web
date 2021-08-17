<template>
  <meg-dialog
    class="region__new"
    :visible="visible"
    width="100%"
    :fullscreen="true"
    :show-close="false">
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
      <meg-form
        ref="task"
        class="task-form-left"
        label-width="83px"
        :model="taskForm"
        :rules="taskRule">
        <meg-form-item
          :label="$t('任务名称')"
          class="left-item"
          prop="jobName">
          <meg-input
            style="width:270px"
            v-model.trim="taskForm.jobName"
            :placeholder="$t('请输入{from}-{to}个汉字，字母，数字', { from: 2, to: 50})">
          </meg-input>
        </meg-form-item>
        <meg-form-item
          class="left-item"
          :label="$t('比对阈值')"
          prop="threshold">
          <meg-input-number
            class="similarity"
            :controls="false"
            v-model.number="taskForm.threshold">
          </meg-input-number>
          <span style="font-size:14px;color:#000000"> ({{ $t('输入范围：') }}{{ regionThreshold.min }}-100)</span>
        </meg-form-item>
      </meg-form>
      <div class="region__list-box">
        <div class="region__list">
          <div class="task__center__new">
            <meg-form
              label-position="top">
              <div
                v-for="(item, index) of defaultData"
                :key="index"
                @click.capture="chooseRegion(index)"
                :class="['region__task__main']">
                <div
                  class="region__first"
                  v-if="activeIndex === index">
                  <div class="region__first__main">
                    <div
                      class="active-title">
                      {{ `区域${index + 1}` }}
                    </div>
                    <div
                      v-if="activeIndex === index">
                      <meg-button
                        @click.stop="resetregion(index)"
                        type="text">
                        {{ $t('重置') }}
                      </meg-button>
                      <meg-button
                        :class="['choose-button', !isShowDelButton ? 'disiabled-button': null]"
                        @click.stop="delRegion(index)"
                        type="text">
                        {{ $t('移除') }}
                      </meg-button>
                    </div>
                  </div>
                  <meg-form-item
                    :label="$t('选择相机')">
                    <camera-select-region
                      ref="cameraOnly"
                      @cameraChoosed="cameraChoosed"
                      :default-select-array="item.cameraIds"
                      :camera-list="cameraList"
                      @onDeptCameraTreeUpdateReady="onDeptCameraTreeUpdateReady"></camera-select-region>
                  </meg-form-item>
                  <meg-form-item
                    :label="$t('选择时间')">
                    <meg-date-picker
                      :ref="'datePicker'+index"
                      v-model="defaultData[index].defaultDate"
                      type="datetimerange"
                      format="yyyy-MM-dd HH:mm"
                      :default-time="['00:00:00','23:59:59']"
                      :prefix-icon-visible="false"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      :picker-options="pickerOptions">
                    </meg-date-picker>
                  </meg-form-item>
                </div>
                <div
                  v-else
                  class="region__second">
                  <div class="second-title">
                    {{ `区域${index + 1}` }}
                  </div>
                  <div>
                    <span class="second-text">选择相机：</span>
                    <span class="second-text">
                      {{ item.cameraIds.length || 0 }}个
                    </span>
                  </div>
                  <div>
                    <span class="second-text">选择时间：</span>
                    <span class="second-text">
                      {{ handlerTime(defaultData[index].defaultDate) }}
                    </span>
                  </div>
                </div>
              </div>
            </meg-form>
            <div class="add-button-box">
              <div
                @click="addChoose"
                v-if="isShowAddButton"
                class="add-button">
                <meg-icon name="plus"></meg-icon>
                {{ `新建区域（${defaultData.length}/5）` }}
              </div>
            </div>
          </div>
          <div class="region__map">
            <area-selector-map
              ref="mapSelector"
              :default-feature="defaultData[activeIndex].regionLocation"
              @draw-change="onAddArea"
              @select-change="onMapSelectChanged"></area-selector-map>
          </div>
        </div>
      </div>
    </div>
  </meg-dialog>
</template>
<script>

import moment from 'moment';
import AreaSelectorMap from '@/common-components/common-maps/area-selector-map';
import cameraSelectRegion from '@/components/judge/judge-camera-select';
import rule from '@/modules/common/judge.rule';

/**
 * 表单默认数据
 */
const TaskForm = function (threshold) {
  this.jobName = '';
  this.jobType = '2';
  this.threshold = threshold;
  this.regions = [];
};
const DefaultDataItem = function () {
  this.defaultDate = [];
  this.cameraIds = [];
  this.regionLocation = null;
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
          thresholdNum: 80,
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
    },
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
      defaultData: [new DefaultDataItem(), new DefaultDataItem()],
      activeIndex: 0,
      taskForm: new TaskForm(this.regionThreshold.thresholdNum),
      taskRule: null,
      defaultSelectArray: [],
      mapAreaShow: true,
      activeMap: false
    };
  },
  computed: {
    isShowAddButton() {
      return this.defaultData.length < 5;
    },
    isShowDelButton() {
      return this.defaultData.length > 2;
    },
    dialogName() {
      return this.operateType === 'add' ? this.$t('新建区域碰撞任务') : this.$t('复制区域碰撞任务');
    }
  },
  watch: {
    visible: {
      handler() {
        this.chooseReset();
        if (this.visible && this.operateType === 'copy') {
          this.copyData();
        }
      }
    },
  },
  created() {
    this.taskRule = rule.region(null);
  },
  methods: {
    /**
     * 新建区域碰撞初始化数据
     */
    chooseReset() {
      this.taskForm = new TaskForm(this.regionThreshold.thresholdNum);
      this.defaultData = [new DefaultDataItem(), new DefaultDataItem()];
      this.activeIndex = 0;
      this.chooseRegion(this.activeIndex);
      this.$nextTick(() => {
        this.$refs.mapSelector.setDrawType('');
      });
    },
    handlerTime(date) {
      let res = '';
      if (date.length > 0) {
        res = `${moment(date[0]).format('YYYY-MM-DD HH:mm')}-${moment(date[1]).format('YYYY-MM-DD HH:mm')}`;
      } else {
        res = '--';
      }
      return res;
    },
    addChoose() {
      this.defaultData.push(new DefaultDataItem());
    },
    copyData() {
      this.taskForm = {
        jobType: this.formData.jobType,
        jobName: this.formData.jobName,
        threshold: this.formData.threshold
      };
      if (this.formData.regions) {
        this.formData.regions.forEach((item, ind) => {
          this.defaultData[ind] = {
            defaultDate: [new Date(item.beginTime), new Date(item.endTime)],
            cameraIds: item.cameraIds || [],
            regionLocation: item.regionLocation || ''
          };
          this.$nextTick(() => {
            if (this.$refs.cameraOnly[ind]) this.$refs.cameraOnly[ind].setTreeChecked(item.cameraIds);
          });
        });
      }
    },
    /**
     * 切换区域
     */
    chooseRegion(index) {
      this.activeIndex = index;
    },
    /**
     * 同步数据
     */
    onDeptCameraTreeUpdateReady(dataMap) {
      if (this.activeMap) return;
      this.activeMap = true;
      this.$refs.mapSelector.setFeatures(dataMap.filter((item) => item.flag === 'camera'));
    },
    /**
     * 区域重置事件
     */
    resetregion(index = this.activeIndex) {
      this.defaultData[index].cameraIds = [];
      this.$refs.mapSelector.selectFeatures([]);
      this.defaultData[index].regionLocation = '';
      this.defaultData[index].defaultDate = [];
      this.$refs.cameraOnly[0].setTreeChecked([]);
    },
    delRegion(index) {
      this.activeIndex = index;
      if (!this.isShowDelButton) return;
      this.$confirm(this.$t('确定移除该区域吗？'), this.$t('移除区域'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
      }).then(() => {
        this.chooseRegion(this.activeIndex);
        this.resetregion(index);
        if (index === (this.defaultData.length - 1)) {
          this.activeIndex = index - 1;
        }
        this.$delete(this.defaultData, index);
      }).catch(() => {
      });
    },
    /**
     * 接受区域地图坐标信息
     * @param {areaInfo} 坐标信息
     */
    onAddArea(areaInfo) {
      this.defaultData[this.activeIndex].regionLocation = areaInfo;
    },
    /**
     *
     * 当区域地图相机改变触发该事件
     * @param {ids} 返回地图中被选相机
     */
    onMapSelectChanged(ids, checked) {
      const { cameraIds } = this.defaultData[this.activeIndex];
      let arr = [];
      if (checked) {
        ids.forEach((id) => {
          if (cameraIds.indexOf(id) === -1) cameraIds.push(id);
          else if (cameraIds.indexOf(id) !== -1) cameraIds.splice(cameraIds.indexOf(id), 1);
        });
        arr = cameraIds;
      } else {
        arr = [];
      }
      if (arr.length > 100) {
        arr = arr.slice(0, 100);

        this.$message({
          type: 'warning',
          message: this.$t('摄像机选择上限100个，已为您选择前100个摄像机'),
        });
      }
      this.defaultData[this.activeIndex].cameraIds = arr;
      this.$refs.mapSelector.selectFeatures(arr);
      this.$refs.cameraOnly[0].setTreeChecked(arr);
    },
    /**
     *
     * 当区域相机改变触发该事件
     * @param {arr} 返回被选相机
     */
    cameraChoosed(arr) {
      if (arr.length > 40) {
        arr = arr.slice(0, 40);
        this.$message({
          type: 'warning',
          message: this.$t('摄像机选择上限40个，已为您选择前40个摄像机'),
        });
        this.$refs.cameraOnly[0].setTreeChecked(arr);
      }
      this.defaultData[this.activeIndex].cameraIds = arr;
      this.$refs.mapSelector.selectFeatures(arr);
    },

    /**
     * 弹窗关闭
     */
    onDialogClose() {
      this.$confirm(this.$t('当前内容已被编辑，如果退出，已编辑信息不再保留'), this.$t('确认放弃编辑'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
      }).then(() => {
        this.chooseReset();
        this.$emit('update:visible', false);
      }).catch(() => {
      });
      if (this.$refs.task) { this.$refs.task.resetFields(); }
    },
    /**
     *
     * 当区域一时间发生改变触发该事件
     * @param {timeArr} 返回选择后的时间
     */
    getDefaultValue() {
      this.taskForm.regions = [];
      this.defaultData.forEach((item, ind) => {
        this.taskForm.regions[ind] = {
          beginTime: (item.defaultDate && item.defaultDate[0]) ? item.defaultDate[0].getTime() : undefined,
          endTime: (item.defaultDate && item.defaultDate[1]) ? item.defaultDate[1].getTime() : undefined,
          cameraIds: item.cameraIds,
          regionLocation: item.regionLocation
        };
      });
    },
    checkedData() {
      let area = 0;
      this.taskForm.regions.forEach((item) => {
        if (item.beginTime !== undefined && item.cameraIds.length > 0) {
          area += 1;
        }
      });
      if (area < 2) {
        return false;
      }
      return true;
    },
    /**
     *
     * 确认保存任务
     */
    onDialogConfirm() {
      this.getDefaultValue();
      // 在提交数据的情况下，由父组件控制是否关闭弹窗
      this.$refs.task.validate((valid) => {
        if (valid) {
          if (!this.checkedData()) {
            this.$message.error('请保证至少两个区域信息填写完整');
            return;
          }
          this.taskForm.regions = this.taskForm.regions.filter((item) => { // eslint-disable-line
            if (item.beginTime !== undefined && item.cameraIds.length > 0) {
              return item;
            }
          });
          this.$emit('taskConfirm', this.taskForm);
        }
      });
    },
  }
};
</script>
<style lang="scss" scoped>
.region__new {
  div {
    box-sizing: border-box;
  }
}
.region__new ::v-deep .meg-dialog .meg-dialog__body {
  height: 100%;
  padding: 0px;
}
.meg-dialog__wrapper.is-middle {
  flex-direction: row;
}
.active-title {
  font-family: SourceHanSansCN-Bold;
  font-size: 14px;
  color: #21539B;
  text-align: left;
  line-height: 13px;
  height: 40px;
  line-height: 40px;
}
.add-button-box {
  padding: 0 6px;
  cursor: pointer;
}
.add-button {
  height: 48px;
  background-color: #fff;
  color: #21539b;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  border: 1px dashed #CED2DB;
}
.region__list-box {
  padding: 0 20px;
  width: 100%;
  height: calc(100%-125px);
  padding: 0 20px;
}
.region__list {
  width: 100%;
  height: 100%;
  display: flex;
  height: 100%;
  border: 1px solid #ccc;
  background-color: rgb(240, 240, 240);
  box-shadow: 1px 3px 1px rgba(0, 0, 0, 0.1);
}
.region__content {
  width: 100%;
  height: 100%;
}
.region__reset {
  width: 80px;
  position: absolute;
  top: -10px;
  right: 0;
  font-size: 14px;
}
.region__title {
  display: flex;
  justify-content: space-between;
  height: 55px;
  border-bottom: 1px solid #f3f3f3;
  align-items: center;
  padding: 0 30px 0 20px;
}
.region__first {
  height: 181px;
  width: 299px;
  border-left: 5px solid #5B98E7;
  padding: 0 13px;
}
.second-title {
  height: 40px;
  line-height: 40px;
  font-family: SourceHanSansCN-Medium;
  font-size: 14px;
  color: #435068;
}
.region__task__main {
  box-sizing: border-box;
  background: white;
  display: flex;
  border-top: 1px solid #E5E7ED;
  border-bottom: 1px solid #E5E7ED;
}
.region__task__main:first-child {
  border-top: 0;
}
.region__first__main {
  display: flex;
  justify-content: space-between;
  height: 40px;
  line-height: 40px;
}
.second-text {
  font-family: PingFangSC-Regular;
  height: 20px;
  font-size: 12px;
  color: #707D9A;
  letter-spacing: 0.08px;
  line-height: 20px;
  white-space:nowrap;
}
.task__center__new {
  background-color: #f0f0f0;
  width: 312px;
  border-right: 1px solid #CED2DB;
}
.choose__region__icon {
  float: left;
  padding-top: 38px;
}
.choose__region__icon {
  > span {
    display: inline-block;
    height: 34px;
    padding: 0 3px;
    cursor: inherit;
  }
  .choose__region__icon-hover:hover {
    background-color: rgb(230, 245, 255);
    cursor: pointer;
  }
  .focus__color {
    background-color: rgb(230, 245, 255);
  }
}
.region__map {
  flex: 1;
}
.disiabled-button {
  color: #999999;
}
.region__second {
  width: 100%;
  border-left: 5px solid #E5E7ED;
  padding: 0 13px 13px 13px;
  cursor: pointer;
}
.task-form-left {
  box-sizing: border-box;
  background-color: white;
  display: flex;
  padding: 0 20px;
  align-items: center;
  height: 70px;
  .left-item {
    margin: 0;
    margin-right: 30px;
  }
}
.similarity {
  width: 76px;
}
.form-title {
  height: 35px;
  line-height: 35px;
  font-size: 16px;
  font-weight: 800;
}
.region__new .common-select-label {
  color: rgb(73, 81, 103);
  font-size: 14px;
  position: absolute;
  top: 5px;
  left: 0;
}
</style>
