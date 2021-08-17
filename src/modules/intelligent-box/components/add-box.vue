<template>
  <div class="add-box">
    <meg-dialog
      width="1100px"
      :title="isAddBox ? $t('新建智能盒') : $t('编辑智能盒')"
      :visible="isAddBox || isEditBox"
      :close-on-click-modal="false"
      @close="cancelBoxDialog">
      <div
        class="box-dialog">
        <meg-scrollbar>
          <div class="box-form">
            <meg-form
              :model="formData"
              ref="addBox"
              :rules="rules"
              label-width="128px">
              <meg-form-item
                :label="$t('智能盒名称')"
                prop="name">
                <meg-input
                  v-model.trim="formData.name"
                  :placeholder="$t('请输入{from}-{to}个字符',{
                    from:2,
                    to:50
                  })"></meg-input>
              </meg-form-item>
              <meg-form-item
                prop="manufacturer"
                :label="$t('厂商')">
                <meg-select
                  v-model="formData.manufacturer"
                  @change="getCameraModel">
                  <meg-option
                    :key="item.code"
                    v-for="item in manufacturesrsOption"
                    :label="item.value"
                    :value="item.code"></meg-option>
                </meg-select>
              </meg-form-item>
              <meg-form-item
                :label="$t('智能盒型号')"
                prop="model">
                <meg-select
                  v-model="formData.model"
                  :disabled="isEditBox ? true : false"
                  @change="modelChange"
                  :placeholder="$t('智能盒型号')">
                  <meg-option
                    v-for="item in boxModelOption"
                    :key="item.code"
                    :value="item.code"
                    :label="item.value"></meg-option>
                </meg-select>
              </meg-form-item>
              <meg-form-item
                :label="$t('智能盒编号')"
                prop="number">
                <meg-input
                  v-model.trim="formData.number"
                  :placeholder="$t('请输入{from}-{to}个字符',{
                    from:1,
                    to:50
                  })"></meg-input>
              </meg-form-item>
              <meg-form-item
                :label="$t('智能盒SN码')"
                prop="snNumber">
                <meg-input
                  v-model.trim="formData.snNumber"
                  :placeholder="$t('请输入{from}-{to}个字符',{
                    from:1,
                    to:50
                  })"></meg-input>
              </meg-form-item>
              <meg-form-item
                :label="$t('归属部门')"
                :prop="'deptId'">
                <meg-treeselect
                  ref="deptTree"
                  :show-count="false"
                  standard-tree-data
                  :data="orgTreeItemDatas"
                  :props="deptProps"
                  :single-check="true"
                  node-key="id"
                  default-expand-all
                  highlight-current
                  :placeholder-text="deptPlaceholder"
                  @node-click="handleNodeClick">
                </meg-treeselect>
              </meg-form-item>
              <meg-form-item
                :label="$t('智能盒URL')"
                prop="url">
                <meg-input
                  resize="none"
                  rows="3"
                  v-model.trim="formData.url"
                  :placeholder="`${$t('例如')}  iot://admin:admin123@10.169.1.176:2360`"
                  type="textarea"></meg-input>
              </meg-form-item>
              <meg-form-item
                :label="$t('最大通道数')"
                prop="channelSize">
                <meg-select
                  v-model="formData.channelSize">
                  <meg-option
                    v-for="item in channelSizeData"
                    v-show="!(formData.model == 24 && item.code === '16')"
                    :key="item.code"
                    :value="item.code"
                    :label="item.value"></meg-option>
                </meg-select>
              </meg-form-item>
              <meg-form-item
                :label="$t('国标平台ID')"
                prop="gbPlatformId">
                <meg-input
                  v-model.trim="formData.gbPlatformId"
                  :placeholder="$t('请输入{entity}个字符',{
                    entity:20
                  })"></meg-input>
              </meg-form-item>
              <meg-form-item
                :label="$t('国标平台设备ID')"
                prop="gbPlatformDeviceId">
                <meg-input
                  v-model.trim="formData.gbPlatformDeviceId"
                  :placeholder="$t('请输入{entity}个字符',{
                    entity:20
                  })"></meg-input>
              </meg-form-item>
              <meg-form-item
                prop="remark"
                :label="$t('备注')">
                <meg-input
                  type="textarea"
                  resize="none"
                  rows="3"
                  v-model.trim="formData.remark"></meg-input>
              </meg-form-item>
            </meg-form>
          </div>
        </meg-scrollbar>
        <div class="box-map">
          <meg-form
            ref="mapForm"
            :model="formData"
            :rules="rules">
            <div class="map-form-item-container">
              <meg-form-item
                prop="lon"
                label-width="48px"
                class="map-location"
                :label="$t('经度')">
                <meg-input
                  placeholder=""
                  v-model.trim="formData.lon">
                </meg-input>
              </meg-form-item>
              <meg-form-item
                prop="lat"
                label-width="48px"
                class="map-location"
                :label="$t('纬度')">
                <meg-input
                  placeholder=""
                  v-model.trim="formData.lat">
                </meg-input>
              </meg-form-item>
              <meg-button
                @click="markOnMap"
                type="text"
                color="#21539B">
                {{ $t('标记') }}
              </meg-button>
            </div>
          </meg-form>
          <div class="map-area">
            <position-modify-map
              @location-change="locationChange"
              @clear-location="clearLocation"
              :feature-data="featureData"></position-modify-map>
          </div>
        </div>
      </div>
      <span slot="footer">
        <meg-button
          type="primary"
          :loading="isBoxLoading"
          @click="handleFormConfirm">{{ $t('保存') }}</meg-button>
        <meg-button
          @click="cancelBoxDialog">{{ $t('取消') }}</meg-button>
      </span>
    </meg-dialog>
  </div>
