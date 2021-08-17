<template>
  <div
    :class="['file-list-container', chooseFileMode ? 'task-mode': 'file-mode']"
    v-click-outside="handleClickOutside">
    <div class="left-inner-container">
      <div
        class="inner-header"
        v-if="chooseFileMode">
        <span class="selector-title">{{ $t('任务列表') }}</span>
      </div>
      <div class="left-inner-content">
        <meg-tree
          class="left-inner-tree"
          ref="leftInnerTree"
          @filtered-nodes-all-check-change="handleLeftFilterNodesAllCheckChange"
          :search-leaf-model="!!chooseFileMode"
          :props="defaultProps"
          :standard-tree-data="true"
          :data="selectorData"
          :default-checked-all="defaultCheckedAll"
          :show-checkbox="!!chooseFileMode"
          @check-change="handleTaskCheckChange"
          :expand-on-click-node="false"
          :default-expand-all="expandAll"
          @node-click="handleNodeClick"
          @tree-update-ready="leftInnerTreeReady">
          <!-- 选择器是文件夹的时候，显示图标 -->
          <div
            class="custom-tree-node"
            slot-scope="{ node, data }">
            <div
              class="item-icon"
              v-if="!chooseFileMode">
              <meg-icon
                name="folder"
                height="15"
                color="#869ABB">
              </meg-icon>
            </div>
            <div
              class="item-name"
              v-tooltip="true">
              {{ data.name }}
            </div>
            <!-- 选中个数统计 -->
            <span
              v-tooltip="true"
              class="item-count">
              {{ checkedFileMap[data.id] && (checkedFileMap[data.id].checkedNum || '') }}
            </span>
            <!-- 向右的箭头 -->
            <span class="item-icon">
              <meg-icon
                v-if="currentCheckedNode.id === data.id && showFileList && data.id !== rootId"
                width="12"
                color="#1b5298"
                name="arrow_hollow"
                dir="left"></meg-icon>
            </span>
          </div>
        </meg-tree>
      </div>
    </div>
    <div
      class="right-inner-container"
      v-show="showFileList || isDefaultShowFileList">
      <div
        class="inner-header"
        v-if="chooseFileMode">
        <span class="selector-title">{{ $t('文件列表') }}</span>
      </div>
      <div class="right-inner-content">
        <div :class="['file-tree-search', chooseFileMode ? '': 'no-padding-around']">
          <meg-input
            v-model="seachFileText"
            :placeholder="'搜索文件名称'"
            :disabled="currentCheckedNode && !currentCheckedNode.id">
            <meg-icon
              class="search-icon"
              slot="prefix"
              name="search_1"
              width="13"
              color="#869ABB"
              height="14"></meg-icon>
          </meg-input>
        </div>
        <div
          class="file-tree-header"
          v-if="hideFileCheckBox">
          <div
            class="name-title"
            v-if="!chooseFileMode">
            上传人
          </div>
          <meg-checkbox
            :indeterminate="ifIndeterminate"
            :disabled="!currentCheckedNode.id"
            v-model="checkFileAll"
            @change="handleCheckAllChange">
            文件名称
          </meg-checkbox>
        </div>
        <div
          :class="{'file-tree-content': true, 'hide-header': !hideFileCheckBox}"
          v-loading="fileLoading">
          <meg-tree
            ref="fileListTree"
            :props="defaultFileProps"
            :data="fileList"
            :show-search="false"
            :show-checkbox="true"
            :search-leaf-model="true"
            @filtered-nodes-all-check-change="handleRightFilterNodesAllCheckChange"
            @check-change="handleFileCheckChange"
            @tree-update-ready="fileListTreeReadyFn">
            <div
              class="custom-tree-node"
              slot-scope="{ node, data }">
              <div class="item-icon">
                <meg-icon
                  :name="chooseFileMode ? iconMap[data.resourceType] : iconMap[data.fileType]"
                  height="15"
                  color="#869ABB #fff">
                </meg-icon>
              </div>
              <div
                class="item-name"
                v-tooltip="true">
                {{ data.name || data.resourceName }}
              </div>
              <span
                v-tooltip="true"
                class="item-creator">
                {{ data.creatorRealName }}
              </span>
            </div>
          </meg-tree>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// totalTaskItemNum
