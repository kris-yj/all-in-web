<template>
  <meg-dialog
    :title="$t('警情确认')"
    :visible="true"
    :append-to-body="appendToBody"
    :modal-append-to-body="appendToBody"
    width="400px"
    @close="cancel">
    <div class="confirm-content-container">
      <div class="confirm-alert-dialog-mes">
        {{ $t('是否确认该警情，并进行派警？') }}
      </div>
      <div class="confirm-alert-dialog-btn-box">
        <meg-button
          type="danger"
          @click="alarmDesignate">
          {{ $t('确认并派警') }}
        </meg-button>
        <meg-button
          type="primary"
          @click="alarmArchive">
          {{ $t('仅确认') }}
        </meg-button>
        <meg-button
          @click="cancel">
          {{ $t('取消') }}
        </meg-button>
      </div>
    </div>
  </meg-dialog>
</template>

<script>
export default {
  name: 'ConfirmAlarmDialog',
  props: {
    appendToBody: {
      type: Boolean,
      default: true
    },
  },
  methods: {
    cancel() {
      this.$emit('close');
    },
    alarmArchive() {
      this.$emit('alarm-archive');
    },
    alarmDesignate() {
      this.$emit('alarm-designate');
    },
  },
};
</script>
<style lang="scss" scoped>
.confirm-content-container {
  height: 189px;
  .confirm-alert-dialog-mes {
    padding: 55px 0 55px 25px;
    font-size: 14px;
    color: #435068;
  }
  .confirm-alert-dialog-btn-box {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-right: 25px;
    height: 50px;
    border-top: 1px solid #e4e7ed;
    padding-top: 7px;
  }
}
</style>
