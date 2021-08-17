<template>
  <meg-dialog
    class="photo-dialog"
    :visible="isShow"
    width="1250px"
    :append-to-body="appendToBody"
    :modal-append-to-body="appendToBody"
    :show-close="false"
    @close="onDialogClose">
    <div
      class="photo-dialog">
      <div class="photo-dialog-body">
        <button
          type="button"
          class="photo-dialog-close-btn"
          @click="onDialogClose">
          <meg-icon name="close"></meg-icon>
        </button>
        <meg-tabs
          class="photo-dialog-tabs"
          v-model="currentTab"
          type="card"
          @tab-remove="removePhotoTab">
          <meg-tab-pane
            v-for="(item, index) in photoTabs"
            :key="item.name"
            :closable="index === 0? false : true"
            :label="item.title"
            :name="item.name">
            <photo-add
              v-if="item.name==='add'"
              :add-photo-data="addPhotoData"
              :same-sfz-photos="sameSfzPhotos"
              :is-photo-saving="isPhotoSaving"
              :database-type="databaseType"
              @sfz-input-change="onSfzInputChange"
              @photo-add-same-sfz="onPhotoAddSameSfz"
              @photo-add-confirm="onPhotoAddConfirm"
              @photo-add-cancel="onClose">
            </photo-add>
            <body-add
              v-if="item.name==='bodyAdd'"
              :add-photo-data="addPhotoData"
              :same-sfz-body-photos="sameSfzBodyPhotos"
              :is-photo-saving="isPhotoSaving"
              @body-sfz-input-change="onBodySfzInputChange"
              @body-photo-add-same-sfz="onBodyPhotoAddSameSfz"
              @body-photo-add-confirm="onBodyPhotoAddConfirm"
              @body-photo-add-cancel="onBodyAddClose">
            </body-add>
            <car-and-plate-add
              v-if="item.name==='car' || item.name==='plate' "
              :add-photo-data="addPhotoData"
              @photo-add-confirm="onBodyPhotoAddConfirm"
              @photo-add-cancel="onBodyAddClose">
            </car-and-plate-add>
          </meg-tab-pane>
        </meg-tabs>
      </div>
    </div>
  </meg-dialog>
</template>
<script>
import _ from 'lodash';

import PhotoAdd from './photo-add';
import bodyAdd from './body-add';
import CarAndPlateAdd from './car-and-plate-add';

