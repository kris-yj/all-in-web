<template>
  <meg-dialog
    class="export-dialog"
    :width="bodyWidth"
    :visible="dialogVisible"
    :append-to-body="true"
    @close="onClickCancel">
    <!-- header部分 -->
    <template v-slot:title>
      <span class="export-dialog-title">
        {{ headerTitle }}
      </span>
      <span class="export-dialog-tip">{{ tips }}</span>
    </template>
    <!-- 内部动态组件 -->
    <div class="export-dialog-body">
      <component
        :is="selectComponent"
        :select-options="selectOptions"
        v-model="selectResult">
      </component>
    </div>
    <!-- footer部分 -->
    <template v-slot:footer>
      <meg-button
        type="primary"
        @click="onClickConfirm">
        导出
      </meg-button>
      <meg-button @click="onClickCancel">
        取消
      </meg-button>
    </template>
  </meg-dialog>
</template>
<script>
import ExportSelectTime from './export-select-time.vue';
import ExportSelectThreshold from './export-select-threshold.vue';
import ExportSelectMultiThreshold from './export-select-multi-threshold.vue';
import ExportSelectList from './export-select-list.vue';

const ExportType = {
  TIME: 'time',
  THRESHOLD: 'threshold',
  MULTI_THRESHOLD: 'multiThreshold',
  LIST: 'list'
};

const ExportSelectComp = {
  [ExportType.TIME]: {
    width: '500px',
    comp: 'ExportSelectTime',
    title: '按时间导出'
  },
  [ExportType.THRESHOLD]: {
    width: '400px',
    comp: 'ExportSelectThreshold',
    title: '按阈值导出'
  },
  [ExportType.MULTI_THRESHOLD]: {
    width: '600px',
    comp: 'ExportSelectMultiThreshold',
    title: '按阈值导出'
  },
  [ExportType.LIST]: {
    width: '800px',
    comp: 'ExportSelectList',
    title: '按地点导出'
  }
};

export default {
  name: 'ExportMessageBox',
  components: {
    ExportSelectTime,
    ExportSelectThreshold,
    ExportSelectMultiThreshold,
    ExportSelectList
  },
  props: {
    exportType: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    tips: {
      type: String,
      default: ''
    },
    selectOptions: {
      type: [Object, Array, Number],
      required: true
    }
  },
  data() {
    return {
      dialogVisible: false,
      // list 和 多阈值 下选择结果为数组，其余为nullable
      selectResult: this.exportType === ExportType.LIST || this.exportType === ExportType.MULTI_THRESHOLD ? [] : null,
      selectHandler: [null, null]
    };
  },
  computed: {
    selectComponent() {
      return ExportSelectComp[this.exportType].comp;
    },
    bodyWidth() {
      return ExportSelectComp[this.exportType].width;
    },
    headerTitle() {
      // 赋值title则使用，否则为默认title
      return this.title || ExportSelectComp[this.exportType].title;
    }
  },
  methods: {
    showDialog() {
      return new Promise((resolve, reject) => {
        this.dialogVisible = true;
        this.selectHandler = [resolve, reject];
      });
    },
    onClickConfirm() {
      if (this.exportType === ExportType.LIST && this.selectResult.length === 0) {
        this.$message({
          type: 'error',
          message: '请选择导出项目',
          showClose: true
        });
        return;
      }
      if (this.exportType === ExportType.TIME && this.selectResult === null) {
        this.$message({
          type: 'error',
          message: '请选择导出时间',
          showClose: true
        });
        return;
      }
      const [resolve] = this.selectHandler;
      if (resolve) {
        this.dialogVisible = false;
        resolve(this.selectResult);
      }
    },
    onClickCancel() {
      const [, reject] = this.selectHandler;
      if (reject) {
        this.dialogVisible = false;
        reject();
      }
    }
  }

};
</script>

<style lang="scss" scoped>
.export-dialog {
  .export-dialog-body {
    padding: 20px 30px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .export-dialog-title {
    line-height: 54px;
    font-size: 16px;
    color: #435068;
    font-weight: 700;
  }
  .export-dialog-tip {
    color: #bbb;
    font-size: 12px;
    font-weight: normal;
  }
}
</style>
