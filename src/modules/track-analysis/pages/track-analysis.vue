<template>
  <page-layout>
    <div class="track-analysis">
      <meg-form-container
        :button-text="$t('分析')"
        @search="formSearch"
        @reset="resetForm">
        <div
          slot="header"
          class="form-title">
          {{ $t("轨迹找人") }}
        </div>
        <meg-scrollbar
          slot="otherFormElement">
          <div
            class="track-control-box">
            <div
              v-for="(item, index) of defaultData"
              :class="['control-item', item.id === selectFeature.id? 'activeItem' : null]"
              @click="selectedActive(item, index)"
              @mouseenter="itemEnter(index)"
              @mouseleave="itemLeave"
              :key="index">
              <div class="control-title">
                <div class="control-tilte-name">
                  {{ $t('选择轨迹点') }}{{ index + 1 }}
                </div>
                <div
                  v-if="(item.id === selectFeature.id) || (hoverInd ===index)"
                  class="control-reset">
                  <meg-button
                    @click.stop="resetTrack(item,index)"
                    type="text">
                    {{ $t('重置') }}
                  </meg-button>
                  <meg-button
                    :class="['choose-button', !isShowDelButton ? 'disiabled-button': null]"
                    @click.stop="delTrack(item,index)"
                    type="text">
                    {{ $t('移除') }}
                  </meg-button>
                </div>
              </div>
              <div class="control-content">
                <div class="control-content-item">
                  <div class="item-title">
                    {{ $t('已选择{count}个摄像机', {count: item.cameraIds.length}) }}
                  </div>
                  <div class="item-value">
                    <div
                      @click="addFeature(item, index)"
                      class="control-mark">
                      {{ item.lon ? $t('清除标记'): $t('手动标记') }}
                    </div>
                    <common-camera-select
                      ref="cameraSelect"
                      class="camera-box"
                      :disabled="!item.lon"
                      :default-ids="item.cameraIds"
                      mode="other"
                      @cameras-updated="camerasUpdated"
                      :clearable="false"
                      @change="checkChange($event, index)">
                    </common-camera-select>
                  </div>
                </div>
                <div class="control-content-item">
                  <div class="item-title">
                    {{ $t('选择区域半径') }}
                  </div>
                  <meg-input
                    v-model="item.radius"
                    :disabled="!item.lon"
                    :placeholder="$t('请输入区域半径')">
                    <template slot="append">
                      m
                    </template>
                  </meg-input>
                </div>
                <div class="control-content-item">
                  <div class="item-title">
                    {{ $t('选择时间') }}
                  </div>
                  <meg-date-picker
                    :disabled="!item.lon"
                    :ref="'datePicker'+index"
                    type="datetimerange"
                    v-model="item.defaultTime"
                    :prefix-icon-visible="false"
                    :range-separator="$t('至')"
                    format="yyyy-MM-dd HH:mm"
                    :default-time="['00:00:00','23:59:59']"
                    :start-placeholder="$t('开始日期')"
                    :end-placeholder="$t('结束日期')"
                    @click.native="selectedActive(item, index)"
                    :picker-options="pickerOptions()">
                  </meg-date-picker>
                </div>
              </div>
            </div>
          </div>
          <div
            @click="addTrack"
            v-if="isShowAddButton"
            class="add-button">
            <meg-icon name="plus"></meg-icon>
          </div>
          <div class="selcet-box">
            <div class="selcet-item">
              <div class="item-label">
                {{ $t('档案类型') }}
              </div>
              <meg-select
                v-model="profileType"
                :placeholder="$t('请选择')">
                <meg-option
                  v-for="(item) in recordOptions"
                  :key="item.code"
                  :label="item.value"
                  :value="item.code">
                </meg-option>
              </meg-select>
            </div>
            <div
              v-if="profileType !== 2"
              class="selcet-item">
              <div class="item-label">
                {{ $t('底库') }}
              </div>
              <meg-treeselect
                ref="tree"
                :data="libraryData"
                :props="{children: 'items', label: 'name'}"
                :highlight-current="true"
                :show-checkbox="true"
                :expand-on-click-node="false"
                :selected-count-text="$t('已选择{count}底库')"
                :placeholder-text="$t('请选择底库')"
                :all-selected-text="$t('全部')"
                :search-placeholder="$t('输入底库名进行查找')">
              </meg-treeselect>
            </div>
          </div>
        </meg-scrollbar>
      </meg-form-container>
      <track-modify-map
        ref="map"
        class="track-modify-map"
        :draw-interaction-active="drawInteractionActive"
        :track-list="defaultData"
        :select-feature="selectFeature"
        @node-click="mapSelectedActive"
        @modify-change="modifyChange"
        @device-change="geomChanged"
        @location-change="locationChange">
        <template v-slot:hover="{ params }">
          <div class="camera-name">
            {{ params.name }}
          </div>
        </template>
      </track-modify-map>
    </div>
  </page-layout>
