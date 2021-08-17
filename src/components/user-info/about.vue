<template>
  <meg-dialog
    title="关于"
    :visible="isShow"
    class="about-dialog"
    :show-footer="false"
    body-height="483px"
    width="800px"
    @close="onClose">
    <div class="about-dialog-body">
      <div class="title">
        <p class="main-title">
          {{ productName }}
        </p>
        <p class="sub-title">
          为实战而生
        </p>
      </div>
      <div class="footer">
        <div
          v-if="isShowInnerLogo"
          class="logo">
          <meg-icon
            name="logo-new-2"
            class="logo-icon"></meg-icon>
        </div>
        <p v-if="isShowProductRight">
          ©2011-{{ new Date().getFullYear() }}&nbsp;&nbsp;北京旷视科技有限公司&nbsp;&nbsp;京ICP备12036813号
        </p>
      </div>
    </div>
  </meg-dialog>
</template>
<script>
export default {
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {};
  },
  computed: {
    isShowInnerLogo() {
      const { value } = this.$store.getters.systemByType('showInnerLogo');
      return value === 'true' || value === true;
    },
    isShowProductRight() {
      const { value } = this.$store.getters.systemByType('showProductRight');
      return value === 'true' || value === true;
    },
    productName() {
      const productType = this.$store.getters.systemByType('productType');
      const productName = this.$store.getters.systemByType('productName');
      const productNameDl = this.$store.getters.systemByType('productName_DL');

      if (productType.value === '1') {
        return productNameDl.value;
      }
      return productName.value;
    }
  },
  methods: {
    onClose() {
      this.$emit('about-close');
    }
  }
};
</script>
<style lang="scss" scoped>
.about-dialog-body {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  .title {
    text-align: center;
    margin-top: 80px;
    .main-title {
      font-size: 24px;
      color: #435068;
      font-weight: 600;
    }
    .sub-title {
      font-size: 20px;
      color: #435068;
      margin-top: 20px;
    }
  }
  .footer {
    margin-bottom: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .logo-icon {
      height: 43px;
      width: 108px;
      color: #0E57A1;
    }
    .logo {
      margin-bottom: 12px;
    }
    .footer {
      margin-bottom: 50px;
      display: flex;
      flex-direction: column;
      align-items: center;
      .logo {
        margin-bottom: 12px;
      }
    }
    .footer p {
      font-size: 14px;
      color: #8c95a4;
    }
  }
  .footer p {
    font-size: 14px;
    color: #8c95a4;
  }
}
</style>
<style lang="scss">
.about-dialog {
  .meg-dialog__body {
    height: 483px;
    box-sizing: border-box;
  }
}
</style>
