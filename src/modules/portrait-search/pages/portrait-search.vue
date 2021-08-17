<template>
  <page-layout>
    <!-- 基础检索 -->
    <base-search
      :show-immidately="false"
      class="base-search-wrap"
      ref="baseSearch"
      :animation="false"
      :shield-upload="true"
      :default-analyze-type="[4]"
      :default-background="partraitBackground"
      :face-threshold-hidden="true"
      :capture-image-required="true"
      :default-other-threshold-text="'人体相似度'"
      :default-upload-prompt-text="'点击新建或选择画像'"
      :go-init-search="false"
      :merge-srv="PortraitSearchSrv"
      @upload-click="dialogVisible = true">
    </base-search>
    <!-- 画像弹窗 -->
    <meg-dialog
      :visible.sync="dialogVisible"
      :append-to-body="true"
      :fullscreen="true"
      :middle="false"
      custom-class="dress-up-dialog">
      <div
        class="dress-up-wrap"
        v-if="dialogVisible">
        <common-dress-up
          ref="dressUp"
          @searchOneTemplate="searchOneTemplate"
          @exict="dialogVisible=false">
          <template slot="btns">
            <meg-button
              type="primary"
              @click="goSearch()">
              {{ '检索' }}
            </meg-button>
            <meg-button
              @click="download()">
              {{ '下载' }}
            </meg-button>
          </template>
        </common-dress-up>
      </div>
    </meg-dialog>
  </page-layout>
</template>

<script>
import CommonDressUp from '@/common-components/common-dress-up';
import BaseSearchExport from '@/modules/capture-search/export.js';
import partraitBackground from '../images/partrait.png';
import PortraitSearchSrv from '../portrait-search.service';

export default {
  components: {
    BaseSearch: BaseSearchExport.module,
    CommonDressUp,
  },
  data() {
    return {
      dialogVisible: false,
      PortraitSearchSrv,
      partraitBackground
    };
  },
  methods: {
    /**
     *
     * 从模板草稿中 点击了检索
    */
    searchOneTemplate(item) {
      this.goSearch(item.url);
    },

    /**
     *
     * 下载
    */
    download() {
      this.$refs.dressUp.download();
    },

    /**
     *
     * 去检索  传了img就是从模板中过来的检索
    */
    goSearch(img) {
      let canvData = img;
      if (!canvData) {
        canvData = this.$refs.dressUp.getDownloadImageData();
        // 保存模板到草稿
        this.$refs.dressUp.saveHistoryInStorage();
      }
      this.dialogVisible = false;
      // 设置图片到上传组件
      this.$refs.baseSearch.setInitFile([{
        photo: canvData, // 图片base64信息
        couldEdit: false,
      }]);
    },
  }
};
</script>

<style lang="scss" scoped>
::v-deep .base-search-wrap .app-header {
  display: none;
}
::v-deep .common-form-container .header {
  display: none;
}
.dress-up-wrap {
  height: 100%;
}
</style>
<!-- 覆盖弹窗，使用特殊 class 全局样式 -->
<style>
.dress-up-dialog .meg-dialog__body {
  padding: 0;
}
</style>
