<template>
  <div class="select-toolbar">
    <div
      class="select-toolbar-wrapper">
      <div
        class="select-toolbar-switch">
        <div
          @mouseenter="handleShowSwitchPannel('high')"
          @mouseleave="handleCloseSwitchPannel"
          :class="{'is-active': activeTab !== '', 'high-switch': true}">
          <p>高级<br />筛选</p>
        </div>
      </div>
      <div
        class="high-switch-pannel"
        v-show="activeTab !== ''"
        @mouseenter="handleShowSwitchPannel('high')"
        @mouseleave="handleCloseSwitchPannel">
        <div
          @mouseenter="handleShowSwitchPannel('high')"
          class="high-pannel-container">
          <div class="filter-head">
            <meg-icon
              name="filter">
            </meg-icon>
            <div
              v-tooltip="true"
              :class="{
                'filter-title':true,
                'default':!filterTitle
              }">
              {{ filterTitle || '筛选相机' }}
            </div>
          </div>
          <div
            class="quick-pannel-top">
            <div class="quick-title">
              解析状态显示
            </div>
            <div class="pannel-switch">
              <meg-switch
                @change="openChange"
                v-model="open"
                active-color="#21539b"></meg-switch>
              <p>已开启</p>
            </div>
          </div>
        </div>
        <div
          class="filter-wrap"
          @mouseenter.stop="handleShowSwitchPannel('select')">
          <filter-form
            :is-labels="activeTab !== ''"
            class="high-filter-pannel"
            v-model="filterTitle"
            @confirm="confirm"
            :filter-condition="filterCondition"
            :is-camera-type="false"></filter-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FilterForm from '@/common-components/common-camera-selector/components/filter-form';
import MegMapSrv from './meg-map.service';

export default {
  components: {
    FilterForm
  },
  props: {
    // 是否只显示未解析的设备
    noAlalysis: {
      type: Boolean,
      default: false
    },
    // 是否只查询布控报警数据
    isDeploy: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      cameraType: ['治安监控', '人脸卡口', '交通卡口', '微卡口', '结构化相机'],
      filterTitle: '',
      activeTab: '',
      open: true,
      filterCondition: [],
      defaultSearchTypes: [] // 默认检索需要的卡口类型

    };
  },
  created() {
    this.getFilterCameraOptions();
  },
  methods: {
    handleCloseSwitchPannel() {
      if (this.tabHideTimer) clearTimeout(this.tabHideTimer);
      this.tabHideTimer = setTimeout(() => {
        if (this.activeTab !== 'select') this.activeTab = '';
      }, 150);
    },
    handleShowSwitchPannel(tabName) {
      if (this.tabHideTimer) clearTimeout(this.tabHideTimer);
      this.activeTab = tabName;
    },
    openChange() {
      this.$emit('change', this.open);
    },
    confirm(data) {
      const params = {
        ...data,
        types: data.types.length ? data.types : this.defaultSearchTypes
      };

      if (this.isDeploy) {
        this.getDeployCameraList(params);
      } else {
        this.getAnalysisCameraList(params);
      }

      this.activeTab = '';
    },
    /**
     *  获取解析状态相机列表
     */
    async getAnalysisCameraList(data) {
      const params = {
        range: 'valid',
        noAlalysis: this.noAlalysis,
        placeIds: data.places,
        unitIds: data.keyUnits,
        labels: data.labels,
        monitoringTypes: data.types
      };
      const res = await MegMapSrv.getAnalysisCameraList(params);
      this.$emit('filter-change', res.data);
    },
    /**
     *  获取已布控相机列表
     */
    async getDeployCameraList(data) {
      const params = {
        range: 'valid',
        placeIds: data.places,
        unitIds: data.keyUnits,
        labels: data.labels,
        monitoringTypes: data.types
      };
      const res = await MegMapSrv.getDeployCameraList(params);
      this.$emit('filter-change', res.data);
    },
    /*
     *  获取相机筛选类型数据
     * @TODO 有没有接口提供一套接口
    */
    getFilterCameraOptions() {
      const labels = MegMapSrv.getLabels();
      const places = MegMapSrv.getPlaces();
      const keyUnits = MegMapSrv.getKeyUnits();
      const types = this.$store.getters.dataMapByType('bayonet_type');
      this.defaultSearchTypes = types.map((item) => item.code);
      Promise.all([labels, places, keyUnits]).then((res) => {
        const filterCondition = ['labels', 'places', 'keyUnits'].map((key, index) => {
          if (res[index].code === 0) {
            return {
              label: key,
              value: res[index].data
            };
          }
          return null;
        });
        this.filterCondition = filterCondition.concat([{ label: 'types', value: types }]);
      });
    },
  }
};
</script>

<style lang='scss' scoped>
  .select-toolbar{
    position: absolute;
    top: 10px;
    right: 30px;
    z-index: 3;
    .select-toolbar-wrapper {
      width: 100%;
      position: relative;
      .high-switch-pannel {
        width: 300px;
        background-color: #fff;
        box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        position: absolute;
        top: 55px;
        right: 0;
        z-index: 3;
        .quick-pannel-top {
          padding: 0 20px 10px 20px;
          // border-bottom: 1px solid #dce1e5;
          .quick-title{
            font-size: 16px;
          }
          .pannel-switch {
            display: flex;
            justify-content: flex-start;
            align-content: center;
            align-items: center;
            margin-top: 10px;
            >p {
              color: #869abb;
              padding-left: 10px;
            }
          }
        }
        .high-pannel-container {
          padding-bottom: 382px;
        }
        .filter-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
          padding: 0 10px 0 10px;
          width: 270px;
          height: 46px;
          font-size: 14px;
          color: #869ABB;
          z-index: 100;
          cursor: pointer;
          .filter-title{
            flex: 1;
            color: #435068;
            padding: 0 7px 0 7px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            &.default{
              color: #869ABB;
            }
          }
          .fold-box{
            transform: rotate(0deg);
            transition: transform .5s;
            &.active{
              transform: rotate(180deg);
            }
            .meg-icon{
              color: #23519b;
            }
          }

        }
        .filter-wrap {
          margin: 0 15px;
          width: 270px;
          position: absolute;
          bottom: 0;
        }
        .high-filter-pannel {
          box-shadow: none;
          position: initial;
          padding: 0;
        }
      }
      .select-toolbar-switch {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.2);
        .is-active {
          background-color: #21539b !important;
          >p {
            color: #fff !important;
          }
        }
        .high-switch {
          width: 50px;
          height: 46px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #fff;
          cursor: pointer;
          >p {
            line-height: 1;
            font-size: 13px;
            color: #64718E;
          }
        }
      }
    }
  }
</style>
