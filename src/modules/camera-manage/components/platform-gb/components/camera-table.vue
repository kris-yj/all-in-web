<template>
  <div class="camera-table">
    <div class="table-header">
      <div class="check-length">
        <meg-checkbox
          v-model="crossPageCheck"
          @change="crossPageCheckChange">
          {{ $t("跨页全选") }}
        </meg-checkbox>
        <span>{{ $t("已选择{count}个相机", { count: selectLength }) }}</span>
        <span></span>
      </div>
      <div class="button-group">
        <meg-button
          type="primary"
          class="syncDept-button"
          v-show="isSelected"
          @click="batchModify(true)">
          {{ $t("变更卡口类型") }}
        </meg-button>
        <meg-button
          type="primary"
          class="syncDept-button"
          v-show="isSelected"
          @click="batchModify(false)">
          {{ $t("变更归属") }}
        </meg-button>
        <meg-button
          class="syncDept-button"
          v-show="isSelected"
          @click="batchDelete">
          {{ $t("批量删除") }}
        </meg-button>
        <meg-button
          class="syncDept-button"
          v-show="isSelected"
          @click="exitSelect">
          {{ $t("退出选择") }}
        </meg-button>
        <meg-checkbox
          v-model="syncStatus">
          {{ $t("筛选未同步的相机") }}
        </meg-checkbox>
      </div>
    </div>
    <div class="table-body">
      <meg-table
        ref="table"
        row-key="id"
        height="100%"
        stripe
        :key="tableId"
        :data="dataList"
        :class="[
          'device-table-box',
          { 'table-disabled-inner': crossPageCheck },
        ]"
        @selection-change="selectionChange">
        <meg-table-column
          type="selection"
          width="30"
          align="left"
          label-class-name="table-class"
          :fixed="true"
          :selectable="checkSelectable"
          :reserve-selection="true">
        </meg-table-column>
        <meg-table-column
          v-for="title in columns"
          :label="title.label"
          :key="title.label"
          :prop="title.prop">
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

        <meg-table-column :label="$t('卡口类型')">
          <template v-slot="{ row }">
            {{ bayonetType[row.bayonetType] }}
          </template>
        </meg-table-column>
        <meg-table-column
          label="操作"
          width="150"
          align="center">
          <template slot-scope="scope">
            <meg-button
              type="text"
              @click="deleteCamera(scope.row)">
              {{ $t("删除") }}
            </meg-button>
          </template>
        </meg-table-column>
      </meg-table>
    </div>
    <meg-pagination
      class="table-pagination"
      align="center"
      :total="total"
      :page-sizes="[20, 50, 100]"
      :current-page.sync="pageInfo.pageNo"
      :page-size="pageInfo.pageSize"
      @size-change="pageSizeChange"
      @current-change="pageCurrentChange">
    </meg-pagination>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    dataList: {
      type: Array,
      default: () => [],
    },
    total: {
      type: Number,
      default: 0,
    },
    deptList: {
      type: Array,
      default: () => [],
    },
    disableSync: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      columns: [
        {
          prop: 'name',
          label: this.$t('相机名称'),
        },
        {
          prop: 'gbDeviceId',
          label: this.$t('国标编码'),
        },
      ],
      selectable: true,
      bayonetType: {}, // 卡口类型
      tableId: `${new Date()}`,
      crossPageCheck: false, // 跨页全选
      pageInfo: {
        pageNo: 1,
        pageSize: 20,
      },
      selectData: [],
      syncStatus: false, // 过滤已同步状态
    };
  },
  computed: {
    selectLength() {
      return this.crossPageCheck ? this.total : this.selectData.length;
    },
    isSelected() {
      return Boolean(this.crossPageCheck || this.selectData.length);
    }
  },
  watch: {
    'selectData.length': function (val) {
      if (val) {
        this.$emit('update:disableSync', false);
      } else {
        this.$emit('update:disableSync', true);
      }
    },
    // 参数为跨页全选 原因：外部可以保持全选状态
    syncStatus() {
      this.$emit('change-sync-status');
    },
  },
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
    // table prop
    checkSelectable() {
      return this.selectable;
    },
    changeCrossPageCheck(checkValue) {
      if (checkValue !== 'default') {
        this.crossPageCheck = checkValue;
      }
      this.crossPageCheckChange();
    },
    /**
     * 退出选择
     */
    exitSelect() {
      this.$refs.table.clearSelection();
      this.selectable = true;
      this.crossPageCheck = false;
    },
    // 跨页全选
    crossPageCheckChange() {
      if (this.crossPageCheck) {
        this.selectable = true;
        // this.$refs.table.toggleAllSelection(true);
        this.dataList.forEach((i) => {
          this.$refs.table.toggleRowSelection(i, true);
        });
        this.selectable = false;
      } else {
        this.$refs.table.clearSelection();
        this.selectable = true;
      }
    },
    batchModify(type) {
      this.$emit('batch-modify', type);
    },
    selectionChange(data) {
      this.selectData = data;
    },
    deleteCamera(data) {
      this.$emit('delete', [data.gbDeviceId]);
    },
    /**
     * 批量删除相机
     */
    batchDelete() {
      this.$emit('delete', this.selectData.map((item) => item.gbDeviceId));
    },
    // 改变每页size
    pageSizeChange(size) {
      this.pageInfo = {
        pageSize: size,
        pageNo: 1,
      };
      this.$emit('update-data');
    },
    // 翻页
    pageCurrentChange() {
      this.$emit('update-data');
    },
    resetPageInfo() {
      this.pageInfo = {
        pageSize: 20,
        pageNo: 1,
      };
      this.selectData = [];
      this.$refs.table.clearSelection();
    },
    getPageInfo() {
      return this.pageInfo;
    },
    getSelectData() {
      return this.crossPageCheck ? [] : this.selectData;
    },
    getSyncStatus() {
      return this.syncStatus;
    },
  },
};
</script>

<style lang='scss' scoped>
.camera-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .table-header {
    padding: 0 19px 0 14px;
    height: 40px;
    border-bottom: 1px solid #dce1e5;
    line-height: 40px;
    display: flex;
    justify-content: space-between;
  }
  .table-body {
    flex: 1;
  }
  .table-disabled-inner {
    ::v-deep .meg-checkbox__inner {
      background-color: #95a9ca;
      border-color: transparent;
      cursor: no-drop;
    }
    height: 50px;
  }
  .table-pagination {
    padding: 8px 0;
  }
}
</style>
