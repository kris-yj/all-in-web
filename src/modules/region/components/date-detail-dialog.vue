<template>
  <meg-dialog
    class="region__new region__new__detail"
    :visible="visible"
    width="100%"
    :fullscreen="true"
    :show-close="false"
    @close="onDialogClose">
    <div
      class="region__content">
      <div class="region__title">
        <span class="form-title">
          {{ formData.jobName }}
        </span>
        <div>
          <meg-button
            @click="onDialogClose"
            type="primary">
            {{ $t('取消') }}
          </meg-button>
        </div>
      </div>
      <div class="region__list">
        <div class="region__list-left">
          <div class="task__top__detail">
            <meg-form
              ref="task"
              class="task-form-left"
              label-position="top"
              label-width="83px"
              :model="taskForm"
              :rules="taskRule">
              <meg-form-item
                prop="jobName">
                <p>
                  <span class="title__task">{{ $t('任务名称') }}</span>
                  <span
                    v-show="!editMode"
                    v-tooltip="true"
                    class="color__main__region">{{ taskForm.jobName }}</span>
                  <span
                    v-show="editMode"
                    class="region__name__main">
                    <meg-input
                      v-model.trim="taskForm.jobName"
                      :placeholder="$t('请输入{from}-{to}个汉字，字母，数字', { from: 2, to: 50 })">
                    </meg-input>
                  </span>
                  <meg-button
                    type="text"
                    @click="editJobName"
                    v-if="!editMode && ifAuth">
                    {{ $t('编辑') }}
                  </meg-button>
                  <meg-button
                    type="text"
                    @click="confirmJobName"
                    v-if="editMode">
                    {{ $t('确认') }}
                  </meg-button>
                  <meg-button
                    type="text"
                    @click="cancelJobName"
                    v-if="editMode">
                    {{ $t('取消') }}
                  </meg-button>
                </p>
              </meg-form-item>
            </meg-form>
            <p class="title__task__region">
              <span class="title__task">{{ $t('比对阈值') }}</span><span
                class="color__main__region__second">{{ formData.threshold }}</span>
            </p>
            <div
              class="region__task__main__choose__date">
              <p>{{ $t('区域1') }}</p>
              <div class="region__camera__list">
                <p><span class="date__region">{{ $t('选择相机') }}</span><span class="num__list__task__detail">{{ $t('已选') }} {{ camerasFirst.length || 0 }}{{ $t('个') }}</span> </p>
                <div
                  class="content-tag-main-date">
                  <div class="camera__box">
                    <span
                      v-for="(camera,index) in camerasFirst"
                      :key="index">
                      {{ camera.name }}
                      <span
                        v-show="camerasFirst.length!==index+1">,</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="date-all">
            <div
              v-for="(item, index) of defaultDate"
              :key="index"
              class="date__region-box">
              <div class="region-box-title">
                {{ $t(`选择时间${index + 1}`) }}
              </div>
              <meg-date-picker
                :value="item"
                readonly
                :format="'yyyy-MM-dd HH:mm'"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
              </meg-date-picker>
            </div>
          </div>
        </div>
        <div class="region__map">
          <area-display-map
            ref="mapSelector"
            :areas-data="[taskForm.timeRegions]"></area-display-map>
        </div>
      </div>
    </div>
  </meg-dialog>
</template>
<script>
import AreaDisplayMap from '@/common-components/common-maps/area-display-map';
import rule from '@/modules/common/judge.rule';

