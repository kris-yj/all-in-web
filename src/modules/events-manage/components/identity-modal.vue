<template>
  <meg-dialog
    :append-to-body="true"
    :width="width"
    :title="title"
    :visible="isShow"
    v-if="isShow"
    @close="handleCancel">
    <div class="identity-modal__content">
      <div class="identity-modal__aside">
        <div class="upload-item">
          <meg-img-container :img-src="faceImgUrl"></meg-img-container>
        </div>
        <meg-form
          ref="searchForm"
          :rules="rules"
          :model="searchModel"
          label-width="90px"
          label-position="top">
          <meg-form-item
            label="底库来源"
            prop="albumOrigin">
            <meg-select
              v-model="searchModel.albumOrigin"
              @change="onChangeLibraryType">
              <meg-option
                v-for="item in albumOriginOpts"
                :key="item.code"
                :label="item.value"
                :value="item.code">
              </meg-option>
            </meg-select>
          </meg-form-item>
          <meg-form-item
            label="底库类型"
            prop="albumType">
            <meg-select
              v-model="searchModel.albumType"
              @change="onChangeLibraryType">
              <meg-option
                v-for="item in albumTypeOpts"
                :key="item.code"
                :label="item.value"
                :value="item.code">
              </meg-option>
            </meg-select>
          </meg-form-item>
          <meg-form-item
            label="底库"
            prop="albumIds">
            <meg-select
              multiple
              collapse-tags
              v-model="searchModel.albumIds">
              <meg-option
                v-for="item in baseLibraryNameOpts"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </meg-option>
            </meg-select>
          </meg-form-item>
          <meg-form-item>
            <meg-button
              type="primary"
              @click="handleSearch">
              检索
            </meg-button>
          </meg-form-item>
        </meg-form>
      </div>
      <div class="identity-modal__main">
        <div class="identity-modal__header">
          <h3>共{{ searchList.length }}条相关底库信息</h3>
        </div>
        <div
          class="identity-modal__list"
          v-background="bgVisible">
          <div
            class="list-main"
            v-loading="loading">
            <meg-card-frame
              class="related-card"
              :card-min-width="258"
              :gap="10">
              <div
                class="list-item"
                v-for="(item, index) in searchList"
                :key="index">
                <div
                  class="item-checkbox">
                  <meg-checkbox
                    v-model="item.checked"
                    @click.native.stop></meg-checkbox>
                </div>
                <identity-card
                  :card="item"></identity-card>
              </div>
            </meg-card-frame>
          </div>
        </div>
      </div>
    </div>
    <div
      slot="footer"
      class="dialog-footer">
      <meg-button
        type="primary"
        :loading="btnLoading"
        @click="handleSure">
        确 定
      </meg-button>
      <meg-button
        @click="handleCancel">
        取 消
      </meg-button>
    </div>
  </meg-dialog>
</template>
<script>
import EventManageApi from '../events-manage.service';
import IdentityCard from './identity-card';

