<template>
  <div class="photo-add">
    <div class="photo-add-content">
      <div
        class="photo-upload">
        <meg-img-container
          :useful-frame="addPhotoModel.rect"
          :img-src="addPhotoModel.photo">
        </meg-img-container>
      </div>
      <div class="photo-add-form">
        <meg-form
          ref="addBodyPhotoForm"
          :rules="addPhotoRules"
          class="add-form"
          label-width="81px"
          label-position="right"
          :model="addPhotoModel">
          <meg-form-item
            :label="$t('车牌号')"
            prop="carNo">
            <meg-input
              v-model="addPhotoModel.carNo"
              :placeholder="$t('请输入正确的车牌号')"></meg-input>
          </meg-form-item>
          <meg-form-item
            :label="$t('备注')"
            prop="cmnt"
            class="form-item-cmnt">
            <meg-input
              type="textarea"
              :placeholder="$t('请输入1-80个汉字，字母，数字')"
              resize="none"
              rows="3"
              v-model="addPhotoModel.cmnt">
            </meg-input>
          </meg-form-item>
        </meg-form>
      </div>
    </div>
    <div class="photo-add-footer">
      <meg-button
        type="primary"
        :disabled="saveDisable"
        @click="onBodyPhotoAddConfirm">
        {{ $t("保存") }}
      </meg-button>
      <meg-button @click="onBodyPhotoAddCancel">
        {{ $t("取消") }}
      </meg-button>
    </div>
  </div>
</template>
<script>

export default {
  components: {
  },
  props: {
    addPhotoData: {
      type: Object,
      default: () => {}
    },

  },
  data() {
    return {
      addPhotoModel: {
        carNo: '',
        cmnt: '',

      },
      saveDisable: false,
      initPhotoFile: [],
      // databaseType: 'STATIC',
      sfzData: {},
      identitySelected: [],
      isJumpData: false, // 是否跳转
      genderOptions: this.$store.getters.dataMapByType('common_gender'), // 性别选择
      nationOptions: this.$store.getters.dataMapByType('common_people'), // 民族选择
      identityOptions: this.$store.getters.dataMapByType('album_card'), // 证件类型选择
      originOptions: this.$store.getters.dataMapByType('common_origin'), // 籍贯选择
      matchedOriginOptions: [],
      imageUploadError: {
        isShow: false,
        errorText: this.$t('请上传人体')
      },
      isSFZshow: true, // 是否显示身份证相关信息
      deployObject: '2',
      addPhotoRules:
      {
        carNo: [{
          min: 0, max: 10, message: this.$t('最多10个字符'), trigger: 'blur'
        }],
        cmnt: [{
          min: 1, max: 80, message: this.$t('请输入1-80位汉字、数字、字母'), trigger: 'blur'
        }],
      }
    };
  },
  watch: {

  },
  created() {
  },
  beforeMount() {
    // 判断数据进行挂载
    if (Object.keys(this.addPhotoData).length !== 0) {
      this.isJumpData = true;
      Object.assign(this.addPhotoModel, this.addPhotoData);
    }
  },
  methods: {

    /**
     * 保存按钮点击
     */
    onBodyPhotoAddConfirm() {
      this.$refs.addBodyPhotoForm.validate((valid) => {
        if (valid) {
          this.$emit('photo-add-confirm', this.addPhotoModel);
        }
      });
    },
    /**
     * 取消点击
     */
    onBodyPhotoAddCancel() {
      console.log(33333333333);
      this.$emit('photo-add-cancel');
    },
  }
};
</script>
<style lang="scss" scoped>
.photo-add {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 5px 25px 0px 25px;
  display: flex;
  flex-direction: column;
  .photo-add-content {
    display: flex;
    flex: 1;
  }
  .photo-upload {
    height: 340px;
    width: 340px;
    .image-upload-error {
      color: #f56c6c;
      font-size: 12px;
      line-height: 1;
      padding-top: 4px;
    }
  }
  .photo-add-form {
    flex: 1;
    flex-shrink: 0;
    display: flex;
    .add-form {
      display: flex;
      flex: 1;
      width: 50%;
      flex-direction: column;
    }
  }
  .photo-add-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-bottom: 20px;
  }
  .pre-input-select {
    width: 90px;
  }

}
</style>
