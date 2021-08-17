<template>
  <div class="search-common-condition">
    <meg-form-item
      label="起止时间"
      prop="fileTime">
      <meg-date-picker
        ref="datePicker"
        :prefix-icon-visible="false"
        type="datetimerange"
        format="yyyy-MM-dd HH:mm"
        value-format="timestamp"
        v-model="dateTime"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        range-separator="至"
        :show-history="true"
        :default-date="'pastWeek'"
        :picker-options="{shortcuts: ['today', 'pastThreeDays', 'pastWeek', 'pastMonth']}">
      </meg-date-picker>
    </meg-form-item>
    <meg-form-item
      prop="cameraTime"
      style="display:none;"></meg-form-item>
    <meg-form-item
      label="检索结果来源"
      prop="sourceType">
      <div
        class="meg-radio__wrapper"
        v-if="sourceTypes.includes('CAMERA')">
        <meg-radio
          v-model="formData.sourceType"
          label="CAMERA">
          相机
        </meg-radio>
        <common-camera-selector
          class="camera-selector__wrap"
          ref="cameraSelector"
          map-icon-position="right"
          :disabled="formData.sourceType === 'OFFLINE'"
          @update-ready="cameraTreeReady"></common-camera-selector>
      </div>
      <div
        class="meg-radio__wrapper"
        v-if="sourceTypes.includes('OFFLINE')">
        <meg-radio
          v-model="formData.sourceType"
          label="OFFLINE">
          文件
        </meg-radio>
        <common-file-selector
          ref="fileSelector"
          class="file-selector__wrap"
          :disabled="formData.sourceType === 'CAMERA'"
          :task-list-getter="taskListGetter"
          :file-list-getter="fileListGetter"
          @tree-update-ready="fileTreeReady"></common-file-selector>
      </div>
    </meg-form-item>
  </div>
</template>
<script>
import CommonCameraSelector from '@/common-components/common-camera-selector';
import CommonFileSelector from '@/common-components/common-file-selector';
import SearchSrv from './search-common-condition.service';

export default {
  components: {
    CommonCameraSelector,
    CommonFileSelector
  },
  props: {
    // 上级传入的formData
    formData: {
      type: Object,
      default: () => ({
        fileTime: [],
        cameraTime: [],
        sourceType: 'CAMERA'
      })
    },
    defaultCheckedKeys: {
      type: Array,
      default: () => []
    },
    // 显示的资源类型
    sourceTypes: {
      type: Array,
      default: () => ['CAMERA', 'OFFLINE'],
      validator(value) {
        return value === undefined || (value && value.length);
      }
    }
  },
  data() {
    return {
      taskListGetter: SearchSrv.fetchOfflineTaskList,
      fileListGetter: SearchSrv.fetchOfflineFileList,
    };
  },
  computed: {
    dateTime: {
      set(val) {
        if (this.formData.sourceType === 'CAMERA') {
          this.formData.cameraTime = val;
        } else {
          this.formData.fileTime = val;
        }
      },
      get() {
        return this.formData.sourceType === 'CAMERA' ? (this.formData.cameraTime) : this.formData.fileTime;
      }
    }
  },
  watch: {
    defaultCheckedKeys(val) {
      if (!val.length) return;
      if (this.formData.sourceType === 'OFFLINE') {
        // 如果在树加载完成前监听导变化，调用了fileTreeReady方法，会造成没有选中数据，会提示『请选择文件』
        // 所以只有当树加载完成，才需要掉用
        // 如果没加载前变化了，等加载完成，会通过 fileTreeReady 方法去设置setCheckedKeys(this.defaultCheckedKeys)
        if (this.isFileTreeReady) this.fileTreeReady();
      } else if (this.isCameraTreeReady) {
        this.cameraTreeReady();
      }
    }
  },
  methods: {
    /**
     * @description 文件树加载完成的时候处理数据
     */
    fileTreeReady() {
      this.isFileTreeReady = true;
      if (this.formData.sourceType === 'OFFLINE' && this.defaultCheckedKeys.length) this.$refs.fileSelector.setCheckedKeys(this.defaultCheckedKeys);
      const taskInfos = this.$refs.fileSelector.getSelectedKeys();
      this.$emit('get-selected-keys', 'OFFLINE', taskInfos);
    },
    cameraTreeReady() {
      this.isCameraTreeReady = true;
      const { pageType } = this.$route.query;
      // 单页
      if (pageType && pageType === 'single') {
        // 有默认相机选择默认相机
        if (this.formData.sourceType === 'CAMERA' && this.defaultCheckedKeys.length) {
          this.$refs.cameraSelector.setCheckedKeys(this.defaultCheckedKeys);
        }
        // 没有默认，全选
        if (this.formData.sourceType === 'CAMERA' && this.defaultCheckedKeys.length === 0) {
          this.$refs.cameraSelector.setCheckedKeys('ALL');
        }
      }
      if (!pageType) {
        // 不是单页默认全选
        this.$refs.cameraSelector.setCheckedKeys('ALL');
      }
      const cameraIds = this.$refs.cameraSelector.getCheckedKeys();
      this.$emit('get-selected-keys', 'CAMERA', cameraIds);
    },
    /**
     * @description 重置到全选(相机不全选)
     */
    resetCheckedAll() {
      if (this.$refs.cameraSelector) this.$refs.cameraSelector.setCheckedKeys();
      if (this.$refs.fileSelector) this.$refs.fileSelector.setCheckedKeys('ALL');
    },
    /**
     * 获取 相机/任务文件 + 时间
     * @param { boolean } required  是否必填，如果必填，内部会触发提示，并返回 undefined
     * @returns 相机/任务文件 + 时间
     */
    getData(required) {
      this.dateTime = this.dateTime || [];
      const [startTime = '', endTime = ''] = this.dateTime;
      console.log(this.dateTime);
      const params = {
        startTime,
        endTime,
        time: startTime ? [startTime, endTime] : []
      };
      const flag = this.formData.sourceType === 'CAMERA';
      if (flag) {
        params.cameraIds = this.$refs.cameraSelector.getCheckedKeys();
        params.taskInfos = [];
        console.log(params.cameraIds.length);
        // 请选择相机
        if (required && !params.cameraIds.length) {
          this.$message.warning('请选择相机');
          return false;
        }
      } else {
        params.taskInfos = this.$refs.fileSelector.getSelectedKeys();
        console.log(this.$refs.fileSelector.getSelectedKeys());
        params.cameraIds = [];
        // 请选择文件
        if (required && !params.taskInfos.length) {
          this.$message.warning('请选择文件');
          return false;
        }
      }
      // 写入时间历史记录
      if (startTime && endTime) {
        this.$refs.datePicker.addHistory([new Date(startTime), new Date(endTime)]);
      }
      return params;
    },
    getFileSelectedNodes() {
      return this.$refs.fileSelector.getSelectedNodes();
    },
    getCameraSelectedNodes() {
      return this.$refs.cameraSelector.getCheckedNodes((item) => item.coreId !== '');
    }
  }
};
</script>
<style lang="scss" scoped>
  .meg-radio__wrapper{
    display: flex;
    margin-bottom: 10px;
    ::v-deep .meg-radio{
      line-height: 34px;
      margin-right: 16px;
    }
    .camera-selector__wrap{
      flex: 1;
    }
    .file-selector__wrap{
      flex: 1;
    }
  }
</style>
