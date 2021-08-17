<template>
  <meg-form-container
    :prompt="$t('检索条件')"
    :button-text="$t('检索')"
    @search="formSearch"
    @reset="resetForm">
    <div slot="otherFormElement">
      <meg-form
        class="judge-search-form"
        label-position="top"
        label-width="80px"
        :model="activeFormData">
        <meg-form-item :label="$t('选择时间')">
          <meg-date-picker
            type="datetimerange"
            v-model="dateValue"
            range-separator="至"
            format="yyyy-MM-dd HH:mm"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="getDateValue"
            :picker-options="pickerOptions">
          </meg-date-picker>
        </meg-form-item>
        <meg-form-item :label="$t('相机')">
          <camera-select
            ref="albumRegionCamera"
            @cameras-updated="camerasUpdated"
            @change="getCameraIds"></camera-select>
        </meg-form-item>
        <meg-form-item :label="$t('底库')">
          <meg-treeselect
            ref="libraryTreeSelector"
            :show-checkbox="true"
            :props="{children: 'items', label: 'name'}"
            :search-placeholder="$t('输入底库名进行搜索')"
            :data="albumList">
          </meg-treeselect>
        </meg-form-item>
        <meg-form-item :label="$t('相似度')">
          <meg-input-number
            class="similarity"
            :controls="false"
            :placeholder="$t('最小值')"
            :max="100"
            :min="0"
            v-model.number="activeFormData.similarityMin">
          </meg-input-number> ~
          <meg-input-number
            class="similarity"
            :controls="false"
            :max="100"
            :min="0"
            :placeholder="$t('最大值')"
            v-model.number="activeFormData.similarityMax">
          </meg-input-number>
          <meg-form-item class="openStyle">
            <span @click="toggleMoreMode">
              {{ isMoreMode? $t('收起') : $t('更多') }}
              <meg-icon
                name="arrow_hollow"
                width="12"
                :dir="isMoreMode?'down':'up'"
                height="12"
                color="#21539b">
              </meg-icon>
            </span>
          </meg-form-item>
        </meg-form-item>
        <div v-show="isMoreMode">
          <meg-form-item
            class="form_t"
            :label="$t('姓名')">
            <div class="meg-select">
              <meg-input
                :placeholder="$t('请输入姓名')"
                v-model="activeFormData.name"></meg-input>
            </div>
          </meg-form-item>
          <meg-form-item :label="$t('证件号')">
            <div class="input-with-select idcard">
              <meg-input
                :placeholder="$t('证件号')"
                v-model="activeFormData.cardNo">
                <meg-select
                  class="select"
                  v-model="activeFormData.cardType"
                  slot="prepend"
                  :placeholder="$t('请选择')">
                  <meg-option
                    v-for="item in dataMap.album_card"
                    :key="item.value"
                    :label="item.value"
                    :value="item.code"></meg-option>
                </meg-select>
              </meg-input>
            </div>
          </meg-form-item>
          <meg-form-item :label="$t('性别')">
            <div class="meg-select">
              <meg-select v-model="activeFormData.gender">
                <meg-option
                  v-for="item in genderOption"
                  :key="item.code"
                  :label="item.value"
                  :value="item.code">
                </meg-option>
              </meg-select>
            </div>
          </meg-form-item>
          <meg-form-item :label="$t('年龄范围')">
            <div class="meg-select">
              <meg-select v-model="activeFormData.ageLevel">
                <meg-option
                  v-for="item in ageOption"
                  :key="item.code"
                  :label="item.value"
                  :value="item.code">
                </meg-option>
              </meg-select>
            </div>
          </meg-form-item>
          <meg-form-item :label="$t('籍贯')">
            <div class="meg-input">
              <meg-input
                :placeholder="$t('请输入籍贯')"
                v-model="activeFormData.origin"></meg-input>
            </div>
          </meg-form-item>
          <meg-form-item :label="$t('备注')">
            <div class="meg-input">
              <meg-input
                :placeholder="$t('备注')"
                v-model="activeFormData.cmnt"></meg-input>
            </div>
          </meg-form-item>
        </div>
      </meg-form>
    </div>
  </meg-form-container>
</template>
<script>
import CameraSelect from '@/common-components/common-camera-selector';

const DefaultFormData = {
  albumIds: [],
  cameraIds: [],
  ageLevel: '',
  beginTime: 0,
  endTime: '',
  cardNo: '',
  cardType: '',
  cmnt: '',
  gender: '',
  jobId: '',
  name: '',
  origin: '',
  similarityMax: 100,
  similarityMin: 0,
};

