<template>
  <meg-dialog
    title="布控任务关联的相机列表"
    :visible.sync="showCameraList"
    :before-close="handleClose">
    <div v-loading="cameraListLoading">
      <div>{{ $t('共') + cameraListData.totalRecords + $t('路相机') }}</div>
      <br />
      <meg-table
        :data="cameraListData.records"
        border
        max-height="560"
        style="width: 100%">
        <meg-table-column
          prop="name"
          label="相机名称"
          width="180">
        </meg-table-column>
        <meg-table-column
          prop="type"
          :formatter="formatCameraType"
          label="相机类型"
          width="180">
        </meg-table-column>
        <meg-table-column
          prop="monitoringType"
          :formatter="formatBayonetType"
          label="卡口类型">
        </meg-table-column>
        <meg-table-column
          prop="managementName"
          label="应用管理部门">
        </meg-table-column>
      </meg-table>
      <br />
      <meg-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="cameraListData.pageNo"
        :page-sizes="pageSizes"
        :page-size="cameraListData.pageSize"
        :total="cameraListData.totalRecords">
      </meg-pagination>
      <br />
    </div>
  </meg-dialog>
</template>

<script>
import SurveillanceTaskSvr from '@/modules/surveillance-task/surveillance-task.service.js';

export default {
  props: {
    showCameraList: {
      type: Boolean,
      default: false
    },
    taskId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      cameraListLoading: false,
      cameraListData: {
        totalRecords: 0,
        pageNo: 1,
        pageSize: 10,
        totalPage: 0,
        records: []
      },
      pageSizes: [10, 20, 50, 100],
      cameraTypeMap: {},
      bayonetTypeMap: {},
    };
  },
  watch: {
    showCameraList(value) {
      if (value) {
        this.getCameraList(1, this.pageSizes[0]);
      }
    }
  },
  created() {
    const cameraType = this.$store.getters.dataMapByType('camera_type');
    const bayonetType = this.$store.getters.dataMapByType('bayonet_type');
    cameraType.forEach((item) => { this.cameraTypeMap[item.code] = item.value; });
    bayonetType.forEach((item) => { this.bayonetTypeMap[item.code] = item.value; });
  },
  methods: {
    formatCameraType(row, column, cellValue) {
      return this.cameraTypeMap[cellValue];
    },
    formatBayonetType(row, column, cellValue) {
      return this.bayonetTypeMap[cellValue];
    },
    handleClose() {
      this.$emit('close-camera-list');
    },
    // 修改表格每页展示条数
    handleSizeChange(pageSize) {
      this.getCameraList(1, pageSize);
    },
    // 翻页
    handleCurrentChange(pageNo) {
      this.getCameraList(pageNo, this.cameraListData.pageSize);
    },
    // 获取表格数据
    getCameraList(pageNo, pageSize) {
      this.cameraListLoading = true;
      SurveillanceTaskSvr.getCameraList({ id: this.taskId, pageNo, pageSize }).then((res) => {
        if (res.code === 0) {
          this.cameraListData = res.data;
          this.cameraListLoading = false;
        } else {
          console.error(res);
        }
      });
    }
  }
};
</script>
