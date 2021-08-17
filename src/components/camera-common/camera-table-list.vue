<template>
  <div
    class="camera-data-table"
    :class="{'tableDisabled':!isDisabled}"
    v-loading="isLoading">
    <meg-table
      v-show="!tableSelect"
      stripe
      empty-text=""
      height="100%"
      row-key="id"
      @sort-change="onSortChange"
      :data="tableData">
      <div
        slot="empty"
        v-if="tableData.length === 0 &&!isLoading"
        v-background="{ icon:'icon_4', text:$t('检索无结果')}">
      </div>
      <meg-table-column
        v-for="item in tableConfig"
        :key="item.id"
        :label="item.label"
        :align="item.align"
        :width="item.width"
        :prop="item.prop"
        :sortable="item.sortable">
        <template slot-scope="scope">
          <!-- 相机类型需要转换 -->
          <p
            v-tooltip="true"
            v-if="item.id===2">
            {{ cameraTypeOption[scope.row.type] }}
          </p>
          <!-- 相机运行状态需要转换 -->
          <p
            v-tooltip="true"
            v-else-if="item.id===3">
            <span
              v-show="!scope.row.closed"
              :style="processColor(scope.row.status)">{{ processStatus[scope.row.status] }}</span>
            <span v-show="scope.row.closed">— —</span>
          </p>
          <p
            class="camera-url"
            v-else-if="item.id===4">
            <span
              v-tooltip="true">
              {{ scope.row.url }}
            </span>
            <meg-button
              type="text"
              v-if="scope.row.url"
              @click="copy(scope.row.url)"
              class="copy-button">
              {{ $t('复制') }}
            </meg-button>
          </p>
          <p v-else-if="item.id===6">
            {{ manufacturesrsType[scope.row.manufacturer] }}
          </p>
          <!-- 智能盒运行状态需要转换 -->
          <p
            v-else-if="item.id===10"
            :style="processColor(scope.row.status)">
            {{ processStatus[scope.row.status] }}
          </p>
          <p
            v-else
            v-tooltip="true">
            {{ scope.row[item.prop] }}
          </p>
        </template>
      </meg-table-column>
      <meg-table-column
        :label="$t('操作')"
        align="center"
        width="200">
        <template slot-scope="scope">
          <meg-button
            type="text"
            @click="viewDevice(scope.row)">
            {{ $t('详情') }}
          </meg-button>
          <meg-button
            type="text"
            @click="editDevice(scope.row)">
            {{ $t('编辑') }}
          </meg-button>
          <meg-dropdown
            class="more-dropdown"
            placement="bottom"
            @command="deviceAction">
            <span class="meg-dropdown-link action">
              {{ $t('更多') }}<i class="meg-icon-arrow-down meg-icon--right meg-dropdown-link-icon"></i>
            </span>
            <meg-dropdown-menu slot="dropdown">
              <meg-dropdown-item
                v-show="isCamera"
                class="action"
                :command="{action:'config', info: scope.row}">
                {{ $t('配置') }}
              </meg-dropdown-item>
              <meg-dropdown-item
                v-show="isCamera && [1,2,3,10].includes(scope.row.bayonetType) && scope.row.lon && scope.row.lat"
                class="action"
                :command="{action:'space', info: scope.row}">
                {{ $t('小时空') }}
              </meg-dropdown-item>
              <meg-dropdown-item
                class="action"
                :command="{action:'delete', id: scope.row.id}">
                {{ $t('删除') }}
              </meg-dropdown-item>
            </meg-dropdown-menu>
          </meg-dropdown>
        </template>
      </meg-table-column>
    </meg-table>
    <meg-table
      v-show="tableSelect"
      ref="cameraTable"
      stripe
      empty-text=""
      height="100%"
      row-key="id"
      @sort-change="onSortChange"
      @selection-change="handleSelectionChange"
      :data="tableData">
      <div
        slot="empty"
        v-if="tableData.length === 0 &&!isLoading"
        v-background="{ icon:'icon_4', text:$t('检索无结果')}">
      </div>
      <!--点击选择的时候出现的多选框-->
      <meg-table-column
        type="selection"
        :selectable="unChecked"
        reserve-selection
        label-class-name="tableClass"
        align="left"
        :fixed="true"
        width="30">
      </meg-table-column>
      <meg-table-column
        v-for="item in tableConfig"
        :key="item.id"
        :label="item.label"
        :align="item.align"
        :width="item.width"
        :prop="item.prop"
        :sortable="item.sortable">
        <template slot-scope="scope">
          <!-- 相机类型需要转换 -->
          <p
            v-tooltip="true"
            v-if="item.id===2">
            {{ cameraTypeOption[scope.row.type] }}
          </p>
          <!-- 相机运行状态需要转换 -->
          <p
            v-tooltip="true"
            v-else-if="item.id===3">
            <span
              v-show="!scope.row.closed"
              :style="processColor(scope.row.status)">{{ processStatus[scope.row.status] }}</span>
            <span v-show="scope.row.closed">— —</span>
          </p>
          <p
            class="camera-url"
            v-else-if="item.id===4">
            <span
              v-tooltip="true">
              {{ scope.row.url }}
            </span>
            <meg-button
              type="text"
              v-if="scope.row.url"
              @click="copy(scope.row.url)"
              class="copy-button">
              {{ $t('复制') }}
            </meg-button>
          </p>
          <p v-else-if="item.id===6">
            {{ manufacturesrsType[scope.row.manufacturer] }}
          </p>
          <!-- 智能盒运行状态需要转换 -->
          <p
            v-else-if="item.id===10"
            :style="processColor(scope.row.status)">
            {{ processStatus[scope.row.status] }}
          </p>
          <p
            v-else
            v-tooltip="true">
            {{ scope.row[item.prop] }}
          </p>
        </template>
      </meg-table-column>
      <meg-table-column
        :label="$t('操作')"
        align="center"
        width="200">
        <template slot-scope="scope">
          <meg-button
            type="text"
            @click="viewDevice(scope.row)">
            {{ $t('详情') }}
          </meg-button>
          <meg-button
            type="text"
            @click="editDevice(scope.row)">
            {{ $t('编辑') }}
          </meg-button>
          <meg-dropdown
            class="more-dropdown"
            placement="bottom"
            @command="deviceAction">
            <span class="meg-dropdown-link action">
              {{ $t('更多') }}<i class="meg-icon-arrow-down meg-icon--right"></i>
            </span>
            <meg-dropdown-menu slot="dropdown">
              <meg-dropdown-item
                v-show="isCamera"
                class="action"
                :command="{action:'config', info: scope.row}">
                {{ $t('配置') }}
              </meg-dropdown-item>
              <meg-dropdown-item
                v-show="isCamera && [1,2,3,10].includes(scope.row.bayonetType) && scope.row.lon && scope.row.lat"
                class="action"
                :command="{action:'space', info: scope.row}">
                {{ $t('小时空') }}
              </meg-dropdown-item>
              <meg-dropdown-item
                class="action"
                :command="{action:'delete', id: scope.row.id}">
                {{ $t('删除') }}
              </meg-dropdown-item>
            </meg-dropdown-menu>
          </meg-dropdown>
        </template>
      </meg-table-column>
    </meg-table>
  </div>
