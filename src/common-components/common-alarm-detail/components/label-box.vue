<template>
  <div
    class="label-box">
    <span class="label">{{ title }}</span>
    <div
      v-tooltip="contentTooltip"
      class="content">
      <slot>{{ content }}</slot>
    </div>
    <span
      v-show="isCopy"
      class="info-copy"
      @click="copyPtext(content)">
      {{ $t("复制") }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'LabelBox',
  props: {
    isCopy: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '',
    },
    content: {
      type: [String, Number],
      default: '',
    },
    contentTooltip: {
      type: Boolean,
      default: true,
    }
  },
  methods: {
    // 快捷复制信息
    copyPtext(info) {
      this.$clipboard(info).then(() => {
        this.$message({
          message: this.$t('复制成功'),
          type: 'success',
          showClose: true,
        });
      }, () => {
        this.$message({
          type: 'error',
          message: this.$t('复制失败')
        });
      });
    }

  }
};
</script>
<style lang="scss" scoped>
.label-box {
  display: flex;
  font-size: 14px;
  overflow: hidden;
  .label {
    flex-shrink: 0;
    color: #869abb;
    margin-right: 12px;
  }
  .content {
    flex: 1;
  }
  .info-copy {
    font-size: 14px;
    color: #21539b;
    cursor: pointer;
    padding-right: 10px;
  }

}
</style>
