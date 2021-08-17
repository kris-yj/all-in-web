<template>
  <div>
    <meg-dialog
      class="no-parse-file"
      title="部分相机未解析"
      :visible="isVisible"
      width="400px"
      @close="closeNoParseDialog">
      <div clsss="dialog-content">
        <div class="content-tip">
          追踪范围内部分相机未解析，可创建解析任务继续追踪
        </div>
        <div class="button-box">
          <meg-button
            class="content-button"
            @click="directSearch">
            直接检索
          </meg-button>
          <meg-button
            class="content-button"
            @click="autoCreateTask">
            自动创建解析任务
          </meg-button>
        </div>
        <div
          class="cerate-parse-file"
          @click="manualCreateTask">
          需调整解析条件？请手动创建解析任务 >
        </div>
      </div>
    </meg-dialog>
  </div>
</template>

<script>
export default {
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    };
  },
  methods: {
    closeNoParseDialog() {
      this.$emit('close-no-parse-dialog');
    },
    directSearch() {
      this.$emit('direct-search');
    },
    manualCreateTask() {
      this.$emit('manual-create-task');
    },
    autoCreateTask() {
      this.$emit('auto-create-task');
    }
  }
};
</script>
<style lang='scss' scoped>
.no-parse-file{
  .content-tip{
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;
    color: #435068;
    line-height:34px;
    height: 34px;
    margin-bottom: 20px;
  }
  .button-box {
    display: flex;
    justify-content: space-between;
  }
  .content-button{
    width: 150px;
    height: 34px;
  }
  .cerate-parse-file{
    font-family: SourceHanSansCN-Regular;
    font-size: 14px;
    color: #21539B;
    text-align: center;
    margin-top: 30px;
    margin-bottom: 30px;
    cursor: pointer
  }
}
</style>