</template>

<script>
import { utils } from '@/utils/utils';

export default {
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    isCamera: {
      type: Boolean,
      default: false
    },
    tableConfig: {
      type: Array,
      default: () => []
    },
    tableData: {
      type: Array,
      default: () => []
    },
    tableSelect: {
      type: Boolean,
      default: false
    },
    allChecked: {
      type: Boolean,
      default: false
    },
    /**
     * 相机权限集
     */
    cameraAuth: {
      type: Object,
      default: () => {}
    },
    manufactureOption: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // table tootip补空格
      tooltipFtr: utils.tooltipFtr,
      tableId: +new Date(),
      processStatus: {}
    };
  },
  computed: {
    isSelection() {
      return this.tableSelect ? 'selection' : '';
    },
    manufacturesrsType() {
      const arr = {};
      this.manufactureOption.forEach((item) => {
        arr[item.code] = item.value;
      });
      return arr;
    },
    cameraTypeOption() {
      const arr = {};
      this.$store.getters.dataMapByType('camera_type').forEach((item) => {
        arr[item.code] = item.value;
      });
      return arr;
    },
    /**
     *  禁止点选标签
     */
    isDisabled() {
      if (this.allChecked) {
        return false;
      }
      return true;
    },
  },
  watch: {
    /**
     * 当相机选择状态改变需要更新key
     */
    tableSelect() {
      this.tableId = +new Date();
    }
  },
  created() {
    this.initFormat();
  },
  methods: {
    /**
     * @description 复制
     * @param {string} url
     * @returns
     */
    copy(url) {
      this.$clipboard(url).then(() => {
        this.$message({
          type: 'success',
          message: this.$t('复制成功')
        });
      }, () => {
        this.$message({
          type: 'error',
          message: this.$t('复制失败')
        });
      });
    },

    /**
     * 格式化字典表
     */
    initFormat() {
      this.$store.getters.dataMapByType('rainbow_camera_status').forEach((item) => {
        this.processStatus[item.code] = item.value;
      });
    },
    /**
     * 清除用户选中
     */
    clearSort() {
      this.$refs.cameraTable.clearSort();
    },
    /**
     * 当前页取消全选
     */
    clearSelection() {
      this.$refs.cameraTable.clearSelection();
    },
    /**
     * 需要选中的列
     */
    toggleRowSelection(list, type) {
      this.$refs.cameraTable.toggleRowSelection(list, type);
    },
    /**
     *  禁止点选标签
     */
    unChecked() {
      if (this.allChecked) {
        return false;
      }
      return true;
    },
    /**
     * table排序
     */
    onSortChange({ prop, order }) {
      this.$emit('on-sort-change', prop, order);
    },
    /**
     * 处理相机列表选中的状态
     */
    handleSelectionChange(rows) {
      this.$emit('handle-selection-change', rows);
    },
    /**
     * 更多操作
     *  @param {Object} data 当前选中节点
     */
    deviceAction(data) {
      if (data.action === 'delete') {
        this.$emit('delete-device', [data.id]);
      }
      if (data.action === 'config') {
        this.$emit('config-device', data.info.id);
      }
      if (data.action === 'space') {
        this.$emit('open-space-time', data.info);
      }
    },
    /**
     * 查看详情
     */
    viewDevice(data) {
      this.$emit('view-device', data);
    },
    /**
     * 编辑相机
     */
    editDevice(data) {
      this.$emit('edit-device', data);
    },
    /**
     * 根据status进行展示
     *  @param {String} status 相机所在行数据
     */
    processColor(status) {
      const curStatus = `${status}`;
      if (curStatus === '1') {
        // 异常 红
        return 'color:#F56C6C';
      } if (curStatus === '0') {
        // 开启和在线 绿
        return 'color:#67C23A';
      }
      return 'color:#F56C6C';
    },
  }
};
</script>