const getAlbum = function (arr) {
  return arr.reduce((arc, item) => (item.flag === 'node' ? [...arc, item.id] : getAlbum(item.items)), []);
};
export default {
  components: {
    CameraSelect
  },
  props: {
    type: {
      type: String,
      default() {
        return 'photo';
      }
    },
    formData: {
      type: Object,
      default() {
        return {};
      }
    },
    cameraList: {
      type: Array,
      default() {
        return [];
      }
    },
    albumList: {
      type: Array,
      default() {
        return [];
      }
    },
  },
  data() {
    return {
      dateValue: [],
      pickerOptions: {
        shortcuts: [
          'today',
          'pastThreeDays',
          'pastWeek',
          'pastMonth'
        ]
      },
      allCameraIds: [],
      appearCount: 2,
      threshold: 80,
      activeFormData: {
        albumIds: [],
        cameraIds: []
      },
      initFile: [],
      filterVisible: false,
      filterData: {},
      jumpFlag: false,
      isMoreMode: false,
      genderOption: [],
      ageOption: [],
      cameraNodeList: [],
      albumNodeList: [],
    };
  },
  computed: {
    dataMap() {
      return this.$store.getters.dataMap;
    },
    allAlbumIds() {
      return getAlbum(this.albumList);
    }
  },
  watch: {
    formData: {
      handler(val) {
        Object.assign(DefaultFormData, val);
        this.activeFormData = { ...DefaultFormData };
      },
      immediate: true
    },
  },
  mounted() {
    this.activeFormData = Object.assign(DefaultFormData, this.formData);
    const { dataMap } = this.$store.getters;
    this.genderOption = [{ code: '', value: this.$t('全部') }, ...dataMap.common_gender];
    this.ageOption = [{ code: '', value: this.$t('全部') }, ...dataMap.realtime_age];
  },
  methods: {

    /**
     * 重置
     */
    resetForm() {
      this.$refs.libraryTreeSelector.setCheckedKeys([]);
      this.$refs.albumRegionCamera.reset();
      this.dateValue = [];
      this.activeFormData = Object.assign(this.activeFormData, DefaultFormData);
    },
    camerasUpdated(nodesData) {
      const ids = nodesData.reduce((arc, item) => (item.flag === 'camera' ? [item.id, ...arc] : arc), []);
      this.allCameraIds = ids;
    },
    /**
     * 接受相机选择组件的选择的相机Id
     * @param {ids} 相机Id数组
     */
    getCameraIds(ids) {
      this.activeFormData.cameraIds = ids;
    },
    /**
     * 函数作用
     */
    formSearch() {
      this.getAlbumIds();
      if (this.activeFormData.cameraIds.length === 0) {
        this.activeFormData.cameraIds = this.allCameraIds;
      }
      if (this.activeFormData.albumIds.length === 0) {
        this.activeFormData.albumIds = this.allAlbumIds;
      }
      if (this.dateValue.length === 0) {
        delete this.activeFormData.beginTime;
        delete this.activeFormData.endTime;
      }
      this.$emit('confirm', this.activeFormData);
    },
    /**
     * 接受底库选择组件的选择的底库Id
     * @param {ids} 底库Id数组
     */
    getAlbumIds() {
      const ids = this.$refs.libraryTreeSelector.getCheckedKeys(null, true);
      this.activeFormData.albumIds = ids;
    },
    getDateValue() {
      if (Array.isArray(this.dateValue) && this.dateValue[0] && this.dateValue[1]) {
        this.activeFormData.beginTime = this.dateValue[0].getTime();
        this.activeFormData.endTime = this.dateValue[1].getTime();
      }
    },
    /**
     * 切换更多条件面板
     */
    toggleMoreMode() {
      this.isMoreMode = !this.isMoreMode;
    },
  }
};
</script>
<style lang="scss" scoped>
.judge-search-form{
  padding: 20px 25px 0;
  .form-header{
    padding: 9px 0;
    border-bottom: 1px solid #f9f9f9;
    .el-form-item__content{
      display: flex;
      line-height: 40px;
      .form-title{
        flex: 1;
      }
    }

  }
  .photo-form-item{
    margin: 0px auto 30px;
    height: 150px;
    width: 150px;
    div.el-form-item__content{
      height: 100%;
      line-height: 14px;
    }
  }
  .select {
    width: 100px;
  }
  .small-font{
    .el-form-item__content{
      font-size: 12px;
      color: #999;
    }
  }
  .similarity{
    width: 110px;
    .el-input__inner{
      padding: 0;
      text-align: center;
    }
  }
  .openStyle {
    margin-bottom: -12px;
    span {
      cursor: pointer;
      color: #21539b;
      font-size: 14px;
    }
  }
  .search-item-container{
    height: 70px;
  }
  .search-item-container p{
    line-height: 26px;
    font-size: 12px;
    color: #435068;
  }
}
.camera-right-container{
  background: #ffffff;
  border-radius: 10px;
  width: 300px;
  height: 400px;
  padding: 10px;
  box-sizing: border-box;
}
.node-select-menu{
  position: absolute;
  cursor: pointer;
  right: 7px;
  top: 0;
  display: inline-block;
  width: 20px;
  height: 34px;
  line-height: 34px;
  z-index: 1000;
}
</style>
