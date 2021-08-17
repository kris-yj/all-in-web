<template>
  <meg-dialog
    width="1100px"
    :title="title"
    @close="handleClose"
    v-if="isShow"
    :visible.sync="isShow">
    <div class="capture-list">
      <meg-card-frame :card-min-width="180">
        <div
          class="list-item"
          v-for="(item, index) in list"
          @click="handleCardClick(list, index)"
          :key="index">
          <meg-card
            :img-src="item.photoUrl || item.url"
            class="card-item__content">
            <div slot="bottom">
              <div class="card-item__time">
                <meg-icon
                  name="time"
                  class="time-icon"></meg-icon>
                <div class="time-block">
                  <p>
                    {{ captureTime(item) | formatTime }}
                  </p>
                </div>
              </div>
            </div>
          </meg-card>
        </div>
      </meg-card-frame>
    </div>
  </meg-dialog>
</template>
<script>

export default {
  name: 'ModalCaptureList',
  props: {
    title: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isShow: this.visible,
      // 详情列表
      targetList: [],
      // 详情数据
      detailInfo: {},
      // 当前详情位于列表中的 index 值
      detailIndex: 0,
      loading: false,
    };
  },
  watch: {
    visible(val) {
      this.isShow = val;
    }
  },
  methods: {
    captureTime(item) {
      return item.captureTime || item.capturedTime;
    },
    handleClose() {
      this.$emit('close');
    },
    /**
     * 点击卡片
     */
    handleCardClick(list, index) {
      this.$emit('detail', list, index);
    },
  }
};
</script>
<style lang="scss" scoped>
  ::v-deep .meg-dialog__body{
    padding: 0;
  }
  .capture-list {
    padding: 12px 30px 12px 30px;
    height: 480px;
    background-color: #dce1e5;
    box-sizing: border-box;
    overflow: auto;
    .list-item {
      width: 100%;
      box-sizing: border-box;
      position: relative;
      &:hover {
        .bottom-toolbar {
          display: block;
        }
      }
      .card-item__content {
        padding: 10px;
      }
      .card-item__time {
        display: flex;
        padding: 10px;
        .time-icon {
          width: 12px;
          height: 12px;
          color: #D1D5DD;
          position: relative;
          top: 3px;
        }
        .time-block {
          min-width: 100px;
          margin-left: 6px;
          text-align: left;
          >p {
            font-size: 12px;
            line-height: 1.5;
            color: #435068;
          }
        }
      }
    }
  }
</style>