<style lang="scss">
.camera-data-table {
  flex: 1;
  display: flex;
  flex-direction: column;

  &.tableDisabled .tableClass {
    .meg-checkbox__inner {
      background-color: #95a9ca;
      border-color: transparent;
      cursor: no-drop;
    }

    .is-indeterminate .meg-checkbox__inner::before {
      box-sizing: content-box;
      content: "";
      border: 1px solid #fff;
      border-left: 0;
      border-top: 0;
      height: 7px;
      left: 4px;
      position: absolute;
      top: 1px;
      width: 3px;
      transition: transform 0.15s ease-in 0.05s;
      transform-origin: center;
      background: none;
      transform: rotate(45deg) scaleY(1);
      border-width: 2px;
    }
  }

  .more-dropdown {
    margin-left: 12px;
    .meg-dropdown-link {
      cursor: pointer;
      display: flex;
      align-items: center;
      .meg-dropdown-link-icon {
        margin-left:2px;
        font-size: 12px;
      }
    }
    .meg-dropdown-link.meg-dropdown-selfdefine {
      color: #21539b !important;
    }
  }

  .camera-url {
    display: flex;
    width: 100%;

    & > span {
      width: calc(100% - 30px);
      line-height: 34px;
    }

    &:hover {
      .copy-button {
        display: block;
      }
    }

    .copy-button {
      display: none;
    }
  }
}
</style>
