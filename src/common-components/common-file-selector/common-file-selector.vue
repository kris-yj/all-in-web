<template>
  <div :class="['file-selector-wrapper', disabled ? 'disabled' : '']">
    <div class="common-selector-list">
      <meg-popover
        ref="selectorPopover"
        :disabled="disabled"
        placement="right"
        :popper-class="popperClass"
        trigger="click"
        @after-enter="showPopOver">
        <div
          class="file-select-right-container">
          <common-file-selector-tree
            ref="fileSelectContainer"
            :if-emit-data="true"
            :choose-file-mode="1"
            :selector-data="selectorData"
            :file-list-getter="fileListGetter"
            :default-checked-all="checkedAll"
            :root-id="rootId"
            @toggle-file-list="toggleFileList"
            @file-change="checkedFileChange"
            @tree-update-ready="treeUpdateReady"></common-file-selector-tree>
        </div>
        <div
          class="common-selector-inner"
          slot="reference"
          @click="handleClick">
          <span class="common-placeholder-wrapper">
            <span
              v-if="!totalCheckedNum"
              class="common-selector-placeholder">请选择文件</span>
            <span
              class="common-selector-placeholder"
              v-else>
              已选 {{ totalCheckedNum }} 个
            </span>
            <span
              class="disable-icon">
              <meg-icon
                name="list"
                dir="top"
                height="10"
                :color="disabled ? '#859aba': '#21539b'"></meg-icon>
            </span>
          </span>
        </div>
      </meg-popover>
    </div>
  </div>
</template>
<script>
import CommonFileSelectorTree from './common-file-select-tree';

export default {
  name: 'CommonFileSelector',
  components: {
    CommonFileSelectorTree,
  },
  props: {
    // 获取 文件的 server
    fileListGetter: {
      type: Function,
      default: undefined
    },
    // 获取任务列表的server
    taskListGetter: {
      type: Function,
      default: undefined
    },
    // 是否默认选中所有的文件
    defaultCheckedAll: {
      type: Boolean,
      default: true
    },
    // 默认选中的Id
    defaultCheckedIds: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 选择文件的模式 1代表通过任务选择
      chooseFileMode: 1,
      // 左侧列表的数据
      selectorData: [],
      selectedFiles: [],
      showFileList: false,
      totalCheckedNum: 0,
      totalCheckedTags: [],
      rootId: 'ROOT',
    };
  },
  computed: {
    popperClass() {
      return this.showFileList ? 'file-select-popover-expand' : 'file-select-popover-shrink';
    },
    checkedAll: {
      get() {
        return this.defaultCheckedIds.length ? false : this.defaultCheckedAll;
      },
      set(val) {
        this.setCheckedKeys(val ? 'ALL' : (this.defaultCheckedIds.length ? this.defaultCheckedIds : []));//eslint-disable-line
      }
    }
  },
  created() {
    this.fetchTaskList();
  },
  methods: {
    handleClick() {
      if (this.disabled) return false;
      return true;
    },
    /**
     * @description 设置选中的数据
     */
    setCheckedKeys(keys) {
      this.$refs.fileSelectContainer.setCheckedKeys(keys);
    },
    /**
     * @description 获取选中的数据
     */
    getSelectedKeys() {
      const arr = [];
      this.totalCheckedTags.forEach((item) => {
        arr.push({
          id: item.id,
          idsIn: item.idsIn,
          idsNotIn: item.idsNotIn,
        });
      });
      return arr;
    },
    getSelectedNodes() {
      return this.totalCheckedTags;
    },
    showPopOver() {
      this.$nextTick(() => {
        this.$refs.fileSelectContainer.resizeLeftListHeight();
      });
    },
    fetchTaskList() {
      this.taskListGetter({ pageNo: 1, pageSize: 10000 }).then((res) => {
        if (res.code === 0) {
          const taskList = res.data.records;
          const rootTask = {
            id: this.rootId,
            parentId: '',
            label: this.$t('全选'),
            name: this.$t('全选'),
            noStatistics: true,
          };
          taskList.forEach((item) => {
            item.label = item.taskName;
            item.name = item.taskName;
          });
          rootTask.children = taskList;
          this.selectorData = [rootTask];
        }
      });
    },
    /**
     * @description 是否显示文件列表
     */
    toggleFileList(val) {
      if (val && val !== this.showFileList) {
        this.$nextTick(() => {
          if (this.$refs.selectorPopover) this.$refs.selectorPopover.updatePopper();
        });
      }
      this.showFileList = val;
    },
    treeUpdateReady() {
      this.$emit('tree-update-ready', this.getSelectedKeys());
    },
    checkedFileChange(val) {
      this.totalCheckedNum = 0;
      this.totalCheckedTags = val;
      val.forEach((item) => {
        this.totalCheckedNum += ~~(item.checkedNum);//eslint-disable-line
      });
      this.$emit('change', this.getSelectedKeys());
    },
    deleteSelectFile(val) {
      this.$refs.fileSelectContainer.removeCheckedKeys(val);
    },
  }
};
</script>
<style lang="scss">
  .file-selector-wrapper.disabled {
    background-color: #f4f5f6;
    color: #bdc2ca;
    cursor: not-allowed;
    .common-selector-placeholder {
      color: #bdc2ca !important;
    }
    .common-selector-list{
      transition: none;
    }
  }
  .file-selector-wrapper.disabled:hover {
    .common-selector-list{
      border-color: #bdc2ca;
    }
  }
  .file-selector-wrapper:hover{
    .common-selector-list{
      border-color: #21539b;
    }
  }
  .common-placeholder-wrapper{
    display: flex;
    .disable-icon{
      width: 30px;
    }
  }
  .file-select-right-container{
    height: 100%;
  }
  .file-select-popover-shrink{
    width: 300px !important;
    height: 550px;
    box-sizing: border-box;
    padding: 0;
  }
  .file-select-popover-expand{
    height: 550px;
    width: 600px !important;
    box-sizing: border-box;
    padding: 0;
  }
  .file-selector-wrapper{
    position: relative;
    line-height: 34px;
    cursor: pointer;
    .file-selector-menu{
      position: absolute;
      right: 5px;
      top: 0px;
      display: inline-block;
      width: 20px;
      height: 34px;
      line-height: 34px;
    }
  }
  .common-selector-list{
    box-sizing: border-box;
    position: relative;
    border: 1px solid #d2d6de;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    .common-selector-inner{
      height: 34px;
      .common-selector-placeholder{
        color: #435068;
        display: inline-block;
        padding-left: 10px;
        width: 100%;
      }
      .common-tag-container{
        padding: 5px 5px 2px 5px;
        line-height: 16px;
        box-sizing: border-box;
        padding-right: 30px;
        overflow: hidden;
      }
    }
  }
  .common-selector-header{
    display: flex;
    justify-content: space-between;
    line-height: 20px;
  }
</style>
