<template>
  <div class="camera-table">
    <div
      class="table"
      :class="{'table-disabled':!isDisabled}">
      <meg-table
        ref="cameraTable"
        stripe
        row-key="id"
        empty-text=""
        height="100%"
        :key="tableId"
        :data="tableData"
        @sort-change="onSortChange"
        @selection-change="handleSelectionChange">
        <div
          slot="empty"
          v-if="(tableData.length === 0 && !isLoading)"
          v-background="{ icon:'icon_4', text: $t('检索无结果') }">
        </div>
        <meg-table-column
          fixed
          reserve-selection
          width="30"
          align="left"
          type="selection"
          :selectable="columnSelectable"></meg-table-column>
        <meg-table-column
          v-for="item in tableConfig"
          :align="item.align"
          :key="item.id"
          :label="item.label"
          :prop="item.prop"
          :sortable="item.sortable">
          <template slot-scope="scope">
            <p
              v-tooltip="true"
              v-if="item.id===2">
              {{ cameraTypeMap[scope.row.type] }}
            </p>
            <p
              v-tooltip="true"
              v-else-if="item.id===3">
              {{ monitoringTypeMap[scope.row.monitoringType] }}
            </p>
            <meg-switch
              v-else-if="item.id===5"
              v-model="scope.row.pulled"
              :disabled="!(cameraAuth.pullAuth(scope.row))||!scope.row.optPermissions"
              active-color="#21539B"
              @change="changePulled(scope.row.pulled,scope.row.id,scope.$index)">
            </meg-switch>
            <p
              v-else-if="item.id===6"
              :class="scope.row.rainbowStatus===0?'pass':'warning'">
              {{ rainbowStatusMap[scope.row.rainbowStatus] }}
            </p>
            <div v-else-if="item.id===7">
              <div v-if="isFaceCamera(scope.row)">
                <p v-if="!scope.row.noneCaptureStatus&&!scope.row.lowQualityStatus">
                  {{ $t('正常') }}
                  <meg-popover
                    v-if="showFaceAnalyze"
                    placement="top"
                    title="抓拍状态"
                    width="200"
                    trigger="hover"
                    :content="`人脸高质量占比${scope.row.faceAnalyze}%`">
                    <meg-icon
                      slot="reference"
                      name="warning"
                      width="10px"
                      color="#C7CED8"
                      height="10px"></meg-icon>
                  </meg-popover>
                </p>
                <p
                  v-if="scope.row.noneCaptureStatus"
                  class="warning">
                  {{ $t('无抓拍异常') }}
                  <meg-popover
                    placement="top"
                    title="无抓拍异常"
                    width="200"
                    trigger="hover"
                    :content="`连续${noneCaptureTTL}天以上无抓拍`">
                    <meg-icon
                      slot="reference"
                      name="warning"
                      width="10px"
                      color="#C7CED8"
                      height="10px"></meg-icon>
                  </meg-popover>
                </p>
                <p
                  v-if="scope.row.lowQualityStatus"
                  class="warning">
                  {{ $t('低质量异常') }}
                  <meg-popover
                    placement="top"
                    title="低质量异常"
                    width="200"
                    trigger="hover">
                    <meg-icon
                      slot="reference"
                      name="warning"
                      width="10px"
                      color="#C7CED8"
                      height="10px"></meg-icon>
                    <div>
                      <p>{{ `连续${lowQualityCaptureTTL}天以上低质量异常` }}</p>
                      <p>{{ `人脸高质量占比${scope.row.faceAnalyze}%` }}</p>
                    </div>
                  </meg-popover>
                </p>
              </div>
              <div v-else>
                <p v-if="!scope.row.noneCaptureStatus&&!scope.row.lowQualityStatus">
                  {{ $t('正常') }}
                  <meg-popover
                    v-if="showFaceAnalyze||showBodyAnalyze||showMotorVehicleAnalyze||showNonMotorVehicleAnalyze"
                    placement="top"
                    title="抓拍状态"
                    width="200"
                    trigger="hover">
                    <div>
                      <p v-if="showFaceAnalyze">
                        {{ `人脸高质量占比${scope.row.faceAnalyze}%` }}
                      </p>
                      <p v-if="showBodyAnalyze">
                        {{ `人体高质量占比${scope.row.bodyAnalyze}%` }}
                      </p>
                      <p v-if="showMotorVehicleAnalyze">
                        {{ `机动车高质量占比${scope.row.motorVehicleAnalyze}%` }}
                      </p>
                      <p v-if="showNonMotorVehicleAnalyze">
                        {{ `非机动车高质量占比${scope.row.nonMotorVehicleAnalyze}%` }}
                      </p>
                    </div>
                    <meg-icon
                      slot="reference"
                      name="warning"
                      width="10px"
                      color="#C7CED8"
                      height="10px"></meg-icon>
                  </meg-popover>
                </p>
                <p
                  v-if="scope.row.noneCaptureStatus"
                  class="warning">
                  {{ $t('无抓拍异常') }}
                  <meg-popover
                    placement="top"
                    title="无抓拍异常"
                    width="200"
                    trigger="hover"
                    :content="`连续${noneCaptureTTL}天以上无抓拍`">
                    <meg-icon
                      slot="reference"
                      name="warning"
                      width="10px"
                      color="#C7CED8"
                      height="10px"></meg-icon>
                  </meg-popover>
                </p>
                <p
                  v-if="scope.row.lowQualityStatus"
                  class="warning">
                  {{ $t('低质量异常') }}
                  <meg-popover
                    placement="top"
                    title="低质量异常"
                    width="200"
                    trigger="hover">
                    <meg-icon
                      slot="reference"
                      name="warning"
                      width="10px"
                      color="#C7CED8"
                      height="10px"></meg-icon>
                    <div>
                      <p>{{ `连续${lowQualityCaptureTTL}天以上低质量异常` }}</p>
                      <p>{{ `人脸低质量占比${100-Number(scope.row.faceAnalyze)}%` }}</p>
                      <p>{{ `人体低质量占比${100-Number(scope.row.bodyAnalyze)}%` }}</p>
                      <p>{{ `机动车低质量占比${100-Number(scope.row.motorVehicleAnalyze)}%` }}</p>
                      <p>{{ `非机动车低质量占比${100-Number(scope.row.nonMotorVehicleAnalyze)}%` }}</p>
                    </div>
                  </meg-popover>
                </p>
              </div>
            </div>
            <p
              v-else
              v-tooltip="true">
              {{ scope.row[item.prop] }}
            </p>
          </template>
        </meg-table-column>
        <meg-table-column
          width="200"
          align="center"
          :label="$t('操作')">
          <template slot-scope="scope">
            <meg-button
              type="text"
              v-if="cameraAuth.detailAuth"
              @click="viewDevice(scope.row.id)">
              {{ $t('详情') }}
            </meg-button>
            <meg-button
              type="text"
              v-if="cameraAuth.editAuth"
              :disabled="!scope.row.optPermissions"
              @click="editDevice(scope.row)">
              {{ $t('编辑') }}
            </meg-button>
            <meg-dropdown
              @command="moreEdit"
              v-if="moreAuth(scope.row)">
              <span class="meg-dropdown-link">
                {{ $t('更多') }}
              </span>
              <meg-dropdown-menu
                slot="dropdown">
                <meg-dropdown-item
                  class="dropdown-item"
                  v-if="spaceAuth(scope.row)"
                  v-show="[1,2,3,10].includes(scope.row.monitoringType) && scope.row.lon && scope.row.lat"
                  :disabled="!scope.row.optPermissions"
                  :command="{...scope.row,command:'space'}">
                  {{ $t('小时空') }}
                </meg-dropdown-item>
                <meg-dropdown-item
                  class="dropdown-item"
                  v-if="deleteAuth(scope.row)"
                  :disabled="!scope.row.optPermissions"
                  :command="{...scope.row,command:'delete'}">
                  {{ $t('删除') }}
                </meg-dropdown-item>
              </meg-dropdown-menu>
            </meg-dropdown>
          </template>
        </meg-table-column>
      </meg-table>
    </div>
    <div class="pagination">
      <meg-pagination
        :total="total"
        :current-page.sync="pageInfo.pageNo"
        :page-size.sync="pageInfo.pageSize"
        @size-change="sizeChange"
        @current-change="currentChange">
      </meg-pagination>
    </div>
  </div>
