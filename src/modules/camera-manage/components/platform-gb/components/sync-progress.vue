<template>
  <div
    class="sync-progress"
    v-loading="loading"
    megvii-loading-background="rgba(255, 255, 255, 0.5)"
    :megvii-loading-text="syncProgress">
    <meg-dialog
      title="同步完成"
      width="480px"
      :modal="false"
      :visible.sync="showProgressDialog"
      @close="closeProgressDialog">
      <div>
        <span>同步完成,成功 </span>
        <span class="blod">{{ all-failureNum }}</span>
        <span> ,失败 </span>
        <span class="blod">{{ failureNum }}</span>
      </div>
      <p
        class="err-reason"
        v-show="showDownload"
        @click="download">
        点击下载未同步成功相机列表
      </p>
      <span
        slot="footer"
        class="dialog-footer">
        <meg-button
          type="primary"
          @click="closeProgressDialog">确 定</meg-button>
        <meg-button
          @click="closeProgressDialog">取 消</meg-button>
      </span>
    </meg-dialog>
  </div>
</template>

<script>
import PlatFormGbSrv from '../platform-gb.service';

export default {
  components: {

  },
  props: {
    syncProgressId: {
      type: String,
      default: ''
    },
    uniqueKey: {
      type: String,
      default: ''
    },
    platformId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      showDownload: false,
      syncProgress: '', // 当前同步进度
      showProgressDialog: false, // 显示同步完成弹框
      failureNum: 0,
      all: 0
    };
  },
  watch: {

  },
  created() {
    this.getSyncProgress(this.syncProgressId);
  },
  methods: {
    // 查询同步进度
    getSyncProgress(id) {
      PlatFormGbSrv.getProgress({ id }).then((res) => {
        if (res.code === 0) {
          this.syncProgress = `已同步${res.data.progress}/${res.data.all}相机...`;
          this.loading = true;
          if (res.data.all !== 0 && res.data.all !== res.data.progress) {
            setTimeout(() => {
              this.getSyncProgress(id);
            }, 2000);
          } else {
            this.showDownload = Boolean(res.data.failureNum);
            this.failureNum = res.data.failureNum;
            this.all = res.data.all;
            this.loading = false;
            this.showProgressDialog = true;
          }
        }
      });
    },
    // 关闭同步进度弹窗
    closeProgressDialog() {
      this.showProgressDialog = false;
      this.loading = false;
      this.$emit('close');
    },
    download() {
      const url = PlatFormGbSrv.download({
        searchId: this.platformId,
        uniqueKey: this.uniqueKey
      });
      const a = document.createElement('a');
      a.style.display = 'none';
      a.setAttribute('target', '_blank');
      a.href = url;
      a.click();
    }
  },
};
</script>

<style lang='scss' scoped>
.sync-progress {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  background: rgba(255, 255, 255, 0.5);
  ::v-deep .meg-loading-text {
    font-size: 16px;
    color: #4A4A4A;
  }
  ::v-deep  .circular {
    width: 50px;
    height: 50px;
  }
  ::v-deep  .meg-dialog__body {
    height: 125px;
    font-family: 'HEMIHEAD';
    font-size: 14px;
    font-weight: bold;
    color: #435068;
    .err-reason {
      margin-top: 20px;
      font-size: 14px;
      color: #21539B;
      cursor: pointer;
    }
    .blod {
      font-size: 20px;
    }
  }
}
</style>