</template>

<script>
import PositionModifyMap from '@/common-components/common-maps/position-modify-map';

export default {
  components: {
    PositionModifyMap
  },
  props: {
    isEditBox: {
      type: Boolean,
      default: false
    },
    isAddBox: {
      type: Boolean,
      default: false
    },
    isBoxLoading: {
      type: Boolean,
      default: false
    },
    addFormData: {
      type: Object,
      default: () => {}
    },
    rules: {
      type: Object,
      default: () => {}
    },
    orgTreeItemDatas: { // 智能盒归属的部门树
      type: Array,
      default: () => []
    },
    shareListData: { // 共享人员
      type: Array,
      default: () => []
    },
    boxAuth: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      channelSizeData: this.$store.getters.dataMapByType('box_channel_number'),
      manufacturesrsOption: this.$store.getters.dataMapByType('box_company'),
      boxModelOption: this.$store.getters.dataMapByType('box_megvii_mode'),
      formData: { lon: '', lat: '', ...this.addFormData },
      filterName: '',
      // 部门tree prop
      deptProps: {
        children: 'subOrgs',
        label: 'orgName'
      },
      featureData: { lon: '', lat: '' },
    };
  },
  computed: {
    deptPlaceholder() {
      return '管辖部门';
    },
  },
  mounted() {
    setTimeout(() => {
      if (this.isEditBox) {
        // 设置默认选中
        this.$refs.deptTree.setCurrentKey([this.formData.deptId]);
        this.markOnMap(); // 标记地图
      }
      this.featureData = { lon: this.formData.lon, lat: this.formData.lat };
    }, 0);
  },
  methods: {
    /**
     * @description 监听地图内部经纬度变化
     * @param {Array} location 内部传出的经纬度数组
     */
    locationChange(location) {
      this.$refs.mapForm.clearValidate();
      this.formData.lon = location.lon.toFixed(6);
      this.formData.lat = location.lat.toFixed(6);
      this.featureData = location;
    },
    clearLocation() {
      this.formData.lon = '';
      this.formData.lat = '';
      this.featureData = { lon: '', lat: '' };
    },
    /**
     * 设备型号切换事件
     */
    modelChange() {
      this.formData.channelSize = '';
    },
    /*
    * 智能盒归属部门树节点点击事件
    * */
    handleNodeClick(data) {
      this.formData.deptId = data.id;
      this.formData.deptName = data.orgName;
      this.$refs.deptTree.setPopoverVisibility(false);
      this.$refs.addBox.validateField(['deptId']);
    },
    /*
    * 提交新建或者编辑表单
    * */
    handleFormConfirm() {
      this.$refs.addBox.validate((valid) => {
        if (valid) {
          if (this.isAddBox) {
            this.confirmAddBox();
          } else if (this.isEditBox) {
            this.confirmEditBox();
          }
        }
      });
    },
    /*
    * 添加盒子确认
    * */
    confirmAddBox() {
      this.$emit('submit-add-box-form', this.formData);
    },
    /*
    * 编辑盒子确认
    * */
    confirmEditBox() {
      if (this.formData.type === '2' || this.formData.type === '3') {
        this.formData.rois = [];
      }
      this.$emit('submit-edit-box-form', this.formData);
    },
    /*
    * 关闭或者取消dialog
    * */
    cancelBoxDialog() {
      this.$emit('cancel-box-dialog');
    },
    /*
    * 在地图上标记
    * */
    markOnMap() {
      let { lat, lon } = this.formData;
      if (lat && lon) {
        lat = Number(lat).toFixed(6);
        lon = Number(lon).toFixed(6);
        this.featureData = { lon, lat };
      }
    },
    /**
     *  厂商变化更新盒子型号
     */
    getCameraModel() {
      // this.$emit('query-box-model', { manufacturer: this.formData.manufacturer });
    },
  }
};
</script>
<style lang="scss" scoped>
.box-select-menu {
  position: absolute;
  cursor: pointer;
  right: 5px;
  top: -2px;
  display: inline-block;
  width: 20px;
  height: 34px;
  line-height: 34px;
}

.box-map {
  flex: 1;
  padding: 0px 0px 0 16px;

  .map-form-item-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .map-location {
      width: 280px;
    }
  }

  .map-area {
    height: 412px;
  }
}
</style>
<style lang="scss" scoped>
.box-dialog {
  display: flex;
  height: 500px;
  width: 100%;
  border-bottom: 1px solid #f3f3f3;

  .meg-scrollbar {
    width: 100%;
  }

  .box-form {
    width: 398px;
    padding: 0px 30px 30px 0;

    .meg-select {
      width: 100%;
    }

    .add-box-meg-select {
      width: 90px;
      margin-bottom: 8px;
    }

    .meg-form-item__label {
      line-height: 34px;
    }

    .row-2 {
      display: inline-block;

      .meg-select {
        width: 130px;
      }

      & + .row-2 {
        margin-left: 10px;

        .meg-form-item__content {
          margin-left: 0 !important;
        }
      }
    }
  }

  .box-dept > .meg-form-item__content {
    margin-left: 0 !important;
  }
}
</style>