</template>

<script>
export default {
  components: {

  },
  props: {
    total: {
      type: Number,
      default: 0
    },
    tableData: {
      type: Array,
      default: () => []
    },
    // 全选
    checkedAll: {
      type: Boolean,
      default: false
    },
    // loading
    isLoading: {
      type: Boolean,
      default: false
    },
    cameraAuth: {
      type: Object,
      default: () => {}
    },
  },
  data() {
    return {
      tableId: +new Date(),
      pageInfo: {
        pageNo: 1,
        pageSize: 20,
      },
      tableConfig: [
        {
          id: 1,
          label: this.$t('相机名称'),
          prop: 'name',
          align: 'left'
        },
        {
          id: 2,
          label: this.$t('相机类型'),
          prop: 'type',
          sortable: true,
          align: 'left'
        },
        {
          id: 3,
          label: this.$t('卡口类型'),
          prop: 'monitoringType',
          align: 'left'
        },
        {
          id: 4,
          label: this.$t('应用管理部门'),
          prop: 'managementName',
          align: 'center'
        },
        {
          id: 5,
          label: this.$t('激活状态'),
          prop: 'pulled',
          sortable: true,
          align: 'center'
        },
        {
          id: 6,
          label: this.$t('相机状态'),
          prop: 'rainbowStatus',
          sortable: true,
          align: 'center'
        },
        {
          id: 7,
          label: this.$t('解析异常告警'),
          prop: '',
          align: 'center'
        }
      ],
      cameraTypeOption: this.$store.getters.dataMapByType('camera_type'), // 相机类型
      monitoringTypeOption: this.$store.getters.dataMapByType('bayonet_type'), // 卡口类型
      rainbowStatusOption: this.$store.getters.dataMapByType('rainbow_camera_status'), // 相机状态
      lowQualityCaptureTTL: this.$store.getters.system.lowQualityCaptureTTL.value, // 低质量抓拍预警
      noneCaptureTTL: this.$store.getters.system.noneCaptureTTL.value, // 无抓拍预警
      showFaceAnalyze: false,
      showBodyAnalyze: false,
      showMotorVehicleAnalyze: false,
      showNonMotorVehicleAnalyze: false,
    };
  },
  computed: {
    isDisabled() {
      if (this.checkedAll) {
        return false;
      }
      return true;
    },
    // 相机类型
    cameraTypeMap() {
      const arr = {};
      this.cameraTypeOption.forEach((item) => {
        arr[item.code] = item.value;
      });
      return arr;
    },
    // 卡口类型
    monitoringTypeMap() {
      const arr = {};
      this.monitoringTypeOption.forEach((item) => {
        arr[item.code] = item.value;
      });
      return arr;
    },
    // 相机状态
    rainbowStatusMap() {
      const arr = {};
      this.rainbowStatusOption.forEach((item) => {
        arr[item.code] = item.value;
      });
      return arr;
    }
  },
  mounted() {
    const cameraResShowOptions = this.$store.getters.systemByType('cameraResShowOptions').value.split(',');
    this.showFaceAnalyze = cameraResShowOptions.includes('4');
    this.showBodyAnalyze = cameraResShowOptions.includes('1');
    this.showMotorVehicleAnalyze = cameraResShowOptions.includes('2');
    this.showNonMotorVehicleAnalyze = cameraResShowOptions.includes('3');
  },
  methods: {
    moreAuth(data) {
      return this.spaceAuth(data) || this.deleteAuth(data);
    },
    spaceAuth(data) {
      return this.cameraAuth.spaceAuth && this.cameraAuth.deleteAuth(data) && data.systemType !== 'gaproxy-device';
    },
    deleteAuth(data) {
      return this.cameraAuth.deleteAuth(data) && data.systemType !== 'gaproxy-device';
    },
    // 相机卡口类型
    isFaceCamera(cameraData) {
      const isFace = [1, 2, 3, 10].includes(cameraData.monitoringType);
      return isFace;
    },
    // CheckBox 是否可以勾选
    columnSelectable(row) {
      if (this.checkedAll || !row.optPermissions) {
        return false;
      }
      return true;
    },
    // 排序
    onSortChange({ prop, order }) {
      this.$emit('sort-change', prop, order);
    },
    // 重置分页
    resetPageInfo() {
      this.pageInfo = {
        pageNo: 1,
        pageSize: 20,
      };
    },
    // 处理相机列表选中的状态
    handleSelectionChange(rows) {
      this.$emit('selection-change', rows);
    },
    // 改变激活状态
    changePulled(pulled, id, index) {
      this.$emit('change-pulled', pulled, id, index);
    },
    // 打开详情
    viewDevice(id) {
      this.$emit('view-device', id);
    },
    // 编辑
    editDevice(data) {
      this.$emit('edit-device', data);
    },
    getPageInfo() {
      return this.pageInfo;
    },
    moreEdit(data) {
      if (data.command === 'delete') {
        this.$emit('delete', data.id);
      } else {
        this.$emit('space', data);
      }
    },
    // 分页改变
    sizeChange() {
      this.$emit('update-camera-list');
    },
    // 页码改变
    currentChange() {
      this.$emit('update-camera-list');
    },
    checkAll(val) {
      if (val) {
        this.tableData.forEach((row) => {
          this.$refs.cameraTable.toggleRowSelection(row, true);
        });
      } else {
        this.$refs.cameraTable.clearSelection();
      }
    }
  },
};
</script>

<style lang='scss' scoped>
.camera-table {
 flex: 1;
 display: flex;
 flex-direction: column;
 .table-disabled {
  ::v-deep .meg-checkbox__inner {
    background-color: #95a9ca;
    border-color: transparent;
    cursor: no-drop;
  }
 }
 .table {
   flex: 1;
   .warning {
     color: #F56C6C;
     font-size: 14px;
     .meg-icon {
       cursor: pointer;
       color: #C7CED8
     }
     .meg-icon:hover {
       color: #21539b;
     }
   }
   .pass {
     color: #67C23A;
     font-size: 14px;
   }
 }
 .pagination {
   background: white;
   height: 41px;
   padding-top: 9px;
 }
  .meg-dropdown-link {
    margin-left: 10px;
    color: #21539b;
    cursor: pointer;
  }
}
.dropdown-item {
  text-align: center;
}
</style>