export default {
  name: 'CommonFileSelectTree',
  props: {
    // 选择文件的模式 0 资源文件夹 1 任务名称
    chooseFileMode: {
      type: Number,
      default: 0
    },
    // 树的数据
    selectorData: {
      type: Array,
      default: () => []
    },
    // 是否默认展开树
    expandAll: {
      type: Boolean,
      default: true
    },
    // 是否要改变选中的时候 同时返回 选中的数据（默认 false）
    // 格式：[{文件夹 id, 选中的，没选中的 }]
    ifEmitData: {
      type: Boolean,
      default: false
    },
    // 获取 文件的 server
    fileListGetter: {
      type: Function,
      default: undefined
    },
    // 是否默认选中所有的文件
    defaultCheckedAll: {
      type: Boolean,
      default: true
    },
    rootId: {
      type: String,
      default: '0'
    },
    // 数量选中
    countsMap: {
      type: Object,
      default: () => {}
    },
    // 是否是文件选择的服务接口
    isFileAnalysisSer: {
      type: Boolean,
      default: false
    },
    isDefaultShowFileList: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 用于显示文件列表的数据
      fileList: [],
      totalRecords: 0,
      // 文件列表的loading效果
      fileLoading: false,
      // 选中的文件存入
      checkedFileMap: {},
      // 初始设置的checkedInfo
      tempCheckedInfo: {
        id: 0,
        label: '',
        checkedAll: false, // 是否选中全部
        idsIn: [],
        idsNotIn: [],
        isIndeterminate: false,
        checkedNum: 0,
      },
      // 当前点击并选中的Node
      currentCheckedNode: {},
      // 搜索文件名称
      seachFileText: '',
      // 显示文件列表
      showFileList: false,
      iconMap: {
        0: 'folder',
        1: 'video_mode',
        2: 'zip',
        3: 'upload_image',
      },
      // 是否选中文件列表中的所有文件
      checkFileAll: (this.currentCheckedNode && this.currentCheckedNode.checkedAll) || false,
      checkedFileKeys: '',
      // 屏蔽第一次空数组的情况作判断使用
      firstFlag: false,
      hideFileCheckBox: true, // 隐藏文件名称选择框
    };
  },
  computed: {
    ifIndeterminate() {
      return this.checkedFileMap[this.currentCheckedNode.id] && this.checkedFileMap[this.currentCheckedNode.id].isIndeterminate;
    },
    // 左边默认的属性
    defaultProps() {
      return this.chooseFileMode ? {} : { label: 'name' };
    },
    // 文件列表默认的属性
    defaultFileProps() {
      return this.chooseFileMode ? { label: 'resourceName' } : { label: 'name' };
    }
  },
  watch: {
    showFileList(val) {
      this.$emit('toggle-file-list', val);
    },
    seachFileText(newVal) {
      if (!this.fileLoading) this.$refs.fileListTree.filter(newVal.replace(/(^\s*)|(\s*$)/g, ''));
      if (newVal) {
        this.hideFileCheckBox = false;
      } else {
        this.hideFileCheckBox = true;
      }
    },
  },
  methods: {
    /**
     * @description 左边的树加载完毕的时候,设置全局的map, 设置默认的选中
     */
    leftInnerTreeReady(data) {
      if (this.firstFlag) {
        this.$nextTick(() => {
          this.$emit('tree-update-ready', data);
        });
      }
      this.firstFlag = true;
      if (this.selectorData) this.initDataMap(this.selectorData);
      if (this.defaultCheckedAll && this.selectorData[0]) this.setDefaultCheckedKeys(this.selectorData[0].children);
    },
    /**
     * @description 移除设置的选中
     */
    removeCheckedKeys(val) {
      delete this.checkedFileMap[val.id];
      this.$refs.leftInnerTree.setChecked(val.id, false);
      this.getAllCheckedFiles();
    },
    /**
     * 设置数据 map
     */
    initDataMap(list, init = true) {
      // 存一份 map，便于设置选中的时候查找
      if (init) this.selectorDataMap = {};
      if (list && list.length) {
        list.forEach((item) => {
          this.selectorDataMap[item.id] = item;
          if (item.children) this.initDataMap(item.children, false);
        });
      }
    },
    /**
     * @description 设置默认的选中
     */
    setDefaultCheckedKeys(list) {
      if (list && list.length) {
        list.forEach((item) => {
          const {
            id, name, totalNum, totalTaskItemNum
          } = item;
          this.$set(this.checkedFileMap, item.id, {
            id, label: name, idsIn: [], idsNotIn: [], isIndeterminate: false, checkedAll: true, checkedNum: totalNum || totalTaskItemNum,
          });
        });
      }
      this.getAllCheckedFiles();
    },
    /**
     * @description 获取所有选中的文件
     */
    getAllCheckedFiles() {
      const currentCheckedMap = { ...this.checkedFileMap };
      const tempArr = [];
      Object.keys(currentCheckedMap).forEach((key) => {
        const currentItem = currentCheckedMap[key];
        if (currentItem.checkedAll || currentItem.checkedNum) {
          tempArr.push(currentItem);
        }
      });
      if (this.ifEmitData) this.$emit('file-change', tempArr);
    },
    /**
     * @description 将当前所有的文件id放进一个数组
     */
    getAllIds(records) {
      return records.map((item) => {
        item.checked = false;
        return item.id;
      });
    },
    /**
     * @param ids 当前一项的ids
     * @param allIds 拉取回来的所有ids
     * @description 删除已经在远程被删除的文件ids
     */
    throwDeletedIds(ids = [], allIds = []) {
      for (let i = 0; i < ids.length; i += 1) {
        if (allIds.indexOf(ids[i]) === -1) {
          ids.splice(i, 1);
          i -= 1;
        }
      }
      return ids;
    },
    /**
     * @param node 左边任务或者文件夹的节点
     * @description 拉取对应节点下的文件列表
     */
    fetchFileList(node) {
      if (!this.fileListGetter) return;
      const { id, label } = node;
      const param = this.isFileAnalysisSer ? { parentId: id, pageNo: 1, pageSize: 10000 } : { taskId: id, pageNo: 1, pageSize: 10000 };
      // this.fileListGetter({ taskIds: [id], containDeletedSource: true }).then((res) => {
      this.fileListGetter(param).then((res) => {
        if (res.code === 0) {
          let { records, totalRecords } = res.data;//eslint-disable-line
          totalRecords = totalRecords || records.length;
          const checkInfo = this.checkedFileMap[id];
          const allIds = this.getAllIds(records);
          if (checkInfo) {
            // 去遍历一下选中的文件，如果重新请求回来的数据中，已经删除了一些文件，就需要去除选中。
            let { checkedAll, idsIn, idsNotIn } = checkInfo; //eslint-disable-line
            this.$set(node, 'checkedAll', checkedAll);
            // 处理选中情况
            if (checkedAll) { // 全选，但有不选中的情况
              this.idsNotInFn(idsNotIn, allIds, totalRecords, checkInfo, node);
            } else { // 没有全选，且 有选中的情况
              this.idsInFn(idsIn, allIds, totalRecords, checkInfo, node);
            }
          } else {
            this.$set(this.checkedFileMap, this.currentCheckedNode.id, {
              ...this.tempCheckedInfo, id, label, idsIn: [], idsNotIn: [],
            });
            this.checkFileAll = false;
            this.checkedFileKeys = [];
            // 如果是任务模式，初始的时候需要选中所有
            if (this.chooseFileMode && node.checked) {
              this.$set(this.checkedFileMap, this.currentCheckedNode.id, {
                id, label, checkedAll: true, idsIn: [], idsNotIn: [], isIndeterminate: false, checkedNum: totalRecords,
              });
              this.$refs.fileListTree.setCheckedKeys('ALL');
              this.checkFileAll = true;
              this.checkedFileKeys = 'ALL';
              if (this.ifEmitData) this.getAllCheckedFiles();
            }
          }
          this.fileList = records;
          this.totalRecords = totalRecords || this.fileList.length;
          this.fileLoading = false;
        }
      });
    },
    /**
     * @description idsIn
     */
    idsInFn(idsIn, allIds, totalRecords, checkInfo, node) {
      idsIn = this.throwDeletedIds(idsIn, allIds);
      checkInfo.checkedNum = idsIn.length;
      if (idsIn.length === totalRecords) { // 全选 去掉选
        // 全选
        checkInfo.checkedAll = true;
        this.$set(node, 'checkedAll', true);
        checkInfo.isIndeterminate = false;
        this.checkedFileKeys = 'ALL';
        this.checkFileAll = true;
      } else if (!idsIn.length) {
        // 全不选
        checkInfo.isIndeterminate = false;
        this.checkedFileKeys = [];
        this.checkFileAll = false;
      } else {
        this.checkFileAll = false;
        this.checkedFileKeys = idsIn;
      }
    },
    /**
     * @description idsNotIn
     */
    idsNotInFn(idsNotIn, allIds, totalRecords, checkInfo, node) {
      idsNotIn = this.throwDeletedIds(idsNotIn, allIds);
      checkInfo.checkedNum = totalRecords - idsNotIn.length;
      this.checkFileAll = true;
      if (idsNotIn.length === totalRecords) {
        // 全不选
        checkInfo.checkedAll = false;
        this.checkFileAll = false;
        this.$set(node, 'checkedAll', false);
        checkInfo.isIndeterminate = false;
        this.checkedFileKeys = [];
      } else if (!idsNotIn.length) {
        // 全选
        checkInfo.isIndeterminate = false;
        this.checkedFileKeys = 'ALL';
      } else {
        const ids = allIds.filter((item) => idsNotIn.indexOf(item) === -1);
        this.checkedFileKeys = ids;
        this.checkFileAll = false;
      }
    },
    handleLeftFilterNodesAllCheckChange(nodes) {
      if (!Array.isArray(nodes)) return;
      nodes.forEach((node) => {
        this.handleTaskCheckChange(node);
      });
    },
    /**
     * @description 任务选择checkchange
     */
    handleTaskCheckChange(node) {
      if (!node) return;
      const {
        id, name, checked
      } = node;
      if (id === this.rootId) {
        this.selectorData[0].children.forEach((item) => {
          item.checked = checked;
          this.handleTaskCheckChange(item);
        });
      } else {
        if (node.id === this.currentCheckedNode.id) { //eslint-disable-line
          this.checkFileAll = checked;
          this.handleCheckAllChange(checked);
        } else {
          this.$set(this.checkedFileMap, id, {
            id, label: name, checkedAll: checked, isIndeterminate: false, idsIn: [], idsNotIn: [], checkedNum: checked ? (node.totalNum || node.totalTaskItemNum) : ''
          });
        }
      }
      if (this.ifEmitData) this.getAllCheckedFiles();
    },
    handleRightFilterNodesAllCheckChange(nodes, checked) {
      if (!Array.isArray(nodes)) return;
      this.handleFileCheckChange(nodes, checked);
    },
    /**
     * @description 文件选择checkchange
     */
    handleFileCheckChange(fileItem, bool) {
      console.log(fileItem, bool);
      if (!fileItem) return;
      const { id, name } = this.currentCheckedNode;
      let { checkedAll, isIndeterminate, idsIn, idsNotIn, checkedNum } = this.checkedFileMap[id]; // eslint-disable-line
      const fileItems = Array.isArray(fileItem) ? fileItem : [fileItem];
      fileItems.forEach((item) => {
        const fileItemId = item.id;
        if (bool) { // 增加选中的情况
          checkedNum += 1;
          const index = idsNotIn.indexOf(fileItemId);
          if (index > -1) {
            idsNotIn.splice(index, 1);
          } else if (idsIn.indexOf(fileItemId) === -1) {
            idsIn.push(fileItemId);
          }
        } else { // 减少选中的情况
          checkedNum -= 1;
          const index = idsIn.indexOf(fileItemId);
          if (index > -1) {
            idsIn.splice(index, 1);
          } else if (checkedNum > 0 && idsNotIn.indexOf(fileItemId) === -1) {
            idsNotIn.push(fileItemId);
          }
        }
      });
      console.log('isIndeterminate', checkedNum > 0 && this.totalRecords > checkedNum);
      if (checkedNum > 0 && this.totalRecords > checkedNum) { // 半选
        isIndeterminate = true;
      } else {
        isIndeterminate = false;
        checkedAll = !!checkedNum;
        console.log(checkedAll, checkedNum, !!checkedNum);
        this.checkFileAll = checkedAll;
        if (checkedAll) {
          idsIn = [];
          this.checkedFileMap[id].idsIn = [];
        }
        this.$set(this.currentCheckedNode, 'checkedAll', checkedAll);
      }
      this.$set(this.checkedFileMap, id, {
        id, label: name, checkedAll, isIndeterminate, idsIn, idsNotIn, checkedNum
      });
      this.$refs.leftInnerTree.setChecked(this.currentCheckedNode.id, checkedNum && !isIndeterminate);
      this.$refs.leftInnerTree.setNodeAttributeByKey(this.currentCheckedNode.id, 'indeterminate', isIndeterminate);
      if (this.ifEmitData) this.getAllCheckedFiles();
    },
    /**
     * @description 点击树的节点方法
     */
    handleNodeClick(node) {
      if ((this.chooseFileMode && node.id !== this.rootId) || !this.chooseFileMode) {
        // 如果没有节点或者点击跟上次相同的节点，不处理
        if (node && this.currentCheckedNode.id === node.id) {
          if (this.chooseFileMode) {
            this.showFileList = !this.showFileList;
          } else {
            this.showFileList = true;
          }
          this.$nextTick(() => {
            this.resizeFileListHeight();
          });
          return;
        }
        this.seachFileText = '';
        this.currentCheckedNode = node;
        this.fileLoading = true;
        this.showFileList = true;
        this.fetchFileList(node);
        this.resizeFileListHeight();
      } else {
        this.showFileList = false;
      }
    },
    /**
     * @description 显示为文件夹的时候，右边需要单独的全选逻辑
     */
    handleCheckAllChange(bool) {
      this.fileList.forEach((file) => this.$set(file, 'checked', bool));
      const { id, label } = this.currentCheckedNode;
      this.$set(this.checkedFileMap, this.currentCheckedNode.id, {
        ...this.tempCheckedInfo, id, label, idsIn: [], idsNotIn: [], checkedAll: bool, checkedNum: bool ? this.totalRecords : 0
      });
      const temp = bool ? 'ALL' : [];
      this.checkedFileKeys = temp;
      this.$refs.fileListTree.setCheckedKeys(temp);
      if (this.chooseFileMode) {
        this.$refs.leftInnerTree.setChecked(this.currentCheckedNode.id, bool);
      }
      if (this.ifEmitData) this.getAllCheckedFiles();
    },
    /**
     * @description 点击组件外部
     */
    handleClickOutside() {
      this.showFileList = false;
    },
    fileListTreeReadyFn() {
      this.$refs.fileListTree.setCheckedKeys(this.checkedFileKeys);
    },
    /**
     * @description 重新设置树的高度
     */
    resizeFileListHeight() {
      this.$refs.fileListTree.resize();
    },
    resizeLeftListHeight() {
      this.$refs.leftInnerTree.resize();
    },
    /**
     * 设置选中
     * @param { Array } keys
     * 传入数据为一个数组 每个对应的是一个文件夹的选中情况
     *  [{
     *    id: '任务或文件夹 id', // 必须
     *    idsIn: ['文件id1', '文件id2'], // 如果全选就可以不传
     *  }]
     */
    setCurrentKeysToTree(newItem, item, index) {
      this.$set(this.checkedFileMap, item.id, newItem);
      // // 设置树的选中
      this.$refs.leftInnerTree.setChecked(newItem.id, newItem.checkedNum && !newItem.isIndeterminate);
      this.$refs.leftInnerTree.setNodeAttributeByKey(newItem.id, 'indeterminate', newItem.isIndeterminate);
      if (index === 0) {
        this.$refs.leftInnerTree.setCurrentKey(item.id);
        this.$nextTick(() => {
          console.log(this.$refs.leftInnerTree.getCurrentNode());
          this.handleNodeClick(this.$refs.leftInnerTree.getCurrentNode());
        });
      }
    },
    setCheckedKeys(keys = 'ALL') {
      if (keys === 'ALL') {
        if (this.selectorData[0]) this.setDefaultCheckedKeys(this.selectorData[0].children);
        this.$refs.leftInnerTree.setCheckedKeys('ALL');
      } else {
        this.checkedFileMap = {};
        // 清空复选框的选中状态
        this.$refs.leftInnerTree.setCheckedKeys();
        // 没有复选框的情况清空选中
        this.$refs.leftInnerTree.setCurrentKey();
        this.currentCheckedNode = {};
        this.fileList = [];
        this.checkFileAll = false;
        keys.forEach((item, index) => {
          const originItem = this.selectorDataMap && this.selectorDataMap[item.id];
          if (originItem) {
            item.label = originItem.label;
            const {
              id, label, idsIn = [], idsNotIn = []
            } = item;
            if (idsNotIn.length) {
              const newItem = {
                id, label, idsIn: [], idsNotIn, isIndeterminate: true
              };
              newItem.checkedAll = true;
              newItem.checkedNum = originItem.totalTaskItemNum - idsNotIn.length;
              this.setCurrentKeysToTree(newItem, item, index);
            } else {
              const selectAll = idsIn.length === (originItem.totalNum || originItem.totalTaskItemNum);
              const newItem = {
                id, label, idsIn: selectAll ? [] : idsIn, idsNotIn: [], isIndeterminate: false
              };
              if (idsIn.length && !selectAll) newItem.isIndeterminate = true;
              newItem.checkedAll = !newItem.isIndeterminate;
              newItem.checkedNum = idsIn.length || ((this.countsMap && this.countsMap[item.id]) || originItem.totalNum || originItem.totalTaskItemNum);
              this.setCurrentKeysToTree(newItem, item, index);
            }
          }
        });
        if (this.ifEmitData) this.getAllCheckedFiles();
      }
    }
  }
};
</script>

