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
          ref="addPhotoForm"
          :rules="addPhotoRules"
          class="add-form"
          label-width="81px"
          label-position="right"
          :model="addPhotoModel">
          <div class="basic-info">
            <meg-form-item
              :label="$t('姓名')"
              prop="name">
              <meg-input
                v-model="addPhotoModel.name"
                :placeholder="$t('请输入1-80位汉字、数字、字母')"></meg-input>
            </meg-form-item>
            <meg-form-item
              :label="$t('在逃编号')"
              prop="criminalNumber">
              <meg-input
                v-model="addPhotoModel.criminalNumber"
                :placeholder="$t('请输入在逃编号')"></meg-input>
            </meg-form-item>
            <meg-form-item :label="$t('性别')">
              <meg-radio-group v-model="addPhotoModel.gender">
                <meg-radio
                  v-for="item in genderOptions"
                  :key="item.code"
                  :label="item.code">
                  {{ item.value }}
                </meg-radio>
              </meg-radio-group>
            </meg-form-item>
            <meg-form-item
              v-if="addPhotoModel.nation"
              :label="$t('民族')">
              <meg-select
                class="meg-select database-select"
                v-model="addPhotoModel.nation.nationCode">
                <meg-option
                  v-for="item in nationOptions"
                  :key="item.code"
                  :label="item.value"
                  :value="item.code">
                </meg-option>
              </meg-select>
            </meg-form-item>
            <meg-form-item :label="$t('出生日期')">
              <meg-date-picker
                ref="datePicker"
                v-model="addPhotoModel.birthday"
                type="date"
                format="yyyy-MM-dd"
                :placeholder="$t('请选择出生日期')">
              </meg-date-picker>
            </meg-form-item>
            <meg-form-item
              class="origin-item"
              :label="$t('籍贯')">
              <meg-select
                class="origin-select meg-select"
                v-model="addPhotoModel.addrCode"
                filterable
                clearable
                remote
                :placeholder="$t('请输入选择籍贯')"
                :remote-method="asyncOriginMatched">
                <meg-option
                  v-for="item in matchedOriginOptions"
                  :key="item.code"
                  :label="item.value"
                  :value="item.code">
                </meg-option>
              </meg-select>
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
          </div>
          <div class="other-info">
            <div class="identity-content">
              <!-- <meg-scrollbar> -->
              <meg-form-item
                :label="$t('证件号')"
                label-width="114px"
                class="identity-form-item"
                v-for="(identity, index) in addPhotoModel.identitys"
                :key="index"
                :prop="'identitys.' + index + '.value'"
                :rules="[{min: 1, max: 30, message: $t('请输入1-30位数字、字母'), trigger: 'blur'}]">
                <meg-input
                  :placeholder="$t('请输入1-30位数字、字母')"
                  @clear="onIdentityClear(identity)"
                  v-model="identity.value">
                  <meg-select
                    class="pre-input-select"
                    v-model="identity.code"
                    slot="prepend"
                    :placeholder="$t('请选择')"
                    @change="identitySelectChange(identity.code, index)">
                    <meg-option
                      v-for="(identityOption) in identity.options"
                      :key="identityOption.code"
                      :label="identityOption.value"
                      :value="identityOption.code"></meg-option>
                  </meg-select>
                </meg-input>
                <meg-button
                  v-show="sameSfzPhotos.index === index && sameSfzPhotos.photos.length > 0"
                  type="text"
                  class="same-sfz-btn"
                  @click="onSameSfzPhoto">
                  {{ $t("查看同身份证号") }}
                </meg-button>
                <span class="action-btn">
                  <span
                    :style="{ visibility: addPhotoModel.identitys.length === 1? 'hidden' : '' }"
                    @click="deIdentity(index)">
                    <meg-icon
                      class="del-btn"
                      color="red white"
                      name="circle_del"></meg-icon>
                  </span>
                  <span
                    v-show="identityOptions.length !==addPhotoModel.identitys.length && index === addPhotoModel.identitys.length-1"
                    @click="addIdentity">
                    <meg-icon
                      class="add-btn"
                      name="delete"></meg-icon>
                  </span>
                </span>
              </meg-form-item>
              <!-- sfz -->
              <div v-if="isSFZshow">
                <meg-form-item
                  :label="$t('身份证签发机关')"
                  label-width="114px"
                  prop="identityExt.sfz.issueOrgan">
                  <meg-input
                    v-model="addPhotoModel.identityExt.sfz.issueOrgan"
                    :placeholder="$t('请输入签发机关')"></meg-input>
                </meg-form-item>
                <meg-form-item
                  :label="$t('身份证有效期')"
                  label-width="114px"
                  prop="identityExt.sfz.effectivePeriod">
                  <meg-input
                    v-model="addPhotoModel.identityExt.sfz.effectivePeriod"
                    :placeholder="$t('请输入身份证有效期')"></meg-input>
                </meg-form-item>
              </div>
            <!-- </meg-scrollbar> -->
            </div>
            <meg-form-item
              :label="$t('住址')"
              label-width="114px"
              prop="identityExt.sfz.homeAddress">
              <meg-input
                v-model="addPhotoModel.identityExt.sfz.homeAddress"
                :placeholder="$t('请输入住址')"></meg-input>
            </meg-form-item>
            <meg-form-item
              :label="$t('拍摄时间')"
              label-width="114px">
              <meg-date-picker
                v-model="addPhotoModel.st"
                type="date"
                format="yyyy-MM-dd"
                :placeholder="$t('请选择拍摄时间')">
              </meg-date-picker>
            </meg-form-item>
            <meg-form-item
              :label="$t('数据来源')"
              label-width="114px"
              prop="src">
              <meg-input
                v-model="addPhotoModel.src"
                :placeholder="$t('请输入1-30位汉字、数字、字母')"></meg-input>
            </meg-form-item>
            <div v-if="databaseType === 'MONITOR'">
              <meg-form-item
                :label="$t('布控原因')"
                label-width="114px"
                prop="monitorReason">
                <meg-input
                  type="textarea"
                  :placeholder="$t('请输入1-80个汉字，字母，数字')"
                  resize="none"
                  rows="3"
                  v-model="addPhotoModel.monitorReason">
                </meg-input>
              </meg-form-item>
              <meg-form-item
                :label="$t('报警联系人')"
                label-width="114px"
                prop="contact">
                <meg-input
                  v-model="addPhotoModel.contact"
                  :placeholder="$t('请输入姓名+联系电话')"></meg-input>
              </meg-form-item>
            </div>
          </div>
        </meg-form>
      </div>
    </div>
    <div class="photo-add-footer">
      <meg-button
        type="primary"
        :loading="isPhotoSaving"
        :disabled="saveDisable"
        @click="onPhotoAddConfirm">
        {{ $t("保存") }}
      </meg-button>
      <meg-button @click="onPhotoAddCancel">
        {{ $t("取消") }}
      </meg-button>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import moment from 'moment';

