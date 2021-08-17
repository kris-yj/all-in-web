<template>
  <meg-dialog
    class="identity-detail-dialog"
    width="1250px"
    :visible="visible"
    :show-footer="false"
    :close-on-press-escape="false"
    :append-to-body="appendToBody"
    :modal-append-to-body="appendToBody"
    @close="onDialogClose">
    <div
      slot="title"
      class="tittle">
      {{ $t('身份详情') }}
    </div>
    <div class="detail-content">
      <card-detail
        :active-item="activeItem"></card-detail>
      <album-info
        :album-info="activeItem"></album-info>
    </div>
    <detail-selector
      ref="detailSelector"
      v-model="activeIndex"
      :result-list="resultList"
      :show-temporary="showTemporary"
      v-on="$listeners"></detail-selector>
  </meg-dialog>
</template>

<script>
import CardDetail from './components/card-detail';
import AlbumInfo from './components/album-info';
import DetailSelector from './components/detail-selector';

export default {
  name: 'CommonDatabaseDetail',
  components: {
    CardDetail,
    AlbumInfo,
    DetailSelector
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    index: {
      type: Number,
      default: -1
    },
    resultList: {
      type: Array,
      default: () => []
    },
    appendToBody: {
      type: Boolean,
      default: true
    },
    showTemporary: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      activeIndex: -1
    };
  },
  computed: {
    activeItem() {
      return this.activeIndex > -1 ? this.resultList[this.activeIndex] : {};
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        if (val) {
          this.activeIndex = this.index;
          this.$nextTick(() => {
            this.$refs.detailSelector.resetSwiper();
          });
        } else {
          this.activeIndex = -1;
        }
      }
    },
    'resultList.length': function (val) {
      if (this.visible && val && this.activeIndex > -1) {
        this.activeIndex = val <= this.activeIndex ? val - 1 : this.activeIndex;
      }
    },
  },
  mounted() {

  },
  destroyed() {

  },
  methods: {
    // 关闭详情
    onDialogClose() {
      this.$emit('update:visible', false);
      this.$emit('close');
    }
  },
};
</script>

<style lang='scss' scoped>
.identity-detail-dialog {
  ::v-deep .meg-dialog__body {
    padding: 0;
  }
  .tittle {
    height: 50px;
    line-height: 50px;
    box-sizing: border-box;
    font-size: 16px;
    font-weight: 900;
    cursor: pointer;
    color: #435068;
  }
  .detail-content {
    height: 447px;
    display: flex;
  }
}
</style>
