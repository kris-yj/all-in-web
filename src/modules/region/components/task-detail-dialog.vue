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
      <div class="task__top__detail">
        <meg-form
          ref="task"
          class="task-form-left"
          label-position="top"
          label-width="83px"
          :model="taskForm"
          :rules="taskRule">
          <meg-form-item
            class="left-item"
            prop="jobName">
            <p>
              <span class="title__task">{{ $t('任务名称') }}</span>
              <span
                v-show="!editMode"
                v-tooltip="true"
                class="color__main__region">{{ taskForm.jobName }}
              </span>
              <span
                v-show="editMode"
                class="region__name__main">
                <meg-input
                  v-model.trim="taskForm.jobName"
                  :placeholder="$t('请输入{from}-{to}个汉字，字母，数字', { from: 2, to: 50})">
                </meg-input>
              </span>
              <meg-button
                type="text"
                @click="editJobName"
                v-if="!editMode && ifAuth">
                {{ $t('编辑') }}
              </meg-button>
              <meg-button
                class="button__Region__name"
                type="text"
                @click="confirmJobName"
                v-if="editMode">
                {{ $t('确认') }}
              </meg-button>
              <meg-button
                class="button__Region__name"
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
      </div>
      <div class="region__list">
        <div class="region__list-left">
          <div
            v-for="(item,ind) of defaultData"
            :key="ind"
            class="region__task__main__choose">
            <p>{{ $t(`区域${ind + 1}`) }}</p>
            <div class="region__camera__list">
              <p><span class="date__region">{{ $t('选择相机') }}</span><span class="num__list__task__detail">{{ $t('已选') }} {{ item.cameraIds.length }}{{ $t('个') }}</span></p>
              <div
                class="content-tag-main"
                style="border: 1px solid #e4e7ed;height: 150px;">
                <div class="camera__box">
                  <span
                    v-for="(camera,index) in item.cameraItemName"
                    :key="index">
                    {{ camera }}
                    <span
                      v-show="item.cameraItemName.length!==index+1">,</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="date__region-time">
              {{ $t('选择时间') }}
            </div>
            <meg-date-picker
              v-model="defaultData[ind].defaultDate"
              readonly
              :format="'yyyy-MM-dd HH:mm'"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
            </meg-date-picker>
          </div>
        </div>
        <div class="region__map">
          <area-display-map
            v-if="visible"
            ref="mapSelector"
            :areas-data="defaultData"></area-display-map>
        </div>
      </div>
    </div>
  </meg-dialog>
</template>
<script>
import AreaDisplayMap from '@/common-components/common-maps/area-display-map';
import rule from '@/modules/common/judge.rule';

const DefaultDataItem = function () {
  this.defaultDate = [];
  this.cameraIds = [];
  this.regionLocation = '';
};

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
    formData: {
      type: Object,
      default() {
        return {};
      }
    },
    responseFlag: {
      type: String,
      default: 'success'
    }
  },
  data() {
    return {
      defaultData: [new DefaultDataItem(), new DefaultDataItem()],
      taskRule: null,
      editMode: false,
      taskForm: {
      },
      jobId: '',

    };
  },
  watch: {
    formData: {
      // init数据
      handler(val) {
        this.taskForm = {
          jobName: val.jobName,
          jobType: val.jobType,
          threshold: val.threshold,
          regionVos: val.regionVos
        };
        this.jobId = val.id;
        this.taskRule = rule.region(this.jobId);
        const selectedFeature = [];
        if (val.regionVos) {
          val.regionVos.forEach((item, index) => {
            if (!this.defaultData[index]) this.defaultData.push(new DefaultDataItem());
            const cameraItemName = [];
            this.flatterCameraList.forEach((cameraItem) => {
              if (item.cameraIds.indexOf(cameraItem.id) !== -1) {
                cameraItemName.push(cameraItem.name);
                selectedFeature.push(cameraItem.id);
              }
            });
            this.defaultData[index] = {
              defaultDate: [item.beginTime, item.endTime] || [],
              cameraIds: item.cameraIds,
              regionLocation: item.regionLocation,
              cameraItemName
            };
          });
        }
        this.$nextTick(() => {
          this.$refs.mapSelector.setFeatures(this.flatterCameraList);
          this.$refs.mapSelector.selectFeatures(selectedFeature);
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
      if (!val) this.defaultData = [new DefaultDataItem(), new DefaultDataItem()];
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
          this.$emit('modifyJobName', params, 'task');
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
.region__new__detail ::v-deep .select-toolbar{
  display: none;
}
.meg-dialog__wrapper.is-middle {
  flex-direction: row;
}
.region__name__main {
  display: inline-block;
  width: 50%;
}
.button__Region__name {
  margin-right: -10px;
}
.content-tag-main {
  height: 150px;
}
.title__task__region {
  margin-left: 30px;
}
.camera__box {
  position: relative;
  height: 145px;
  padding: 10px;
  box-sizing: border-box;
  line-height: 24px;
  overflow-y: scroll;
  font-size: 14px;
  span {
    color: #435068;
  }
  .el-tag {
    max-width: 100%;
    position: relative;
    padding: 0 10px 0 10px;
  }
}
.region__list {
  border-top: 1px solid #ccc;
  height: calc(100%-127px);
  background-color: rgb(240, 240, 240);
  display: flex;
  box-shadow: 1px 3px 1px rgba(0, 0, 0, 0.1);
  .region__list-left {
    width: 320px;
    height: 100%;
    border-right: 1px solid #ccc;
    overflow-y: scroll;
  }
}
.region__content {
  width: 100%;
  height: 100%;
}
.task__top__detail {
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
.region__task__main__choose {
  padding: 20px;
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
.date__region-time {
  font-size: 14px;
  color: rgb(134, 154, 187);
  line-height: 34px;
  height: 34px;
}
.region__map {
  flex: 1;
}
.form-title {
  height: 35px;
  line-height: 35px;
  font-size: 16px;
  font-weight: 800;
}
.region__title {
  display: flex;
  justify-content: space-between;
  height: 55px;
  border-bottom: 1px solid #f3f3f3;
  align-items: center;
  padding: 0 30px 0 20px;
}
</style>