</template>

<script>
import { switchToModule } from '@/utils/utils';
import commonCameraSelect from '@/common-components/common-camera-selector';
import trackModifyMap from '@/common-components/common-maps/track-modify-map';
import trackAnalysisSrv from '../track-analysis.service';

let ID = 1;
const DefaultDataItem = function (id) {
  this.defaultTime = [];
  this.cameraIds = [];
  this.regionLocation = null;
  this.areaRadius = '';
  this.cameras = [];
  this.radius = 20;
  this.id = id + ID;
  ID += 1;
};

export default {
  components: {
    trackModifyMap,
    commonCameraSelect
  },
  data() {
    return {
      profileType: -1,
      defaultData: [new DefaultDataItem(0), new DefaultDataItem(1)],
      hoverInd: -1,
      activeInd: 0,
      featureActive: false,
      recordOptions: [
        {
          code: -1,
          value: this.$t('全部档案')
        },
        {
          code: 1,
          value: this.$t('实名档案')
        },
        {
          code: 2,
          value: this.$t('未实名档案')
        },
      ],
      libraryData: [],
      selectFeature: {
        lon: '',
        lat: ''
      },
      drawInteractionActive: false
    };
  },
  computed: {
    isShowAddButton() {
      return this.defaultData.length < 5;
    },
    isShowDelButton() {
      return this.defaultData.length > 2;
    },
  },
  watch: {
    defaultData: {
      handler(val) {
        this.$refs.map.selectFeatures(val[this.activeInd].cameraIds);
      },
      deep: true
    },
  },
  created() {
    this.getAlbumList();
  },
  methods: {
    getAlbumList() {
      trackAnalysisSrv.getAlbumList().then((res) => {
        if (res.code === 0) {
          const albumListRoot = {
            flag: 'root',
            name: this.$t('全部'),
            id: 'albumListRoot',
            items: res.data
          };
          this.libraryData = [albumListRoot];
        }
      });
    },
    camerasUpdated(data) {
      if (this.featureActive) return;
      this.featureActive = true;
      this.$refs.map.setFeatures(data);
    },
    checkChange(e, ind) {
      this.defaultData[ind].cameraIds = e;
    },
    addTrack() {
      this.defaultData = [...this.defaultData, new DefaultDataItem(this.defaultData.length)];
    },
    delTrack(item, ind) {
      this.selectedActive(item, ind);
      if (!this.isShowDelButton) return;
      this.$confirm(this.$t('移除该点轨迹顺序会改变，继续移除？'), this.$t('移除轨迹点'), {
        confirmButtonText: this.$t('确定'),
        showCancelButton: true,
        type: 'warning'
      }).then(() => {
        this.$delete(this.defaultData, ind);
        this.$message({
          type: 'success',
          message: this.$t('删除成功!')
        });
      });
    },
    selectedActive(item, ind) {
      if (!item.lon) this.drawInteractionActive = true;
      this.activeInd = ind;
      this.selectFeature = item;
    },
    mapSelectedActive(selected) {
      this.activeInd = this.defaultData.findIndex((item) => item.id === selected.id);
      this.selectFeature = selected;
    },
    addFeature(item, ind) {
      if (item.lon) {
        this.$set(this.defaultData, ind, ({
          ...this.defaultData[ind],
          lon: null,
          lat: null,
          radius: 20,
          cameraIds: []
        }));
      } else {
        this.drawInteractionActive = true;
      }
    },
    modifyChange({ radius }) {
      this.$set(this.defaultData, this.activeInd, { ...this.defaultData[this.activeInd], radius });
    },
    geomChanged(features) {
      const cameraIds = features.map((camera) => camera.id);
      this.defaultData[this.activeInd].cameraIds = cameraIds;
      this.$refs.cameraSelect[this.activeInd].setCheckedKeys(cameraIds);
    },
    locationChange([lon, lat]) {
      this.selectFeature = { ...this.selectFeature, lon, lat };
      this.$set(this.defaultData, this.activeInd, { ...this.defaultData[this.activeInd], lon, lat });
      this.drawInteractionActive = false;
    },
    resetTrack(item, ind) {
      this.$refs.cameraSelect[ind].reset();
      this.$set(this.defaultData, ind, new DefaultDataItem(this.defaultData.length));
      this.selectedActive(this.defaultData[ind], ind);
    },
    formSearch() {
      if (!this.checkedTime()) {
        this.$message.error(this.$t('请保证至少两个轨迹点信息填写完整'));
        return; // eslint-disable-line
      }
      this.defaultData = this.defaultData.filter((item) => item.defaultTime.length !== 0 && item.cameraIds.length > 0);
      const trackList = [];
      this.defaultData.forEach((val, ind) => {
        trackList[ind] = {
          startTime: val.defaultTime[0].getTime(),
          endTime: val.defaultTime[1].getTime(),
          cameraIds: val.cameraIds
        };
      });
      const searchParams = {
        trackList,
      };
      if (this.profileType !== -1) {
        searchParams.profileType = this.profileType;
      }
      if (this.profileType !== 2) {
        searchParams.albumIds = this.$refs.tree.getCheckedNodes(null, true).map((item) => item.coreId);
      }
      const moduleInfo = {
        module: 'track-analysis',
        child: 'analysis-result',
        query: { searchParams: JSON.stringify(searchParams) },
      };
      switchToModule(moduleInfo);
    },
    checkedTime() {
      return (this.defaultData.filter((item) => item.defaultTime.length !== 0 && item.cameraIds.length > 0)).length >= 2;
    },
    resetForm() {
      this.defaultData = [new DefaultDataItem(0), new DefaultDataItem(1)];
      this.selectFeature = {};
      this.activeInd = 0;
      this.$refs.cameraSelect.forEach((camera) => camera.reset());
      this.profileType = -1;
      this.$refs.tree.setCheckedKeys(null);
    },
    itemEnter(ind) {
      this.hoverInd = ind;
    },
    itemLeave() {
      this.hoverInd = -1;
    },
    pickerOptions() {
      return {
        disabledDate: (time) => {// eslint-disable-line
          if (this.defaultData.some((item) => item.defaultTime && item.defaultTime.length > 0)) {
            let leftLimit = null;
            let rightLimit = null;
            for (let i = 1; i < 5; i++) { // eslint-disable-line
              if (this.defaultData[this.activeInd - i] && this.defaultData[this.activeInd - i].defaultTime && this.defaultData[this.activeInd - i].defaultTime.length > 0) {
                leftLimit = this.defaultData[this.activeInd - i].defaultTime[0].getTime() - 24 * 3600 * 1000;
                break;  // eslint-disable-line
              }
            }
            for (let i = 1; i < 5; i++) { // eslint-disable-line
              if (this.defaultData[this.activeInd + i] && this.defaultData[this.activeInd + i].defaultTime && this.defaultData[this.activeInd + i].defaultTime.length > 0) {
                rightLimit = this.defaultData[this.activeInd + i].defaultTime[1].getTime();
                break; // eslint-disable-line
              }
            }

            if (leftLimit && rightLimit) {
              return time.getTime() < leftLimit || time.getTime() > rightLimit;
            }
            if (leftLimit) {
              return time.getTime() < leftLimit;
            }
            if (rightLimit) {
              return time.getTime() > rightLimit;
            }
          } else {
            return false;
          }
        },
      };
    },
  }
};
</script>
<style lang='scss' scoped>
.track-analysis {
  width: 100%;
  height: 100%;
  display: flex;
  .camera-name {
    background: white;
    line-height: 20px;
    height: 20px;
    padding: 0 5px;
  }
  ::v-deep .meg-scrollbar__view {
    background: #f0f0f0;
    padding-bottom: 20px;
  }
  ::v-deep .leftInteractive {
    background: #f0f0f0;
    .searchOperate {
      background: white;
      margin-right: 15px;
      margin-left: 0;
      padding: 0 20px 5px 20px;
      box-sizing: border-box;
      margin-right: 0px;
    }
  }
}
.form-title {
  box-sizing: border-box;
  width: 100%;
  height: 56px;
  line-height: 56px;
  padding-left: 20px;
  background: #eeeeee;
  font-size: 16px;
  color: #435068;
  font-family: SourceHanSansCN;
  font-weight: 900;
}
.add-button {
  height: 34px;
  background-color: #fff;
  color: #21539b;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  margin-left: 15px;
  margin-right: 15px;
}
.track-control-box {
  background: #f0f0f0;
  padding: 10px 10px;
  .activeItem {
    border: 3px solid #5b98e7;
  }
  .disiabled-button {
    color: #cccccc;
  }
}

