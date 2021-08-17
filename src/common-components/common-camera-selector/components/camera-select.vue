<template>
  <div class="wrapper">
    <slot
      name="filter"
      :camerasData="camerasData"
      :filterCondition="filterCondition">
      <div
        class="container"
        @mouseenter.stop="handlerHistoryEnter"
        @mouseleave.stop="handlerHistoryLeave">
        <meg-button
          class="camera-map"
          v-if="mode==='map'"
          @click.stop="toggleMapMode"
          type="primary"
          plain
          icon="map-application_menu">
          地图选择
        </meg-button>
        <div
          :class="{
            [`meg-position-${mapIconPosition}`]: true,
            'meg-camera-select':true,
            'is-active': showPopover,
            'is-disabled': disabled
          }"
          @mouseenter.stop="mouseEnter"
          @mouseleave.stop="mouseLeave"
          @click="wrapClick">
          <span class="camera-select__placeholder">{{ placeholder }}</span>
          <div
            v-show="clearable && isHover && selectedIdsLength > 0"
            class="reset-box">
            <meg-icon
              name="clear"
              class="clear-icon"
              @click.stop="reset"></meg-icon>
          </div>
          <!-- 浮层 -->
          <meg-popover
            placement="right"
            width="160"
            v-model="showPopover"
            trigger="click"
            popper-class="camera-select-popover">
            <div
              class="camera-popover-content"
              v-loading="loading">
              <slot
                name="filter-tree"
                :camerasData="camerasData"
                :filterCondition="filterCondition">
                <filter-tree
                  ref="tree"
                  :tree-height="450"
                  :filter-condition="filterCondition"
                  @filter="filterCameras"
                  @change="onTreeCheckedChanged"
                  @tree-update-ready="treeUpdateReady">
                </filter-tree>
              </slot>
            </div>
            <div
              slot="reference"
              class="camera-select-reference">
              <div
                class="handler-wrap"
                @click="handlerClick">
                <meg-icon
                  name="meg-icon-library"
                  class="hamburger-icon"></meg-icon>
              </div>
            </div>
          </meg-popover>
          <div v-if="mode==='map' && mapVisible">
            <map-select
              ref="mapSelect"
              :no-alalysis="noAlalysis"
              :is-deploy="isDeploy"
              :map-loading="mapLoading"
              :visible.sync="mapVisible"
              :camera-info="cameraInfo"
              :filter-condition="filterCondition"
              :video-info="videoInfo"
              @get-camera-info="getCameraInfo"
              @filter="filterCameras"
              @change="onMapCheckedChanged">
            </map-select>
          </div>
        </div>
        <div
          v-show="isHistory && isShowHistory"
          class="searchbar-content">
          <ul class="searchbar-list">
            <li
              class="searchbar-list-item"
              v-for="(history, index) in historyList"
              :key="index">
              <div
                class="camera-info"
                @click="handleHistoryDetail(history)">
                <div
                  class="camera-name"
                  v-tooltip="true">
                  {{ history.cameraName }}
                </div>
                <div
                  class="camera-number"
                  v-tooltip="true">
                  <span>等</span>
                  <span>{{ history.cameraIds && history.cameraIds.length }}</span>
                  <span>个相机</span>
                </div>
              </div>
              <div
                class="close"
                @click.stop="handleDeleteHistoryList(history)">
                <meg-icon
                  class="close-icon"
                  name="clear"
                  width="12"
                  height="12"></meg-icon>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </slot>
  </div>
</template>

<script>
import moment from 'moment';
import CameraSelectSrv from '../camera-select.service';
import FilterTree from './filter-tree';
import MapSelect from './map-select';

// 当天0点-当天24点
const defaultStartTime = moment().startOf('day').toDate().getTime();
const defaultEndTime = moment().endOf('day').toDate().getTime();
/**
 * @TODO 1、fetch carmeraData add loading
 * 2、lastChecked for loop
 * 3、tree component set key
 */