export default {
  components: {
    AreaDisplayMap
  },
  props: {
    ifAuth: {
      type: [Boolean, Object],
      default: null
    },
    type: {
      type: String,
      default: 'add'
    },
    visible: {
      type: Boolean,
      default: false
    },
    responseFlag: {
      type: String,
      default: 'success'
    },
    formData: {
      type: Object,
      default() {
        return {
          jobName: '',
          jobType: '',
          threshold: 80,
          region1: {
            beginTime: new Date(new Date().setHours(0, 0, 0, 0)) - 6 * 24 * 60 * 60 * 1000,
            endTime: new Date().getTime(),
            cameraIds: [],
            regionLocation: ''
          },
        };
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
      taskForm: {
        jobName: '',
        timeRegions: {}
      },
      jobId: '',
      taskRule: null,
      editMode: false,
      areasData: [],
      defaultDate: [],
      camerasFirst: []
    };
  },
  computed: {
  },
  watch: {
    formData: {
      handler(val) {
        this.taskForm = {
          jobName: val.jobName,
          jobType: val.jobType,
          threshold: val.threshold,
          timeRegions: val.timeRegions
        };
        this.jobId = val.id;
        this.taskRule = rule.region(this.jobId);
        if (val.timeRegions.times) {
          val.timeRegions.times.forEach((item, index) => {
            this.defaultDate[index] = [item.beginTime, item.endTime];
          });
        }
        this.camerasFirst = this.flatterCameraList.filter((item) => val.timeRegions.cameraIds.includes(item.id));
        this.$nextTick(() => {
          this.$refs.mapSelector.setFeatures(this.flatterCameraList);
          this.$refs.mapSelector.selectFeatures(val.timeRegions.cameraIds);
        });
      }
    },
    // 确认编辑后请求的返回状态 格式为 success/error + _ +时间戳
    responseFlag(val) {
      const [flag] = val.split('_');
      if (flag === 'success') {
        this.editMode = false;
        if (this.$refs.task) {
          this.$refs.task.clearValidate();
        }
      } else {
        this.formData.jobName = this.jobName;
      }
    },
    visible(val) {
      if (!val) this.defaultDate = [[], []];
    }
  },
  methods: {
    setTreeData(data) {
      this.flatterCameraList = data;
    },
    editJobName() {
      this.editMode = true;
      this.jobName = this.taskForm.jobName;
    },
    confirmJobName() {
      if (this.jobName === this.taskForm.jobName) {
        this.editMode = false;
        return;
      }
      this.$refs.task.validate((valid) => {
        if (valid) {
          const params = {
            id: this.jobId,
            jobName: this.taskForm.jobName
          };
          this.$emit('modifyJobName', params, 'date');
        }
      });
    },
    cancelJobName() {
      this.editMode = false;
      if (this.$refs.task) {
        this.$refs.task.clearValidate();
      }
      this.taskForm.jobName = this.jobName;
    },
    onMapSelectedChanged() {

    },
    /**
     * 弹窗关闭
     */
    onDialogClose() {
      this.$emit('update:visible', false);
    },
  }
};
</script>
<style lang="scss" scoped>
.region__new ::v-deep .meg-dialog .meg-dialog__body {
  height: 100%;
  padding: 0px;
}
.region__new {
  ::v-deep .select-toolbar {
    display: none;
  }
  .meg-dialog__body {
    padding: 0px;
  }
  .title__task__region {
    padding-top: 10px;
  }
  .content-tag-main-date {
    height: 150px;
    margin-bottom: 15px;
    border: 1px solid #e4e7ed;
  }
  .camera__box {
    position: relative;
    height: 145px;
    padding: 10px;
    box-sizing: border-box;
    line-height: 24px;
    font-size: 14px;
    overflow-y: scroll;
    span {
      color: #435068;
    }
  }
  .region__title {
    display: flex;
    justify-content: space-between;
    height: 55px;
    border-bottom: 1px solid #f3f3f3;
    align-items: center;
    padding: 0 30px 0 20px;
  }
  .region__list {
    height: calc(100%-56px);
    width: 100%;
    display: flex;
    background-color: rgb(240, 240, 240);
    box-shadow: 1px 3px 1px rgba(0, 0, 0, 0.1);
    .region__list-left {
      width: 320px;
      height: 100%;
      border-right: 1px solid #ccc;
    }
  }
  .region__content {
    width: 100%;
    height: 100%;
  }
  .region__title__detail {
    height: 50px;
    padding-top: 10px;
    box-sizing: border-box;
    background-color: rgb(240, 240, 240);
  }
  .region__newTask {
    position: relative;
    top: -10px;
    right: -70px;
  }
  .task__top__detail {
    padding: 10px 20px 0 20px;
    background-color: #ffffff;
    .color__main__region {
      height: 20px;
      line-height: 20px;
      font-size: 14px;
      color: rgb(67, 80, 104);
      margin-left: 10px;
      max-width: 160px;
    }
    .color__main__region__second {
      display: inline-block;
      height: 20px;
      line-height: 20px;
      margin-bottom: 5px;
      font-size: 14px;
      margin-left: 14px;
      color: rgb(67, 80, 104);
    }
    .color__main__region {
      color: rgb(67, 80, 104);
    }
    .title__task {
      color: rgb(134, 154, 187);
    }
  }
  .region__first {
    margin-top: 10px;
    height: 215px;
    width: 270px;
    padding: 20px 0 0 25px;
  }
  .region__task__main__choose__date {
    padding-bottom: 10px;
    box-sizing: border-box;
    background-color: #ffffff;
    > p {
      color: rgb(67, 80, 104);
      font-size: 14px;
      font-weight: bold;
    }
  }
  .region__camera__list {
    p {
      color: rgb(67, 80, 104);
      font-size: 14px;
      height: 20px;
      line-height: 20px;
      padding: 10px 0 5px 0;
    }
  }
  .num__list__task__detail {
    color: rgb(153, 153, 153);
    font-size: 12px;
    float: right;
  }
  .date__region {
    font-size: 14px;
    color: rgb(134, 154, 187);
    margin-top: 8px;
  }
  .date-all {
    background-color: #f0f0f0;
    padding-top: 10px;
  }
  .date__region-box {
    height: 78px;
    padding: 10px 20px;
    background-color: white;
    margin-bottom: 10px;
    .region-box-title {
      font-family: SourceHanSansCN-Medium;
      font-size: 14px;
      color: #435068;
      height: 34px;
      line-height: 34px;
    }
  }
  .form-title {
    height: 35px;
    line-height: 35px;
    font-size: 16px;
    font-weight: 800;
  }
  .region__map {
    flex: 1;
  }
}
</style>
