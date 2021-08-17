<template>
  <meg-dialog
    :title="$t('抓拍列表')"
    width="800px"
    :visible="dialogVisible"
    @close="dialogClose"
    append-to-body>
    <div
      class="dialog-body">
      <div class="content-title">
        {{ captureData[0].cameraName }}({{ captureData.length }}{{ $t('条') }}）
      </div>
      <meg-scrollbar>
        <meg-card-frame
          tag="div"
          :card-min-width="145">
          <meg-card
            class="capture-card"
            v-for="(item, index) of captureData"
            :key="index"
            :img-src="item.url"
            img-margin="10px">
            <div
              class="card-bottom"
              slot="bottom">
              <meg-icon
                name="time_fill"
                color="#D1D5DD">
              </meg-icon>
              {{ item.capturedTime | formatTime('YYYY-MM-DD HH:mm:ss') }}
            </div>
          </meg-card>
        </meg-card-frame>
      </meg-scrollbar>
    </div>
  </meg-dialog>
</template>
<script>

export default {
  props: {
    captureData: {
      type: Array,
      default: () => []
    },
    dialogVisible: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
    };
  },
  methods: {
    dialogClose() {
      this.$emit('update:dialogVisible', false);
    },
  }
};
</script>
<style lang="scss" scoped>
::v-deep .meg-dialog__body{
  background: #DCE1E5;;
}
.dialog-body {
  height: 485px;
  background: #DCE1E5;;
  ::v-deep .meg-scrollbar{
    height: calc(100%-50px);
  }
}
.content-title {
  height: 34px;
  line-height: 34px;
  margin-bottom: 10px;
  background: white;
  padding-left: 5px;
  font-family: SourceHanSansCN-Regular;
  font-size: 12px;
  color: #435068;
  letter-spacing: 0;
}
.card-frame {
  background: white;
}
.card-bottom{
  padding-top: 2px;
  font-family: SourceHanSansCN-Normal;
  font-size: 12px;
  color: #435068;
  height: 26px;
  padding-left: 10px;
}
</style>