// 默认获取相机的url
function noop() {
  return CameraSelectSrv.getCamerasTree;
}
export default {
  components: {
    FilterTree,
    MapSelect
  },
  props: {
    // 地图图标位置
    mapIconPosition: {
      type: String,
      default: 'top'
    },
    // 默认选中的id数组
    defaultIds: {
      type: Array,
      default: () => []
    },
    // 默认全选 , 与defaultIds冲突，且优先级低于defaultIds
    defaultSelectAll: {
      type: Boolean,
      default: false,
    },
    // 获取相机树时的默认参数
    defaultParams: {
      type: Object,
      default: () => {
      }
    },
    mode: {
      type: String,
      default: 'map'
    },
    clearable: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    cameraDataFunc: {
      type: Function,
      default: noop,
    },
    // 是否外部自己传数据
    isOut: {
      type: Boolean,
      default: false,
    },
    // 是否只显示未解析的设备
    noAlalysis: {
      type: Boolean,
      default: false
    },
    // 是否只查询布控报警数据
    isDeploy: {
      type: Boolean,
      default: false
    },
    // 是否展示历史记录
    isShowHistory: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      camerasData: [],
      selectedCameraIds: [],
      showPopover: false,
      mapVisible: false,
      isHover: false,
      cameraInfo: {},
      videoInfo: {},
      lastChecked: [],
      defaultInitState: false, // 用于操作树组件的默认全选和默认传值
      filterCondition: [], // 相机筛选条件
      loading: false,
      mapLoading: false,
      selectedCameraNodes: [], // 选中的camera
      historyList: [],
      isHistory: false,
      delay: (() => {
        let r = () => {};
        const p = new Promise((_r) => { r = _r; });
        return { r, p };
      })(),
    };
  },
  computed: {
    selectedIdsLength() {
      return this.selectedCameraIds.length;
    },
    placeholder() {
      return this.selectedIdsLength > 0
        ? this.$t('已选{count}个', { count: this.selectedIdsLength })
        : this.$t('请选择');
    },
  },
  created() {
    this.init();
  },
  beforeDestroy() {
    if (this.wrapTimer) clearTimeout(this.wrapTimer);
    if (this.toggleMapTimer) clearTimeout(this.toggleMapTimer);
    this.camerasData = [];
    this.selectedCameraIds = [];
    this.filterCondition = [];
  },
  methods: {
    fetchCameraSelectHistoryList() {
      const reqParams = {
        userId: this.$store.getters.user.id,
        limit: 5,
      };
      CameraSelectSrv.getCameraSelectHistoryList(reqParams).then((res) => {
        if (res.code === 0) {
          // 筛选出存在的相机
          const filterRecords = res.data.records.filter((item) => item.cameraIds.filter((id) => this.featureArray.filter((record) => record.id === id)));
          // 筛选出第一个相机，如果没有依次向下取
          if ((filterRecords && filterRecords.length > 0) && (this.featureArray.length > 0)) {
            this.historyList = res.data.records.map((record) => {
            // 相机名称为所选批量相机的第一个相机ID
              const [firstCameraInfo] = this.featureArray.filter((item) => {
                for (let i = 0; i < record.cameraIds.length; i += 1) {
                  if (item.id === record.cameraIds[i]) {
                    return true;
                  }
                }
                return false;
              });
              // const [firstCameraInfo] = this.featureArray.filter((item) => item.id === record.cameraIds[0]);
              if (firstCameraInfo) {
                return {
                  cameraName: firstCameraInfo.name,
                  ...record,
                };
              }
              return undefined;
            }).filter((item) => item); // 筛选掉没有值，用户删除了相机，但是相机历史记录没有把相机去掉
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    handleHistoryDetail(item) {
      const { cameraIds } = item;
      this.setCheckedKeys(cameraIds);
    },
    handleDeleteHistoryList(item) {
      const { id } = item;
      CameraSelectSrv.deleteCameraSelectHistoryList(id).then((res) => {
        if (res.code === 0) {
          this.fetchCameraSelectHistoryList();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     *  初始化，调取接口
     */
    init() {
      if (!this.isOut) {
        this.getCamerasTree();
      }
      this.getFilterCameraOptions();
    },
    /**
     * 获取相机树数据
     * @param {Object} params 可选参数，用于筛选相机
     * @param {string} target 区分外面的相机树和地图相机树数据
     */
    getCamerasTree(params = {}, target = 'camerasData') {
      const realParams = { ...this.defaultParams, ...params };
      const getCameraData = this.cameraDataFunc();
      this.loading = true;
      getCameraData(realParams).then((res) => {
        this.loading = false;
        if (res.code === 0) {
          // 后期测试相机路数，不要删除
          // for (let i = 0; i < 50000; i += 1) {
          //   res.data.push({
          //     close: false,
          //     flag: 'camera',
          //     id: i,
          //     items: [],
          //     lat: 40.04 - Math.abs(Math.random() - 0.5), // 39.74
          //     lon: 116.12 + Math.abs(Math.random() - 0.5), //  116.53
          //     name: `${i}openapi-camera-add-${i}`,
          //     operable: true,
          //     placeName: `openapi-camera-add-${i}`,
          //     departmentId: '6e9232ef-7b84-11e8-86b1-6c92bf4e6960',
          //     status: '0',
          //     type: '2'
          //   });
          // }
          console.log('tree render start:', Date.now());
          this[target] = res.data;
          this.resolveCameraData(res.data); // 处理相机数据
          this.setTreeData();
          if (this.isShowHistory) {
            this.fetchCameraSelectHistoryList(); // 获取相机筛选历史记录
          }
          this.$emit('filter', res.data);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     *  获取相机筛选数据
     * @TODO 有没有接口提供一套接口
    */
    getFilterCameraOptions() {
      const labels = CameraSelectSrv.getLabels();
      const places = CameraSelectSrv.getPlaces();
      const keyUnits = CameraSelectSrv.getKeyUnits();
      const types = this.$store.getters.dataMapByType('bayonet_type');
      const cameraTypes = this.$store.getters.dataMapByType('kunlun_camera_type');
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
        this.filterCondition = filterCondition.concat([{ label: 'types', value: types }, { label: 'cameraTypes', value: cameraTypes }]);
      });
    },
    /**
     * @description 过滤相机树
     * @param {Object} params 相机树筛选参数
     */
    filterCameras(params, target = 'camerasData') {
      const adaptParams = {
        placeIds: params.places,
        unitIds: params.keyUnits,
        labels: params.labels,
        monitoringTypes: params.types,
        types: params.cameraType,
      };
      if (target === 'camerasData') {
        this.lastChecked = this.selectedCameraIds.concat(this.lastChecked);
      }
      this.getCamerasTree(adaptParams, target);
    },
    /**
     * 是否全选
     */
    isSelectedAll() {
      // 是否全选如果有部门的话，不正确
      const selectCheckKeysLength = this.$refs.tree.getCheckedKeys().length;
      return this.allCameraNodes.length === selectCheckKeysLength;
    },
    /**
     *  树初始完毕，开始默认选项
     *  @TODO promise后treeUpdateReady()不触发
     */
    treeUpdateReady() {
      console.log('tree render end:', Date.now());
      if (this.selectedIdsLength > 0) {
        this.$refs.tree.setCheckedKeys(this.selectedCameraIds);
      } else if (!this.defaultInitState && this.defaultIds.length > 0) {
        this.$refs.tree.setCheckedKeys(this.defaultIds);
        this.defaultInitState = true;
        this.selectedCameraIds = this.$refs.tree.getCheckedKeys();
        this.$emit('change', this.selectedCameraIds);
      } else if (!this.defaultInitState && this.defaultSelectAll) {
        this.$refs.tree.setCheckedKeys('ALL');
        this.defaultInitState = true;
        this.selectedCameraIds = this.$refs.tree.getCheckedKeys();
        this.$emit('change', this.selectedCameraIds);
      }
      this.delay.r();
      this.$emit('update-ready');
    },
    /**
     *  清空已选择相机
     */
    reset() {
      if (this.disabled) { return; }
      this.selectedCameraIds = [];
      this.selectedCameraNodes = [];
      this.lastChecked = [];
      this.$refs.tree.setCheckedKeys([]);
      this.$emit('change', []);
    },
    /**
     * @description 相机树数据预处理
     * @param {Object} item 相机树节点数据
     */
    cameraPretreatment(item) {
      if (item.flag !== 'camera') {
        item.noStatistics = true;
      }
    },
    /**
     * 点击最外层，显示 浮层
     */
    wrapClick() {
      if (this.disabled) { return; }
      const flag = this.showPopover;
      this.wrapTimer = setTimeout(() => {
        if (!flag) {
          this.showPopover = true;
          this.$nextTick(() => {
            this.$refs.tree.resize();
          });
        }
      }, 20);
    },
    /**
     * @description 设置选中的相机
     * @param {Array.<string|number>} ids 需要选中的id数组 传null 或 [] 则是取消选中
     */
    setCheckedKeys(ids) {
      this.$refs.tree.setCheckedKeys(ids);
      this.selectedCameraIds = this.$refs.tree.getCheckedKeys();
      this.$emit('change', this.selectedCameraIds);
    },
    /**
     * @description 响应树选中变更
     * @param {Array} 已选中的数据
     */
    onTreeCheckedChanged(ids) {
      let realIds = this.lastChecked.length ? ids.concat(this.lastChecked) : ids;
      realIds = Array.from(new Set(realIds));
      this.selectedCameraIds = realIds;
      this.selectedCameraNodes = this.getCheckedNodes();
      this.$emit('change', realIds);
    },
    /**
     * @description 响应地图选中变更
     * @param {Array} 已选中的数据
     */
    onMapCheckedChanged(ids) {
      this.setCheckedKeys(ids);
      this.$emit('change', ids);
    },
    /**
     * 切换地图模式
     */
    toggleMapMode() {
      if (this.disabled) { return; }
      this.mapVisible = true;
      this.mapLoading = true;
      console.log('map render start', Date.now());
      // 弹窗有300毫秒的延时
      this.toggleMapTimer = setTimeout(() => {
        // 打开地图
        this.delay.p.then(() => {
          this.$refs.mapSelect.openMap();
          this.$refs.mapSelect.setMapFeatureData(this.featureArray);
          // 设置默认选中
          this.$refs.mapSelect.setActiveFeature(this.selectedCameraIds);
          this.mapLoading = false;
          console.log('map render end', Date.now());
        });
      }, 350);
    },
    /**
     * 外部调用方法，获得当前选中数据
     */
    getCheckedKeys() {
      return this.selectedCameraIds;
    },
    /**
     * 外部调用方法，获得当前选中节点
     */
    getCheckedNodes(...args) {
      return this.$refs.tree.getCheckedNodes(...args);
    },
    /**
     * 外部调用方法，获得当前相机树所有相机节点
     */
    getCameraNodes() {
      return this.allCameraNodes;
    },
    /**
     * 屏蔽图标的冒泡事件，否则会有干扰
     */
    handlerClick(event) {
      if (this.disabled) {
        event.stopPropagation();
      }
    },
    handlerHistoryEnter() {
      if (!this.isShowHistory) return;
      if (this.historyTimer) clearInterval(this.historyTimer);
      this.historyTimer = setTimeout(() => {
        this.isHistory = true;
      }, 100);
    },
    handlerHistoryLeave() {
      if (!this.isShowHistory) return;
      if (this.historyTimer) clearInterval(this.historyTimer);
      this.isHistory = false;
    },
    /**
     * 鼠标移入事件
     */
    mouseEnter() {
      if (this.disabled) { return; }
      this.isHover = true;
    },
    /**
     * 鼠标移出事件
     */
    mouseLeave() {
      if (this.disabled) { return; }
      this.isHover = false;
    },
    /**
     * 处理相机的实时分析机历史分析状态
     */
    dealWithCameraStatus(target, obj) {
      const keys = Object.keys(obj);
      let isTag = false;
      if (keys.length) {
        isTag = keys.some((key) => obj[key] === true);
      }
      target.realTimeTask = {
        doBody: obj.doBody,
        doFace: obj.doFace,
        doMotor: obj.doMotor,
        doNoMotor: obj.doNonMotor
      };
      target.isRealTimeTask = isTag;
      target.historyTask = {
        historyDoBody: obj.historyDoBody,
        historyDoFace: obj.historyDoFace,
        historyDoMotor: obj.historyDoMotor,
        historyDoNonMotor: obj.historyDoNonMotor
      };
    },
    /**
     * @description 点击地图相机图标，获取相机详情
     * @param {string} 相机id
     */
    getCameraInfo(id) {
      const p1 = CameraSelectSrv.getCameraInfo({ id, needPlace: true, needUnit: true });
      const p2 = CameraSelectSrv.getCaptureCount({
        cameraIds: [id], sourceType: 'CAMERA', startTime: defaultStartTime, endTime: defaultEndTime
      });
      const p3 = CameraSelectSrv.getCameraDetail({ id });
      Promise.all([p1, p2, p3]).then((res) => {
        const temp = res[0].data ? res[0].data : {};
        temp.captureCount = res[1].data ? res[1].data.count : 0;
        if (res[2].data) {
          this.dealWithCameraStatus(temp, res[2].data);
        }
        this.cameraInfo = temp;
      });
      this.getVideoInfo(id);
    },
    /**
     * @description 点击地图相机图标，获取相机详情
     * @param {string} 相机id
     */
    async getVideoInfo(id) {
      const res = await CameraSelectSrv.getCameraVideo({
        deviceId: id,
        protocol: 'iot'
      });
      if (res.code !== 0) {
        this.$message.error(res.msg);
        return;
      }
      const { url } = res.data;
      const urlRes = await CameraSelectSrv.getIotUrl({
        type: 'iot',
        url,
      });
      if (urlRes.code !== 0) {
        this.$message.error(urlRes.msg);
        return;
      }
      this.videoInfo = {
        type: 'iot',
        url: urlRes.data.streamAddr
      };
    },
    /**
     * @description 过滤相机节点，用于地图传入
     * @param {Array} array 相机树数据
     * @returns array 处理完的数据数组
     */
    filterCameraNodes(array) {
      // 利用循环替代递归
      const stack = [...array];
      const target = [];
      while (stack.length) {
        const curr = stack.pop();
        if (curr.flag === 'camera') {
          target.push(curr);
        }
        if (curr.items && curr.items.length) {
          stack.push(...curr.items);
        }
      }
      return target;
    },
    /**
     * 处理相机数据
    */
    resolveCameraData(array) {
      this.allCameraNodes = this.filterCameraNodes(array);
      this.featureArray = this.filterLatAndLon(this.allCameraNodes);
      this.$emit('cameras-updated', this.allCameraNodes);
      const lastCheckedArr = this.lastChecked.slice(0);
      const allCameraNodesArr = this.allCameraNodes.slice(0);
      if (lastCheckedArr.length) {
        const lastChecked = [];
        const isDef = (val) => !!(val || val === 0);
        // 空间换时间，由于要找allCameraNodesArr中不存在的项，allCameraNodesArr.some复杂度为O(n)
        // 转换为map结构后，查询复杂度由O(n)变为O(1)
        const allCameraNodeMap = allCameraNodesArr.reduce((mp, el) => {
          const id = el && el.id;
          if (isDef(id)) {
            mp.set(id, el);
          }
          return mp;
        }, new Map());
        // 整体复杂度从O(n^2) => O(n)
        lastCheckedArr.forEach((id) => {
          // if (!allCameraNodesArr.some((el) => el.id === id)) {
          //   lastChecked.push(id);
          // }
          if (!allCameraNodeMap.has(id)) {
            lastChecked.push(id);
          }
        });
        this.lastChecked = lastChecked;
      }
    },
    /**
     *  经纬度校验
     */
    filterLatAndLon(arr) {
      const target = [];
      const len = arr.length;
      for (let i = 0; i < len; i += 1) {
        const temp = arr[i];
        if ((typeof temp.lon === 'number') && (typeof temp.lat === 'number') && temp.lon <= 180 && temp.lon >= -180 && temp.lat < 90 && temp.lat >= -90) {
          target.push(temp);
        }
      }
      return target;
    },
    setTreeData() {
      setTimeout(() => {
        if (this.$refs.tree) {
          this.$refs.tree.setTreeData(this.camerasData);
        }
      }, 20);
    },
  }
};
</script>
<style lang="scss">
.camera-select-popover{
  padding: 0 0 15px;
  min-width: 300px;
  height: 528px;
  box-sizing: border-box;
}
</style>
<style lang="scss" scoped>
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-content:center;
  border: 1px solid #d2d6de;
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  position: relative;
  z-index: 1;
  .searchbar-content {
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    position: absolute;
    left: -1px;
    top: 35px;
    right: -1px;
    background-color: #fff;
    padding-top: 2px;
    .searchbar-list {
      box-sizing: border-box;
      .searchbar-list-item {
        width: 100%;
        height: 34px;
        padding: 0 20px 0 12px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;
        align-content: center;
        position: relative;
        cursor: pointer;
        &:hover {
          background-color: #e6f2ff;
          color: #435068;
        }
        .close {
          width: 12px;
          height: 12px;
          position: absolute;
          top: 50%;
          right: 8px;
          transform: translateY(-50%);
          color: #435068;
          opacity: .3;
          display: flex;
          justify-content: center;
          align-items: center;
          align-content: center;
          cursor: pointer;
          &:hover {
            opacity: 1;
          }
        }
        .camera-info {
          width: 100%;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          align-content: center;
          color: #435068;
          .camera-name {
            overflow: hidden;
            font-size: 12px;
          }
          .camera-number {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            align-content: center;
            font-size: 12px;
            overflow: hidden;
            margin-right: 8px;
          }
        }
      }
    }
  }
  &:hover{
      border-color: #21539b;
  }
  .camera-map {
    border: none;
    border-right: 1px solid #d2d6de;
    border-radius: 0;
    padding: 0 8px 0 8px;
    height: 34px;
    &:hover {
      background: #e9eef5;
      color: #21539b;
    }
    &:active {
      background: #e9eef5;
      color: #21539b;
    }
  }
}
.meg-camera-select{
  flex: 1;
  height: 34px;
  box-sizing: border-box;
  position: relative;
  font-size: 14px;
  cursor: pointer;
  &.is-disabled{
    background-color: #f4f5f6;
    cursor: not-allowed;
    .camera-select__placeholder {
      color: #bdc2ca;
    }
    .hamburger-icon{
      color: #bdc2ca;
    }
    .map-icon{
      width: 16px;
      height: 16px;
      color: #bdc2ca;
    }
    .map-icon-box{
      cursor: not-allowed;
      &:hover{
        background-color: transparent;
      }
    }
    &:hover{
      border-color: #d2d6de;
      .reset-box{
        display: none;
      }
    }
  }
  &:hover{
    border-color: #21539b;
    .reset-box{
      display: block;
    }
  }
  .camera-select__placeholder {
    height: 34px;
    padding-left: 10px;
    padding-right: 30px;
    line-height: 34px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #435068;
    display: block;
  }
  .camera-select-reference{
    position: absolute;
    right: 12px;
    top: -1px;
    display: inline-block;
    pointer-events: none;
  }
  .map-icon{
    width: 16px;
    height: 16px;
    color: #21539B;
  }
  .hamburger-icon{
    width: 10px;
    height: 10px;
    color: #21539B;
  }
}
.reset-box{
  display: none;
  position: absolute;
  top: -1px;
  right: 28px;
  z-index: 10;
  .clear-icon{
    cursor: pointer;
    width: 12px;
    height: 12px;
    color:#4350684d;
  }
}

.map-icon-box{
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  width: 34px;
  cursor: pointer;
  border-radius: 2px;
  &.map-position-top {
    height: 24px;
    top: -30px;
    right: 0px;
  }
  &.map-position-right {
    height: 34px;
    top: 50%;
    right: -40px;
    transform: translateY(-50%);
  }
  &:hover{
    background: #F2F4F8;
  }
}
</style>
