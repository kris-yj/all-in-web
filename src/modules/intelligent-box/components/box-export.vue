<template>
  <div>
    <meg-dialog
      width="640px"
      @close="cancelExport"
      title="导出"
      :visible="isExports">
      <div
        class="box-export">
        <p>{{ $t('请选择导出范围') }}</p>
        <meg-radio-group
          v-model="associated">
          <p>
            <meg-radio :label="false">
              {{ $t('仅导出智能盒') }}
            </meg-radio>
          </p>
          <p>
            <meg-radio :label="true">
              {{ $t('智能盒及其关联相机') }}
            </meg-radio>
          </p>
        </meg-radio-group>
      </div>
      <div slot="footer">
        <meg-button
          type="primary"
          @click="confirmExport">
          {{ $t('导出') }}
        </meg-button>
        <meg-button @click="cancelExport">
          {{ $t('取消') }}
        </meg-button>
      </div>
    </meg-dialog>
  </div>
</template>

<script>
export default {
  props: {
    isExports: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      associated: false
    };
  },
  methods: {
    confirmExport() {
      this.$emit('confirm-export', this.associated);
    },
    cancelExport() {
      this.$emit('cancel-export');
    }
  }
};
</script>

<style lang="scss" scoped>
.box-export {
  height: 120px;
  p {
    padding: 10px 0;
  }
}
</style>
