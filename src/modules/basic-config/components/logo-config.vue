<template>
  <div class="logo-config">
    <config-block
      :title="$t('LOGO设置')">
      <meg-form
        slot="content"
        label-position="right"
        label-width="152px"
        :rules="configRules"
        :model="configData"
        ref="logoConfigForm">
        <meg-form-item
          v-if="productType===0"
          :label="configData.productName.name"
          prop="productName.value"
          class="item">
          <meg-input
            v-model="configData.productName.value"></meg-input>
          <span class="tip">{{ configData.productName.remark }}</span>
        </meg-form-item>
        <meg-form-item
          v-else
          :label="configData.productNameDL.name"
          prop="productNameDL.value"
          class="item">
          <meg-input
            v-model="configData.productNameDL.value"></meg-input>
          <span class="tip">{{ configData.productNameDL.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.showProductRight.name"
          class="item">
          <meg-switch
            active-color="#21539B"
            v-model="configData.showProductRight.value"></meg-switch>
          <span class="tip">{{ configData.showProductRight.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.showPoliceBadge.name"
          class="item">
          <meg-switch
            active-color="#21539B"
            v-model="configData.showPoliceBadge.value"></meg-switch>
          <span class="tip">{{ configData.showPoliceBadge.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.showInnerLogo.name"
          class="item">
          <meg-switch
            active-color="#21539B"
            v-model="configData.showInnerLogo.value"></meg-switch>
          <span class="tip">{{ configData.showInnerLogo.remark }}</span>
        </meg-form-item>
        <meg-form-item
          :label="configData.productLogo.name"
          class="item logo-radio">
          <span>
            <meg-radio-group
              @change="radioChange"
              v-model="logoType">
              <meg-radio :label="0">{{ $t('默认logo') }}</meg-radio>
              <meg-radio :label="1">{{ $t('隐藏logo') }}</meg-radio>
              <meg-radio :label="2">{{ $t('自定义logo') }}</meg-radio>
            </meg-radio-group>
          </span>
          <span class="tip">{{ configData.productLogo.remark }}</span>
        </meg-form-item>
        <meg-form-item
          v-if="logoType===2"
          label=""
          class="item">
          <meg-upload
            class="upload"
            :action="uploadUrl"
            accept=".png, .jpg, .jpeg"
            name="multipartFile"
            :headers="uploadHeaders"
            :on-success="showImgUrl"
            :show-file-list="false"
            :before-upload="beforeProductUpload"
            list-type="picture">
            <meg-button
              size="small"
              type="primary">
              {{ $t('点击上传') }}
            </meg-button>
            <span class="tip">{{ $t('只能上传jpg/png文件，且不超过500kb') }}</span>
          </meg-upload>
          <div
            class="img-container"
            v-loading="loading">
            <img :src="configData.productLogo.value" />
          </div>
        </meg-form-item>
        <meg-form-item
          :label="configData.navLogo.name"
          class="item">
          <meg-upload
            class="upload"
            accept=".png, .jpg, .jpeg"
            :action="uploadUrl"
            name="multipartFile"
            :headers="uploadHeaders"
            :on-success="onNavLogoSuccess"
            :show-file-list="false"
            :before-upload="beforeNavUpload"
            list-type="picture">
            <meg-button
              size="small"
              type="primary">
              {{ $t('点击上传') }}
            </meg-button>
            <span class="tip">{{ configData.navLogo.remark }}</span>
          </meg-upload>
          <div
            class="img-container"
            v-loading="navLogoLoading">
            <img :src="configData.navLogo.value" />
          </div>
        </meg-form-item>
      </meg-form>
    </config-block>
  </div>
</template>
<script>
import ConfigBlock from './config-block';

export default {
  components: {
    ConfigBlock
  },
  props: {
    configData: {
      type: Object,
      default: () => {}
    },
    configRules: {
      type: Object,
      default: () => {}
    },
    storageOptions: {
      type: Array,
      default: () => []
    },
    uploadUrl: {
      type: String,
      default: '',
    },
    productType: {
      type: Number,
      default: 0,
    }
  },
  data() {
    return {
      logoType: 0,
      loading: false,
      navLogoLoading: false,
      uploadHeaders: {
        'Authorization': `${window.localStorage.getItem('token')}`
      },
      imgType: ['image/png', 'image/jpg', 'image/jpeg'], // 上传头像支持的格式
    };
  },
  mounted() {
    this.analysisProductLogo(this.configData.productLogo);
  },
  methods: {
    /*
    * 表单校验（外部调用）
    * @param {any}
    * @return
    * */
    validateForm() {
      let isValid = false;
      this.$refs.logoConfigForm.validate((value) => {
        isValid = value;
      });
      return isValid;
    },
    /**
     * 根据radio值，判断logo类型
     */
    radioChange(value) {
      if (value === 0) {
        this.configData.productLogo.value = this.configData.productLogo.defaultValue;
      } else if (value === 1) {
        this.configData.productLogo.value = '';
      }
      console.log(this.configData.productLogo);
    },
    /**
     * 验证导航logo上传图片
     */
    beforeNavUpload(file) {
      if (this.imgType.indexOf(file.type) === -1) {
        this.$message.error(this.$t('请上传符合格式要求的图片!'));
        return false;
      }
      this.navLogoLoading = true;
      return true;
    },
    /**
     * 验证上传图片
     */
    beforeProductUpload(file) {
      if (this.imgType.indexOf(file.type) === -1) {
        this.$message.error(this.$t('请上传符合格式要求的图片!'));
        return false;
      }
      if (file.size > 500 * 1024) {
        this.$message.error(this.$t('请上传500kb以内的图片'));
        return false;
      }
      this.loading = true;
      return true;
    },
    /*
    * 导航logo上传成功
    * @param {any}
    * @return
    * */
    onNavLogoSuccess(res) {
      if (res.code === 0) {
        this.configData.navLogo.value = res.data;
      } else {
        this.$message.error(res.msg || '图片上传失败');
      }
      this.navLogoLoading = false;
    },
    /**
     * 处理显示自定义logo图片
     */
    showImgUrl(res) {
      if (res.code === 0) {
        this.configData.productLogo.value = res.data;
      } else {
        this.$message.error(res.msg || '图片上传失败');
      }
      this.loading = false;
    },
    /**
     * 判断logo设置类型
     */
    analysisProductLogo(configData) {
      if (configData.defaultValue === configData.value) {
        this.logoType = 0;
      } else if (configData.value === '') {
        this.logoType = 1;
      } else {
        this.logoType = 2;
      }
    },
  }
};
</script>
<style lang="scss" scoped>
.img-container {
  img {
    height: 48px;
  }
}
</style>