export default {
  name: 'IdentityModal',
  components: {
    IdentityCard
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '确认身份',
    },
    width: {
      type: String,
      default: '1100px',
    },
    identityData: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      isShow: this.visible,
      totalRecords: 0,
      searchModel: {
        albumType: '1',
        albumIds: [],
        albumOrigin: '1'
      },
      baseLibraryNameOpts: [],
      rules: {
        albumType: [{ required: true, message: '请选择底库类型', trigger: 'change' }],
        albumIds: [{ required: true, message: '请选择底库', trigger: 'change' }]
      },
      searchList: [],
      loading: false,
      btnLoading: false,
    };
  },
  computed: {
    bgVisible() {
      let visible = { icon: 'icon_1', text: '暂无数据' };
      if (this.searchList.length > 0 || this.loading) {
        visible = false;
      }
      return visible;
    },
    albumOriginOpts() {
      return this.$store.getters.dataMapByType('album_source');
    },
    albumTypeOpts() {
      return this.$store.getters.dataMapByType('album_deploy');
    },
    selectAll: {
      get() {
        return this.selectCount === this.searchList.length;
      },
      set(value) {
        this.searchList.forEach((item) => {
          item.checked = value;
        });
        return value;
      }
    },
    selectCount: {
      get() {
        let i = 0;
        this.searchList.forEach((item) => {
          if (item.checked) {
            i += 1;
          }
        });
        return i;
      }
    },
    checkedGroups: {
      get() {
        const checkedGroups = [];
        this.searchList.forEach((item) => {
          if (item.checked) {
            checkedGroups.push(item);
          }
        });
        return checkedGroups;
      }
    },
    faceImgUrl() {
      const url = this.identityData && this.identityData.cropUrl ? this.identityData.cropUrl : this.identityData.url;
      return url;
    }
  },
  watch: {
    visible(val) {
      this.isShow = val;
    },
  },
  created() {
    this.onChangeLibraryType();
  },
  methods: {
    /**
     * 底库列表
     */
    onChangeLibraryType() {
      this.baseLibraryNameOpts = [];
      const { albumOrigin, albumType } = this.searchModel;
      const reqParams = {
        srcType: albumOrigin ? [albumOrigin] : '',
        type: albumType ? [albumType] : ''
      };
      EventManageApi.fetchAlbums(reqParams).then((res) => {
        if (res.code === 0) {
          this.baseLibraryNameOpts = res.data;
          this.searchModel.albumIds = this.baseLibraryNameOpts.map((item) => item.id);
        }
      });
    },
    /**
     * 重置表单
     */
    resetFileds() {
      this.$refs.searchForm.resetFields();
    },
    /**
     * 检索
     */
    handleSearch() {
      this.$refs.searchForm.validate((valid) => {
        if (valid) {
          const { albumType, albumIds } = this.searchModel;
          const reqParams = {
            albumType,
            albumIds,
            faceList: [{
              isUrl: true,
              photoData: this.faceImgUrl
            }]
          };
          this.loading = true;
          EventManageApi.albumsSearch(reqParams).then((res) => {
            this.loading = false;
            if (res.code === 0) {
              this.searchList = res.data.candidateList.map((item) => ({
                ...item,
                checked: false
              }));
            } else {
              this.$message.error(res.msg);
            }
          });
        }
      });
    },
    /**
     * 关闭
     */
    handleCancel() {
      this.resetFileds();
      this.$emit('cancel');
    },
    /**
     * 确定
     */
    handleSure() {
      this.$refs.searchForm.validate((valid) => {
        if (valid) {
          if (!this.checkedGroups.length) return;
          const checkedGroupsArr = this.checkedGroups.slice(0);
          const photoList = checkedGroupsArr.map((item) => ({
            ...item,
            identityId: item.idCard,
            identityType: item.cardType,
          }));
          const { albumType, albumSource } = this.searchModel;
          const params = {
            eventId: this.$route.query.eventId,
            photoList,
            albumType,
            albumSource
          };
          this.btnLoading = true;
          EventManageApi.confimIdentity(params).then((res) => {
            this.btnLoading = false;
            if (res.code === 0) {
              this.$message.success(res.msg);
              this.$emit('success');
            } else {
              this.$message.error(res.msg);
            }
          });
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
  $color: #435068;
  .identity-modal__content {
      display: flex;
      justify-content: flex-start;
      height: 468px;
      .identity-modal__aside {
        width: 208px;
        padding-right: 20px;
        ::v-deep .meg-input {
            width: 208px;
        }
        ::v-deep .meg-button {
          width: 208px;
        }
        .upload-item{
          width: 142px;
          height: 142px;
          background-color: #efefef;
          margin: 0 auto 24px;
        }
      }
      .identity-modal__main {
        width: 812px;
        .identity-modal__header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          align-content: center;
          >h3 {
            font-size: 12px;
            color: rgba(67,80,104,0.50);
          }
        }
        .identity-modal__list {
          background-color: #DBE1E5;
          width: 100%;
          height: 434px;
          margin-top: 12px;
          padding: 12px;
          box-sizing: border-box;
          overflow: hidden;
          .list-main {
            height: 414px;
            overflow-y: scroll;
          }
          .list-item {
            position: relative;
            &:hover {
              transition: all .5s ease-in-out;
              .bottom-toolbar {
                display: block;
              }
              .item-detail {
                display: block;
              }
            }
            .item-checkbox {
              width: 14px;
              height: 14px;
              position: absolute;
              top: 4px;
              left: 4px;
              background: #FFFFFF;
              border-radius: 2px;
              z-index: 2;
              cursor: pointer;
            }
            .item-detail {
              width: 24px;
              height: 24px;
              display: none;
              position: absolute;
              top: 4px;
              right: 4px;
              background: #FFFFFF;
              border-radius: 2px;
              z-index: 2;
              cursor: pointer;
              .detail-icon {
                color: #D1D5DD;
              }
            }
          }
        }
      }
    }
</style>