export default {

  props: {
    addPhotoData: {
      type: Object,
      default: () => {}
    },
    isPhotoSaving: {
      type: Boolean,
      default: false
    },
    isAddShow: {
      type: Boolean,
      default: false
    },
    sameSfzPhotos: {
      type: Object,
      default: () => ({
        index: 0,
        photos: []
      })
    },
    databaseType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      addPhotoModel: {
        name: '',
        gender: '1',
        photo: '',
        nation: {
          nationCode: ''
        },
        addrCode: '',
        birthday: '',
        cmnt: '',
        st: '',
        src: '',
        identitys: [],
        identityExt: {
          sfz: {
            homeAddress: '',
            effectivePeriod: '',
            issueOrgan: ''
          }
        },
        criminalNumber: '',
        monitorReason: '',
        contact: '',
      },
      saveDisable: false,
      // databaseType: 'STATIC',
      sfzData: {},
      identitySelected: [],
      isJumpData: false, // 是否跳转
      genderOptions: this.$store.getters.dataMapByType('common_gender'), // 性别选择
      nationOptions: this.$store.getters.dataMapByType('common_people'), // 民族选择
      identityOptions: this.$store.getters.dataMapByType('album_card'), // 证件类型选择
      originOptions: this.$store.getters.dataMapByType('common_origin'), // 籍贯选择
      matchedOriginOptions: [],

      isSFZshow: true, // 是否显示身份证相关信息
      addPhotoRules:
      {
        name: [{
          min: 1, max: 80, message: this.$t('请输入1-80位汉字、数字、字母'), trigger: 'blur'
        }],
        cmnt: [{
          min: 1, max: 80, message: this.$t('请输入1-80位汉字、数字、字母'), trigger: 'blur'
        }],
        src: [{
          min: 1, max: 30, message: this.$t('请输入1-30位汉字、数字、字母'), trigger: 'blur'
        }],
        monitorReason: [{
          min: 1, max: 80, message: this.$t('请输入1-80位汉字、数字、字母'), trigger: 'blur'
        }],
      }
    };
  },
  watch: {
    'addPhotoModel.identitys': {
      handler(newArr) {
        newArr.forEach((identity, index) => {
          if (identity.code === 'sfz') {
            // 检验身份证唯一性
            this.sameSfz(identity.value, index);
          }
        });
        newArr.some((item) => {
          this.isSFZshow = item.code === 'sfz';
          return this.isSFZshow;
        });
      },
      deep: true,
      immediate: true
    },
  },
  created() {
    this.initIdentities();
    this.sameSfz = _.debounce(this.sameSfz, 500);
  },
  beforeMount() {
    // 判断数据进行挂载
    if (Object.keys(this.addPhotoData).length !== 0) {
      this.isJumpData = true;
      Object.assign(this.addPhotoModel, this.addPhotoData);
      if (this.addPhotoModel.identitys.length === 0) {
        this.initIdentities();
      } else {
        this.addPhotoModel.identitys.forEach((item) => {
          item.options = this.buildIdentityOptions(item.code);
          this.identitySelected.push(item.code);
        });
      }
    }
  },
  methods: {
    onIdentityClear(identity) {
      if (identity.code === 'sfz') {
        this.sameSfzPhotos.index = 0;
        this.sameSfzPhotos.photos = [];
      }
    },
    initIdentities() {
      // 默认进来没有证件号显示
      this.identitySelected = [];
      const defaultCode = 'sfz';
      const defaultOption = {
        options: this.identityOptions,
        code: defaultCode,
        value: ''
      };
      this.addPhotoModel.identitys.push(defaultOption);
      this.identitySelected.push(defaultCode);
      // 有证件号
    },
    /**
     * 保存按钮点击
     */
    onPhotoAddConfirm() {
      this.$refs.addPhotoForm.validate((valid) => {
        if (valid && this.addPhotoModel.photo !== '') {
          const addr = _.find(this.matchedOriginOptions, { 'code': this.addPhotoModel.addrCode });
          this.addPhotoModel.addrMsg = addr ? addr.value : '';
          for (let i = 0; i < this.nationOptions.length; i += 1) {
            if (this.nationOptions[i].code === this.addPhotoModel.nation.nationCode) {
              this.addPhotoModel.nationCode = this.nationOptions[i].code;
              this.addPhotoModel.nationMsg = this.nationOptions[i].value;
            }
          }
          this.addPhotoModel.birthday = this.addPhotoModel.birthday ? moment(new Date(this.addPhotoModel.birthday)).format('YYYY-MM-DD') : '';
          this.addPhotoModel.st = this.addPhotoModel.st ? moment(new Date(this.addPhotoModel.st)).format('YYYY-MM-DD') : '';
          // delete this.addPhotoModel.nation;
          this.$emit('photo-add-confirm', this.addPhotoModel);
        }
      });
    },
    /**
     * 取消点击
     */
    onPhotoAddCancel() {
      this.$emit('photo-add-cancel');
    },
    asyncOriginMatched(query) {
      if (query !== '') {
        setTimeout(() => {
          this.matchedOriginOptions = this.originOptions.filter((item) => item.value.toLowerCase()
            .indexOf(query.toLowerCase()) > -1);
        }, 200);
      } else {
        this.matchedOriginOptions = [];
      }
    },
    sameSfz(value, index) {
      this.$emit('sfz-input-change', { value, index });
    },
    /**
     * 增加证件类型
     */
    addIdentity() {
      const newOptions = this.buildIdentityOptions();
      this.addPhotoModel.identitys.push({
        options: newOptions,
        code: newOptions[0].code,
        value: ''
      });
      this.identitySelected.push(newOptions[0].code);
      this.addPhotoModel.identitys.forEach((item) => {
        item.options = this.buildIdentityOptions(item.code);
      });
    },
    /**
     * 删除证件类型
     */
    deIdentity(index) {
      this.addPhotoModel.identitys.splice(index, 1);
      this.identitySelectChange();
    },
    /**
     * rebuild all select options
     */
    buildIdentityOptions(value) {
      return _.filter(this.identityOptions, (o) => _.indexOf(this.identitySelected, o.code) === -1 || (value && o.code === value));
    },
    /**
     * 证件类型选择change事件
     */
    identitySelectChange() {
      this.sameSfzPhotos.index = '0';
      this.sameSfzPhotos.photos = [];
      const selectedValue = [];
      this.addPhotoModel.identitys.forEach((item) => {
        selectedValue.push(item.code);
      });
      this.identitySelected = selectedValue;
      this.addPhotoModel.identitys.forEach((item) => {
        item.options = this.buildIdentityOptions(item.code);
      });
    },
    onSameSfzPhoto() {
      this.$emit('photo-add-same-sfz');
    },

  }
};
</script>
<style lang="scss">
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
        .basic-info {
          width: 48%;
        }
        .other-info {
          width: 450px;
          overflow-x: hidden;
          overflow-y: auto;
          max-height:447px;
        }
        div.meg-form-item {
          width: 396px;
          // margin-bottom: 13px;
        }
        .identity-form-item {
          position: relative;
          .meg-input-group--prepend .meg-select .meg-input__inner {
            padding: 0 3px !important;
          }
          .meg-input--suffix .meg-input__inner {
            padding-right: 22px;
          }
          .same-sfz-btn {
            position: absolute;
            top: 40px;
            right: 0px;
            font-size: 12px;
            padding: 0px;
          }
          .action-btn {
            width: 34px;
            cursor: pointer;;
            position: absolute;
            right: -36px;
            top: 0;
            .add-btn {
              color: #99bc6f;
              transform: rotate(45deg);
            }
            .del-btn {
              color: red;
              padding-right:2px;
            }
          }
        }
      }
    }
    .database-select, .origin-select {
      width: 100%;
    }
    .photo-add-footer {
      // height: 74px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-bottom: 20px;
    }
    .pre-input-select{
      width: 90px;
      }
     .meg-date-editor.meg-input, .meg-date-editor.meg-input__inner{
       width: 100%;
      }
  }

</style>