.control-item {
  box-sizing: border-box;
  background: #ffffff;
  padding: 0 10px;
  box-shadow: 0 3px 5px 2px #E4E4E4;
  border-radius: 2px;
  border-radius: 2px;
  margin-bottom: 5px;
  cursor: pointer;
  .control-title {
    position: relative;
    border-bottom: 1px solid #efefef;
  }
  .control-tilte-name {
    font-family: SourceHanSansCN-Heavy;
    font-size: 16px;
    color: #000000;
    line-height: 50px;
    height: 50px;
    font-weight: 500;
  }
  .control-reset {
    position: absolute;
    right: 0;
    top: 9px;
  }
  .control-content-item {
    padding-top: 8px;
    padding-bottom: 5px;
  }
  .item-title {
    font-family: SourceHanSansCN-Normal;
    font-size: 14px;
    color: #000000;
    line-height: 28px;
    height: 28px;
  }
  .item-value {
    display: flex;
    width: 100%;
    .camera-box {
      width: 180px;
      height: 100%;
      ::v-deep .camera-select-reference {
        top: 9px;
      }
      ::v-deep .handler-wrap{
        display: block!important
      }
    }
  }
  .control-mark {
    width: 78px;
    height: 36px;
    line-height: 36px;
    box-sizing: border-box;
    text-align: center;
    background: #ffffff;
    border: 1px solid #a6bad7;
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;
    color: #21539B;
    border-radius: 2px;
    margin-right: 10px;
  }
}
.track-modify-map {
  flex: 1;
}
.selcet-box {
  background-color: #fff;
  padding: 0 10px 10px 10px;
  margin: 10px 15px;
  ::v-deep .meg-select{
    width: 100%;
  }
}
.selcet-item {
  .item-label {
    text-align: left;
    vertical-align: middle;
    font-size: 14px;
    color: #435068;
    line-height: 34px;
    padding: 0 12px 0 0;
    box-sizing: border-box;
  }
}
</style>
