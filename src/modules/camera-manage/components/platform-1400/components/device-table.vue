<template>
  <div class="device-table">
    <header class="device-table-top">
      <div>
        <meg-checkbox
          @change="toggleSelection"
          v-model="allChecked">
          {{ $t('跨页全选') }}
        </meg-checkbox>
        <span class="un-select">{{ $t('已选择') }}{{ allChecked ? total : selectCameraList.length }}{{ $t('个相机') }}</span>
      </div>
      <div>
        <meg-button
          v-show="isSelected"
          type="primary"
          @click="openBatchModifyDialog(true)">
          {{ $t('变更卡口类型') }}
        </meg-button>
        <meg-button
          v-show="isSelected"
          type="primary"
          @click="openBatchModifyDialog(false)">
          {{ $t('变更归属') }}
        </meg-button>
        <meg-button
          v-show="isSelected"
          @click="batchDelete">
          {{ $t('批量删除') }}
        </meg-button>
        <meg-button
          v-show="isSelected"
          @click="exitSelect">
          {{ $t('退出选择') }}
        </meg-button>
      </div>
    </header>
    <meg-table
      :data="cameraList"
      stripe
      height="100%"
      :key="tableId"
      @selection-change="selectionChange"
      ref="cameraTable"
      :class="['device-table-box',{'table-disabled-inner': allChecked}]"
      row-key="id">
      <meg-table-column
        type="selection"
        :selectable="unChecked"
        :reserve-selection="true"
        label-class-name="table-class"
        align="left"
        :fixed="true"
        width="30">
      </meg-table-column>
      <meg-table-column
        v-for="item in columns"
        :label="item.label"
        :key="item.label"
        :prop="item.prop">
      </meg-table-column>
      <meg-table-column :label="$t('责权部门')">
        <template v-slot="{ row }">
          <meg-select
            @change="deptChang(row)"
            v-model="row.deptId">
            <meg-option
              v-for="item in deptList"
              :label="item.orgName"
              :value="item.id"
              :key="item.id">
            </meg-option>
          </meg-select>
        </template>
      </meg-table-column>
      <meg-table-column
        :label="$t('卡口类型')">
        <template v-slot="{ row }">
          {{ bayonetType[row.bayonetType] }}
        </template>
      </meg-table-column>
      <meg-table-column
        :label="$t('操作')"
        width="150"
        align="center">
        <template slot-scope="scope">
          <meg-button
            type="text"
            @click="deleteCamera(scope.row)">
            {{ $t('删除') }}
          </meg-button>
        </template>
      </meg-table-column>
    </meg-table>
    <meg-pagination
      :total="total"
      class="table-pagination"
      :page-sizes="[20,50,100]"
      :current-page.sync="listPagerInfo.pageNo"
      :page-size="listPagerInfo.pageSize"
      @size-change="sizeChange"
      @current-change="currentChange">
    </meg-pagination>
  </div>
</template>

<script>
export default {
  name: 'DeviceTable',
  components: {},
  props: {
    columns: {
      type: Array,
      default: () => []
    },
    cameraList: {
      type: Array,
      default: () => [],
    },
    total: {
      type: Number,
      default: 1000
    },
    platformType: {
      type: String,
      default: 'gb'
    },
    deptList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      selectCameraList: [],
      tableId: `${new Date()}`,
      listPagerInfo: {
        pageNo: 1,
        pageSize: 20,
      },
      allChecked: false,
      // 卡口类型
      bayonetType: {},
    };
  },
  computed: {
    isSelected() {
      return Boolean(this.allChecked || this.selectCameraList.length);
    }
  },
  watch: {
    cameraList: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.toggleSelection();
        });
      }
    }
  },
  created() {},
  mounted() {
    this.$store.getters.dataMapByType('bayonet_type').forEach((val) => {
      this.bayonetType[val.code] = val.value;
    });
  },
  methods: {
    /**
     * 责权部门改变事件
     */
    deptChang(row) {
      this.$emit('dept-change', row);
    },
    /**
     * @description 按照码表转换卡口类型
     * @param {Object} data 行数据
     */
    transFormType(data) {
      return data.address;
    },
    /**
     * @description 选择的相机发生变化时触发
     * @param {Array} selection
     * @returns
     */
    selectionChange(selection) {
      this.selectCameraList = selection;
      this.$emit('btn-status', this.selectCameraList.length === 0);
    },
    /**
     * @description 打开批量修改归属弹窗
     */
    openBatchModifyDialog(type) {
      this.$emit('show-batch-modify-dialog', type);
    },
    /**
     * 退出选择
     */
    exitSelect() {
      this.$refs.cameraTable.clearSelection();
      this.allChecked = false;
      this.selectCameraList = [];
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
     * @description 删除相机
     * @param {Object} data 当前行数据
     */
    deleteCamera(data) {
      this.$emit('delete-camera', [data.gbDeviceId]);
    },
    batchDelete() {
      this.$emit('delete-camera', this.selectCameraList.map((item) => item.gbDeviceId));
    },
    /**
     * 列表分页条数
     */
    sizeChange(size) {
      this.listPagerInfo = {
        pageSize: size,
        pageNo: 1
      };
      this.getCameraListInRight();
    },
    /**
     * 列表当前页
     */
    currentChange(page) {
      this.listPagerInfo = {
        pageSize: this.listPagerInfo.pageSize,
        pageNo: page
      };
      this.getCameraListInRight();
    },
    /**
     * @description 重置分页以及所选择的
     */
    resetListPageInfo() {
      this.listPagerInfo = {
        pageSize: 20,
        pageNo: 1
      };
      this.selectCameraList = [];
    },
    /**
     * @description 获取相机列表（右侧）
     */
    getCameraListInRight() {
      this.$emit('get-camera-list-in-right', this.listPagerInfo);
    },
    /**
     * @description 切换全选
     */
    toggleSelection() {
      const { cameraTable } = this.$refs;
      if (this.allChecked) {
        this.cameraList.forEach((row) => {
          cameraTable.toggleRowSelection(row, true);
        });
      } else {
        cameraTable.clearSelection();
      }
    },
    /**
     * @description 传输目前的选择条件，包括是否全选，以及所选择的相机
     * @returns {Object}
     */
    getSelected() {
      return {
        allChecked: this.allChecked,
        selectCameraList: this.selectCameraList
      };
    },
  },
};
</script>
<style lang="scss" scoped>
.device-table {
  flex: 1;
  overflow: hidden;
  border-radius: 2px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .device-table-box {
    flex: 1;
    border-top: 1px solid #dce1e5;
  }
  .device-table-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 15px;
    padding-right: 20px;
    height: 50px;
    .un-select{
      user-select: none;
    }
  }
  .table-pagination {
    padding: 8px 0
  }
}
</style>
<style lang="scss">
.device-table {
  .table-disabled-inner .table-class {
    .meg-checkbox__inner {
      background-color: #95a9ca;
      border-color: transparent;
      cursor: no-drop;
    }
    .is-indeterminate .meg-checkbox__inner:before {
      box-sizing: content-box;
      content: "";
      border: 1px solid rgb(71, 64, 64);
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
}
</style>