export default {
  name: 'PhotoDialogTabs',
  components: {
    PhotoAdd,
    bodyAdd,
    CarAndPlateAdd
  },
  props: {
    // 透传数据
    addPhotoData: {
      type: Object,
      default: () => {}
    },
    isPhotoSaving: {
      type: Boolean,
      default: false
    },
    isShow: {
      type: Boolean,
      default: false
    },
    databaseType: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: 'bodyAdd'
    },
    appendToBody: {
      type: Boolean,
      default: true
    },

  },
  data() {
    return {
      currentTab: '',
      photoTabs: [],
      photoInfoEdit: null,
      photoInfoInfo: null,
      sameSfzPhotos: {
        index: 0,
        photos: []
      },
      sameSfzBodyPhotos: {
        index: 0,
        photos: []
      },
      editType: '',
    };
  },
  methods: {
    addPhotoTabs(tabPanel = {}) {
      const { name, title } = tabPanel;
      const tab = _.find(this.photoTabs, (t) => t.name === name);
      if (name === 'add' && !tab) {
        this.photoTabs.push({
          name: 'add',
          title: this.$t('添加人像')
        });
      }
      if (name === 'bodyAdd' && !tab) {
        this.photoTabs.push({
          name: 'bodyAdd',
          title: title || this.$t('添加人体')
        });
      }
      if (name === 'car' && !tab) {
        this.photoTabs.push({
          name: 'car',
          title: title || this.$t('添加车辆')
        });
      }
      if (name === 'plate' && !tab) {
        this.photoTabs.push({
          name: 'plate',
          title: title || this.$t('添加车牌')
        });
      }
      this.currentTab = name;
    },
    setPhotoInfoEdit(data) {
      this.photoInfoEdit = data;
    },
    setPhotoInfo(data) {
      this.photoInfoInfo = data;
    },
    setSameSfzPhotos(data) {
      this.sameSfzPhotos = data;
    },
    // 人体的数据
    setSameBodySfzPhotos(data) {
      this.sameSfzBodyPhotos = data;
    },
    setSameSfzBodyPhotos(data) {
      this.sameSfzBodyPhotos = data;
    },
    afterDeletePhoto() {
      this.$emit('photo-dialog-close');
    },
    afterPhotoUpdate(photo, type) {
      if (this.photoTabs.length > 1) {
        const index = _.findIndex(this.photoInfoInfo, { id: photo.id });
        const originPhoto = _.find(this.photoInfoInfo, { id: photo.id });
        const photoSfz = _.find(photo.identitys, { code: 'sfz' });
        const originPhotoSfz = _.find(originPhoto.identitys, { code: 'sfz' });

        const infoTab = _.find(this.photoTabs, { name: 'info' }) || _.find(this.photoTabs, { name: 'bodyInfo' });
        if (originPhotoSfz && (!photoSfz || photoSfz.value !== originPhotoSfz.value) && infoTab.title === this.$t('同身份证号')) {
          this.photoInfoInfo.splice(index, 1);
        } else {
          this.photoInfoInfo.splice(index, 1, photo);
        }
        if (type === 'bodyEdit') {
          this.removePhotoTab('bodyEdit');
        } else {
          this.removePhotoTab('edit');
        }
        if (this.photoInfoInfo.length === 0 && this.photoTabs.length > 1) {
          if (infoTab.name === 'bodyInfo') {
            this.removePhotoTab('bodyInfo');
          } else {
            this.removePhotoTab('info');
          }
        }
      } else {
        this.$emit('photo-dialog-close');
      }
    },
    getOpenTags() {
      return this.photoTabs;
    },
    removePhotoTab(targetName) {
      let activeName = this.currentTab;
      const index = _.findIndex(this.photoTabs, { name: targetName });
      if (activeName === targetName) {
        const prevTab = this.photoTabs[index - 1];
        activeName = prevTab.name;
      }
      this.photoTabs.splice(index, 1);
      this.currentTab = activeName;
      this.resetDataByTab(targetName);
    },
    resetDataByTab(targetName) {
      if (targetName === 'edit') {
        this.photoInfoEdit = null;
      }
      if (targetName === 'info') {
        this.photoInfoInfo = null;
      }
    },
    resetPhotoDialog() {
      this.currentTab = '';
      this.photoTabs = [];
      this.photoInfoEdit = null;
      this.photoInfoInfo = null;
      this.sameSfzPhotos = {
        index: 0,
        photos: []
      };
      this.sameSfzBodyPhotos = {
        index: 0,
        photos: []
      };
    },
    // 人像
    onSfzInputChange(params = {}) {
      this.$emit('photo-add-sfz-change', params);
    },
    onPhotoAddSameSfz() {
      this.$emit('photo-add-same-sfz');
    },
    // 人体
    onBodyPhotoAddSameSfz() {
      this.$emit('body-photo-add-same-sfz');
    },
    onPhotoAddConfirm(addModel = {}) {
      this.$emit('photo-add-confirm', addModel);
    },
    onPhotoEditConfirm(editModel = {}) {
      this.$emit('photo-edit-confirm', editModel);
    },
    onBodyPhotoAddConfirm(addBodyModel = {}) {
      this.$emit('photo-add-confirm', addBodyModel);
    },

    onBodySfzInputChange(params = {}) {
      this.$emit('body-photo-add-sfz-change', params);
    },
    /**
     * 关闭dialog
     */
    onClose() {
      this.$emit('photo-dialog-close');
    },
    // 关闭添加人体
    onBodyAddClose() {
      console.log(23123);
      this.$emit('photo-dialog-close');
    },
    onDialogClose() {
      this.$emit('photo-dialog-close');
      this.resetPhotoDialog();
    },
  }
};
</script>
<style lang="scss">
  .photo-dialog {
    height: 100%;
    // TODO：覆盖样式
    .meg-dialog__header {
      display: none;
    }
    .meg-dialog__body{
      padding:0px;
    }
    .photo-dialog-body {
      height: 600px;
      position: relative;
      .photo-dialog-tabs {
        height: 100%;
        .meg-tabs__content {
          height: calc(100% - 71px);
          box-sizing: border-box;
          .meg-tab-pane {
            height: 100%;
          }
        }
        .meg-tabs__item {
          padding: 0 25px;
        }
      }
    }
    .photo-dialog-close-btn {
      &:hover {
        color: #21539b;
      };
      position: absolute;
      top: 0;
      right: 25px;
      line-height: 56px;
      padding: 0;
      background: transparent;
      border: none;
      outline: none;
      cursor: pointer;
      font-size: 20px;
      z-index: 90;
      color: #909399;
    }
    .meg-tabs__item {
      font-size: 16px;
      font-weight: 600;
      color: #435068;
      height: 56px;
      line-height: 56px
    }
  }
</style>