<style lang="scss">
.file-list-container.task-mode {
  display: flex;
  height: 100%;
  > div {
    flex: 1;
    height: 100%;
    box-sizing: border-box;
  }
  .left-inner-container {
    border-right: 1px solid #dce1e5;
    .left-inner-content {
      padding: 13px 15px 0;
      display: flex;
      flex-direction: column;
      .file-tree-search {
        padding-bottom: 13px;
      }
      .file-tree-content {
        flex: 1;
      }
    }
  }
  .inner-header {
    height: 36px;
    background: #f7f8f9;
    line-height: 36px;
    text-indent: 20px;
    color: rgba(67, 80, 104, 0.3);
    .reset-button {
      float: right;
      cursor: pointer;
      margin-right: 10px;
      color: #21539b;
    }
  }
}
.file-list-container.file-mode {
  .right-inner-container {
    position: absolute;
    left: 100%;
    top: 0;
    width: 320px;
    margin-left: -1px;
    border: 1px solid #dce1e5;
  }
  .left-inner-container {
    border: 1px solid #dce1e5;
    padding: 13px 15px 0;
  }
  .right-inner-container {
    padding: 0 15px;
  }
  .inner-header {
    height: 50px;
  }
}
.file-list-container {
  height: 100%;
  width: 100%;
  position: relative;
}
.right-inner-container {
  height: 100%;
  box-sizing: border-box;
  background: #fff;
  z-index: 1;
  display: flex;
  flex-direction: column;
  .right-inner-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    .file-tree-content {
      flex: 1;
      &.hide-header {
        padding: 0 15px 0 15px;
      }
    }
    .custom-tree-node {
      display: flex;
      .item-icon {
        margin: 0 2px 0 6px;
        position: relative;
        top: -1px;
      }
      .item-name {
        width: 148px;
      }
      .item-creator {
        width: 69px;
        margin-left: 14px;
        text-align: right;
        padding-right: 10px;
        box-sizing: border-box;
      }
    }
    .file-tree-search {
      display: flex;
      padding: 12px 15px;
    }
    .file-tree-search.no-padding-around {
      padding: 12px 0;
    }
    .file-tree-header {
      height: 34px;
      line-height: 34px;
      padding: 0 16px;
      background: #f9f9f9;
      color: #8a97a0;
      .name-title {
        float: right;
      }
    }
  }
}
.left-inner-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  .left-inner-content {
    flex: 1;
    .custom-tree-node {
      display: flex;
      width: calc(100% - 24px);
      box-sizing: border-box;
      .item-name {
        flex: 1;
        margin-left: 4px;
      }
      .item-count {
        width: 39px;
        margin-left: 23px;
        margin-right: 8px;
        text-align: right;
        color: #869abb;
      }
      .item-icon {
        min-width: 12px;
      }
    }
  }
}
</style>
