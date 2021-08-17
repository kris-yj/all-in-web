<template>
  <meg-popover
    popper-class="guide-tip-popover"
    width="234px"
    placement="bottom-start"
    trigger="manual"
    v-model="isGuideTipShow">
    <meg-icon
      name="help_prompt"
      class="action guide-icon"
      @click="guideClick"
      slot="reference">
    </meg-icon>
    <div class="guide-tip-content">
      <div>
        <p>点击帮助，快速了解系统</p>
      </div>
      <div class="tip-actions">
        <meg-checkbox v-model="noNotice">
          不再提示
        </meg-checkbox>
        <meg-button
          type="primary"
          class="btn"
          @click="onTipClose">
          知道了
        </meg-button>
      </div>
    </div>
  </meg-popover>
</template>

<script>
import { openGuideModule } from '@/utils/utils.js';

export default {
  props: {
    showImmidately: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isGuideTipShow: false,
      noNotice: false
    };
  },
  mounted() {
    this.$nextTick(() => {
      if (this.showImmidately) this.setGuideTipStatus();
    });
  },
  methods: {
    setGuideTipStatus() {
      const guideStorage = window.localStorage.getItem('guide');
      if (!guideStorage) {
        this.isGuideTipShow = true;
        return;
      }
      const currentUser = this.$store.state.user.userName;
      this.isGuideTipShow = !guideStorage.includes(currentUser);
    },
    guideClick() {
      openGuideModule();
    },
    onTipClose() {
      if (this.noNotice) {
        let guideStorage = window.localStorage.getItem('guide') || '';
        const currentUser = this.$store.state.user.userName;
        guideStorage = `${guideStorage},${currentUser}`;
        window.localStorage.setItem('guide', guideStorage);
      }
      this.isGuideTipShow = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.guide-tip-popover {
}
.guide-tip-content {
  padding: 10px;
  font-size: 14px;
  color: #435068;
  font-weight: 400;

  .tip-actions {
    display: flex;
    margin-top: 20px;
    align-items: center;

    .btn {
      margin-left: 10px;
    }
  }
}
</style>
