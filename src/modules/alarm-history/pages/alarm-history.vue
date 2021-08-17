<template>
  <page-layout>
    <meg-container class="alarm-history">
      <meg-aside width="320px">
        <search-form
          ref="searchForm"
          :task-list="taskList"
          :task-list-getter="taskListGetter"
          :file-list-getter="fileListGetter"
          :album-tree-data="allAlbumList"
          :file-history-album-tree-data="fileHistoryAlbumTreeData"
          :deploy-type-list="deployTypeList"
          :default-data="defaultData"
          @tab-change="onSearchTabChange"
          @search="onSearch"
          @reset="reset"></search-form>
      </meg-aside>
      <meg-main class="main-container">
        <div class="content">
          <!-- 详情顶部导航 -->
          <div class="main-nav">
            <div class="main-nav-left">
              <span
                v-if="isSelectMode"
                class="font12">{{ $t('已选择') }}<label class="font14"> {{ selectedCard.length }} </label>{{ $t('条结果') }}</span>
              <span
                v-else
                class="font12">{{ $t('检索结果：共') }}<label class="font14"> {{ totalNum }} </label>{{ $t('条') }}</span>
            </div>
            <!-- 中部查询维度选择 -->
            <div
              v-if="!isNoData && !isSelectMode"
              class="main-nav-middle">
              <meg-radio-group
                class="sort-box"
                v-model="currentSearchType">
                <meg-radio-button label="1">
                  {{ currentSearchType === '1'? this.$t('按{entity}排序', { entity: $t('时间') }) : $t('时间') }}
                </meg-radio-button>
                <meg-radio-button
                  v-if="searchFormType !== 3"
                  label="2">
                  {{ currentSearchType === '2'? this.$t('按{entity}排序', { entity: $t('地点') }) : $t('地点') }}
                </meg-radio-button>
                <meg-radio-button
                  v-if="!noDatabaseTab"
                  label="4">
                  {{ currentSearchType === '4'? this.$t('按{entity}排序', { entity: $t('底库') }) : $t('底库') }}
                </meg-radio-button>
                <template v-if="searchFormType === 1">
                  <meg-radio-button label="5">
                    {{ currentSearchType === '5'? this.$t('按{entity}排序', { entity: $t('卡口类型') }) : $t('卡口类型') }}
                  </meg-radio-button>
                  <meg-radio-button label="6">
                    {{ currentSearchType === '6'? this.$t('按{entity}排序', { entity: $t('布控类型') }) : $t('布控类型') }}
                  </meg-radio-button>
                  <meg-radio-button label="7">
                    {{ currentSearchType === '7'? this.$t('按{entity}排序', { entity: $t('布控任务') }) : $t('布控任务') }}
                  </meg-radio-button>
                </template>
                <meg-radio-button
                  v-if="searchFormType === 3"
                  label="8">
                  {{ currentSearchType === '8'? this.$t('按{entity}排序', { entity: $t('解析任务') }) : $t('解析任务') }}
                </meg-radio-button>
              </meg-radio-group>
            </div>
            <div
              class="main-nav-right"
              v-if="enableExport">
              <export-setting-button
                :disabled="isNoData"
                v-if="isSuperAdmin"
                class="margin-right-10"
                :button-text="$t('批量导出')"
                @click-export="onClickBatchExport"
                @click-setting="onClickBatchExportSetting"></export-setting-button>
              <export-setting-button
                :disabled="isNoData"
                @click-export="onClickExport"
                @click-setting="onClickExportSetting"></export-setting-button>
              <meg-button
                :disabled="isNoData"
                v-if="isSelectMode"
                class="right-button-margin"
                @click="exitSelectMode">
                {{ $t('退出选择') }}
              </meg-button>
            </div>
            <div
              v-else
              class="main-nav-right"></div>
          </div>
          <!-- 手风琴展示列表 -->
          <div
            class="main-content"
            v-loading="loading">
            <div
              class="loading-box"
              v-background="!isNoData? false : {
                icon: 'icon_4',
                text: this.$t('检索无数据')
              }">
              <common-collapse
                ref="collapse"
                :categories="categoryList"
                v-model="nowCollapseIndex"
                :default-active-name="defaultIndex"
                :show-checkbox-animation="false"
                :card-min-width="300"
                :list="alarmCardInfoList"
                :total-records="categoryNum"
                :loading="collapseLoading"
                @change="categoryChange"
                @load-list="fetchData"
                @check-list-change="onCheckChange">
                <template v-slot="{item,index}">
                  <alarm-card
                    @click="cardClick(item,index)"
                    :key="item.id"
                    :card-info="item"></alarm-card>
                </template>
              </common-collapse>
            </div>
          </div>
        </div>
      </meg-main>
    </meg-container>
    <alarm-detail
      @close="isShowAlarmDetail = false"
      :total="alarmCardInfoList.length"
      :alarm-id="currentAlarmId"
      :index="currentIndex"
      @update="onDetailUpdate"
      @temp-change="onTempChange"
      @change="onChange"
      v-if="isShowAlarmDetail"></alarm-detail>
  </page-layout>
</template>

<script>
import exportMessageBox from '@/common-components/common-export-message-box';
import moment from 'moment';
import { ExportSettingButton, ExportSettingManager } from '@/common-components/common-export-setting';
import doAddCameraSelectHistory from '@/utils/camera.utils.js';
import AlarmCard from '../../../common-components/common-alarm-card';
import CommonCollapse from '../../../common-components/common-collapse';
import AlarmDetail from '../../../common-components/common-alarm-detail';

import SearchForm from '../components/search-form';
import AlarmHistorySvr from '../alarm-history.service';
// 聚类类型（date：日期 position：地点 similarity：相似度  album：底库
//  scenesType：卡口类型   deployType：布控类型 deployTask：布控任务
//  analysisTask：解析任务 file：文件）

export default {
  components: {
    AlarmCard,
    SearchForm,
    CommonCollapse,
    ExportSettingButton,
    AlarmDetail
  },
  data() {
    return {
      background: {
        icon: 'icon_4',
        text: this.$t('检索无数据')
      },
      currentSearchTypeMap: {
        '1': {
          code: 'date',
        },
        '2': {
          code: 'position',
          title: this.$t('按{entity}导出', { 'entity': '地点' })
        },
        // '3': {
        //   code: 'similarity',
        // },
        '4': {
          code: 'album',
          title: this.$t('按{entity}导出', { 'entity': '底库' })
        },
        '5': {
          code: 'scenesType',
          title: this.$t('按{entity}导出', { 'entity': '卡口类型' })
        },
        '6': {
          code: 'deployType',
          title: this.$t('按{entity}导出', { 'entity': '布控类型' })
        },
        '7': {
          code: 'deployTask',
          title: this.$t('按{entity}导出', { 'entity': '布控任务' })
        },
        '8': {
          code: 'file',
          title: this.$t('按{entity}导出', { 'entity': '文件' })
        },
      },
      defaultData: {},
      nowCollapseIndex: 99,
      defaultIndex: 99,
      deployTypeList: [], // 布控类型列表
      taskList: [], // 布控任务列表
      allAlbumList: [], // 全部底库列表
      fileHistoryAlbumTreeData: [], // 录像和文件用的底库列表
      isShowAlarmDetail: false,
      searchInfo: {

      },
      loading: false, // 获取聚类的loading
      collapseLoading: false, // 手风琴内部的loading
      taskListGetter: AlarmHistorySvr.fileTask,
      fileListGetter: AlarmHistorySvr.fileListGetter,
      isSelectMode: false,
      totalNum: 0,
      enableExport: false, // 是否可以导出
      currentSearchType: '1', // 当前选择的维度类型

      isNoData: false,
      searchFormType: 1, // 左侧检索条件的类型 1,相机 2,录像 3,文件

      exportData: {
        selectIds: [], // 选中的详情条目集合
        beginTime: '',
        endTime: '',
        minSimilarity: 50 // 最小相似度
      },
      currentAlarmId: '', // 当前报警详情的id
      currentIndex: 0, // 当前报警详情的index
      // ----手风琴控制部分----
      pageInfo: {
        pageSize: 60,
        pageNo: 1
      },
      alarmCardInfoList: [], // 聚类内部，手风琴子项，每一个的列表
      categoryList: [], // 聚类的列表
      selectedCard: [], // 选择模式选中的卡片
      batchManager: null,
      manager: null,
      noDatabaseTab: false, // 是否显示底库tab
      categoryNum: 0, // 每个手风琴下总数
      categoryPromise: null, // 聚类请求promise
    };
  },
  computed: {
    // 报警卡片显示删除按钮
    isSuperAdmin() {
      if (this.$store.getters.user.userName === 'superAdmin' && this.$store.getters.systemByType('enablePKSetting').value === 'true') {
        return true;
      }
      return false;
    }
  },
  watch: {
    currentSearchType() {
      this.resetResult();
      this.getClusterList();
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.isShowAlarmDetail = false;
    if (to.query.type) {
      this.resetResult();
      const query = JSON.parse(JSON.stringify(to.query));
      this.$refs.searchForm.setActiveDrop(query);
      this.$nextTick(() => {
        this.$refs.searchForm.setDefaultCondition(query);
        this.$refs.searchForm.search();
      });
      if (to.query.timeArr) {
        this.initDate = JSON.parse(to.query.timeArr);
      }
      if (to.query.strategyTypeId) {
        this.exportDate = ['', ''];
      }
    }
    next();
  },
  created() {
    this.init();
  },
  mounted() {
  },
  methods: {
    init() {
      if (this.$route.query.type) {
        const query = JSON.parse(JSON.stringify(this.$route.query));
        this.$nextTick(() => {
          this.$refs.searchForm.setActiveDrop(query);
          this.$refs.searchForm.setDefaultCondition(query);
        });
      } else {
        this.$nextTick(() => {
          this.$refs.searchForm.setActiveDrop({ type: 'camera' });
        });
      }
      this.getDeployTypeOptions();
      this.initExport();
      this.getAllTask();
      this.getCameraAlbum();
      this.getFileHistoryAlbumTreeData();
      if (this.$route.query.strategyTypeId) {
        this.exportDate = ['', ''];
      }
      if (this.$route.query.timeArr) {
        const [start, end] = JSON.parse(this.$route.query.timeArr);
        this.exportDate = [new Date(start), new Date(end)];
      }
      this.enableExport = this.$store.getters.modulePermissonsByAlias('alarm-history', 'alarmHistoryExport');
      this.manager = new ExportSettingManager(this.$store, 'alarm-history', 'alarm_export_column');
      this.batchManager = new ExportSettingManager(this.$store, 'alarm-history-batch', 'alarm_export_column');
    },
    /**
     * @description 加入/移除暂存架
     * @param {string} type 类型 del add
     * @param {object} data 数据
     * @param {number} index 下标
     */
    onStoreChange(type, data, index) {
      if (type === 'add') {
        this.addTemporaries(data, index);
      } else {
        this.deleteTemporaries(data, index);
      }
    },
    /**
     * @description 添加到暂存架
     * @param {object} data 数据
     * @param {number} index 下标
     * @returns
     */
    addTemporaries(data, index) {
      const params = {
        temId: data.id,
        temType: 2,
        temOrigin: 3,
      };
      AlarmHistorySvr.addTemporaries(params).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('加入暂存架成功'));
          this.$set(this.alarmCardInfoList[index], 'temporaryFlag', 1);
        }
      });
    },
    /**
     * @description 移出暂存架
     * @param {object} data 数据
     * @param {number} index 下标
     * @returns
     */
    deleteTemporaries(data, index) {
      const params = {
        temIds: [data.id],
        temType: 2,
      };
      AlarmHistorySvr.deleteTemporaries(params).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('移出暂存架成功'));
          this.$set(this.alarmCardInfoList[index], 'temporaryFlag', 0);
        }
      });
    },
    /**
     * @description
     * @param {any}
     * @returns
     */
    /**
     * @description 左侧检索tab发生变化时
     * @param {number} type 类型 1,相机 2,录像 3,文件
     * @returns
     */
    onSearchTabChange(type) {
      this.searchFormType = type;
      this.currentSearchType = '1';
      this.isNoData = true;
      this.resetResult();
    },
    /**
     * @description 重置检索结果
     */
    resetResult() {
      this.$nextTick(() => {
        this.$refs.collapse.cancelSelect();
      });
      this.pageInfo = {
        pageSize: 60,
        pageNo: 1
      };
      this.categoryList = [];
      this.alarmCardInfoList = [];
      this.totalNum = 0;
      this.isSelectMode = false;
      this.selectedCard = [];
      this.nowCollapseIndex = this.defaultIndex;
    },
    /**
     * @description 搜索
     * @param {object} params 左侧检索条件，不包括分页
     */
    onSearch(params) {
      this.searchInfo = params;
      this.exportDate = [params.startTime, params.endTime];
      this.alarmCardInfoList = [];
      this.nowCollapseIndex = 999;
      this.currentSearchType = '1';
      this.noDatabaseTab = !!params.noDatabaseTab;
      this.getClusterList();
      // 检索记录选择相机的历史记录
      const { cameraIds } = this.searchInfo;
      if (cameraIds && cameraIds.length > 0) {
        doAddCameraSelectHistory(cameraIds);
      }
    },
    /**
     * @description 左侧重置检索条件时，右侧导出时间也重置（历史遗留）
     */
    reset() {
      this.exportDate = JSON.parse(JSON.stringify(this.initDate));
    },
    /**
     * @description 聚合类发生变化时
     * @param {number} index
     */
    categoryChange(index) {
      if (index !== '') {
        this.pageInfo = {
          pageSize: 60,
          pageNo: 1
        };
        this.categoryNum = this.categoryList[index].count;
        this.getAlarmList({
          ...this.searchInfo,
          ...this.categoryList[index].condition,
          ...this.pageInfo,
          clusterType: this.currentSearchTypeMap[this.currentSearchType].code
        }, { reset: true, loading: true });
      }
    },
    /**
     * @description 获取列表详细的数据
     * @param {object} params 请求参数
     * @param {object} options 请求参数
     * @returns
     */
    getAlarmList(params = {}, options = {}) {
      if (options.reset) {
        this.alarmCardInfoList = [];
      }
      this.loading = options.loading;
      this.collapseLoading = true;

      AlarmHistorySvr.getAlarmList(params).then((res) => {
        if (res.code === 0) {
          if (options.reset) {
            this.alarmCardInfoList = res.data.records;
          } else {
            this.alarmCardInfoList = [...this.alarmCardInfoList, ...res.data.records];
          }
          this.loading = false;
          this.collapseLoading = false;
        }
      });
    },
    /**
     * @description 手风琴加载更多
     * @param {any}
     * @returns
     */
    fetchData(pageNo, pageSize) {
      this.pageInfo = {
        pageNo, pageSize
      };
      this.getAlarmList({
        ...this.searchInfo,
        ...this.pageInfo,
        ...this.categoryList[this.nowCollapseIndex].condition,
        clusterType: this.currentSearchTypeMap[this.currentSearchType].code,
      }, { loading: false });
    },
    /**
     * @description 手风琴选择发生变化时
     * @param {array} checkList 选中的ids
     * @returns
     */
    onCheckChange(checkList) {
      this.selectedCard = checkList;
      if (checkList.length) {
        this.isSelectMode = true;
      } else {
        this.isSelectMode = false;
      }
    },
    /**
     * @description 获取布控任务类型列表
     */
    getDeployTypeOptions() {
      AlarmHistorySvr.getDeployTypeList().then((res) => {
        if (res.code === 0) {
          this.deployTypeList = res.data;
        }
      });
    },
    /**
     * @description 报警详情点击上一个或者下一个时相关处理
     * @param {number} index 下标
     */
    onChange(index) {
      this.currentAlarmId = this.alarmCardInfoList[index].id;
      this.currentIndex = index;
    },
    /**
     * @description 初始化导出
     */
    initExport() {
      const startTime = new Date(new Date(moment().subtract(6, 'days')).setHours(0, 0, 0, 0)).getTime();
      const endTime = new Date(new Date().setHours(23, 59, 59, 999)).getTime();
      this.initDate = [startTime, endTime];
      this.exportDate = [startTime, endTime];
    },

    /**
     * @description 更改暂存状态
     * @param {number} index 下标
     * @param {number} status 状态
     */
    onTempChange(index, status) {
      this.$set(this.alarmCardInfoList[index], 'temporaryFlag', status);
    },
    /**
     * @description 更改处理状态
     * @param {object:{ id:string , index: number }}
     */
    onDetailUpdate(obj, status) {
      this.$set(this.alarmCardInfoList[obj.index], 'processStatus', status);
    },
    /**
     * @description 获取聚类列表（手风琴）
     * @param {any}
     * @returns
     */
    getClusterList() {
      this.loading = true;
      this.totalNum = 0;
      if (this.categoryPromise) {
        this.categoryPromise.cancel();
        this.categoryPromise = null;
      }
      const params = {
        ...this.searchInfo,
        clusterType: this.currentSearchTypeMap[this.currentSearchType].code,
      };
      this.categoryPromise = AlarmHistorySvr.getClusterList(params);
      this.categoryPromise.then((res) => {
        if (res.code === 0) {
          const category = res.data.records;
          this.$nextTick(() => {
            this.isNoData = false;
            if (category.length === 0) this.isNoData = true;
          });
          let allSum = 0;
          this.others = category.map((val) => {
            allSum += val.count;
            return {
              label: val.displayName,
              value: val.condition,
            };
          });
          this.totalNum = allSum;
          this.categoryList = category;
        }
        this.loading = false;
        this.categoryPromise = null;
      }).catch((error) => {
        console.log(error);
      });
    },
    /**
     * 打开导出设置
     */
    async onClickExportSetting() {
      await this.manager.setExportSetting();
    },
    /**
     * 打开批量导出设置
     */
    async onClickBatchExportSetting() {
      await this.batchManager.setExportSetting();
    },
    /**
     * @description 退出选择模式
     */
    exitSelectMode() {
      this.isSelectMode = false;
      this.$refs.collapse.cancelSelect();
      this.selectedCard = [];
    },
    /**
     * @description 卡片点击时触发
     * @param {object} item  卡片数据
     * @param {number} index 卡片下标
     */
    cardClick(item, index) {
      this.currentAlarmId = item.id;
      this.currentIndex = index;
      this.isShowAlarmDetail = true;
    },
    /**
     * @description 导出数据，选中卡片单独导出时使用
     * @param {object} params
     */
    alarmExportByAlarmId(params) {
      AlarmHistorySvr.exportHistory(params).then((res) => {
        if (res.code === 0) {
          window.location.href = res.data;
        }
      });
    },
    /**
     * @description
     * @param {any}
     * @returns
     */
    onClickExport() {
      if (this.isSelectMode) {
        // 当处于选择模式下且选中项目条数大于0的时候导出,否则提示
        if (this.selectedCard.length > 0) {
          const param = {};
          param.ids = this.selectedCard;
          param.source = 'LOCAL';
          param.columns = this.manager.getExportSetting();
          this.alarmExportByAlarmId(param);
        } else {
          this.$message(this.$t('请选择报警'));
        }
      } else {
      // 维度字段： 1时间 2相似度 3地点 4底库
        const [startTime, endTime] = this.exportDate;
        switch (this.currentSearchType) {
          case '1':
            exportMessageBox.showExportMessageBox({
              type: 'time',
              title: this.$t('按时间导出'),
              tips: `（最多支持导出${this.$store.getters.systemByType('kunlun_export_warn_range_threshold').value}条）`,
              selects: [startTime, endTime]
            }).then(
              (select) => {
                // 根据选择条件进行导出操作
                const [start, end] = select;
                const params = {
                  ...this.searchInfo,
                  startTime: start,
                  endTime: end,
                  clusterType: this.currentSearchTypeMap[this.currentSearchType].code,
                };
                this.exportAlarmData(params);
              },
              () => {
                // 取消导出
              }
            );
            break;
          case '3':
            exportMessageBox.showExportMessageBox({
              type: 'threshold',
              title: this.$t('按相似度导出'),
              tips: `（最多支持导出${this.$store.getters.systemByType('kunlun_export_warn_range_threshold').value}条）`,
              selects: 60
            }).then(
              (select) => {
                // 根据选择条件进行导出操作
                const params = {
                  ...this.searchInfo,
                  minSimilarity: select,
                  maxSimilarity: 100,
                  clusterType: this.currentSearchTypeMap[this.currentSearchType].code,
                };
                this.exportAlarmData(params);
              },
              () => {
                // 取消导出
              }
            );
            break;
          default:
            exportMessageBox.showExportMessageBox({
              type: 'list',
              title: this.currentSearchTypeMap[this.currentSearchType].title,
              tips: `（最多支持导出${this.$store.getters.systemByType('kunlun_export_warn_range_threshold').value}条）`,
              selects: this.others
            }).then(
              (select) => {
                // 根据选择条件进行导出操作
                const map = {};
                select.forEach((val) => {
                  Object.keys(val).forEach((item) => {
                    if (Array.isArray(val[item])) {
                      if (map[item]) {
                        map[item] = [...map[item], ...val[item]];
                      } else {
                        map[item] = val[item];
                      }
                    }
                  });
                });
                const params = {
                  ...this.searchInfo,
                  ...map,
                  clusterType: this.currentSearchTypeMap[this.currentSearchType].code,
                };
                this.exportAlarmData(params);
              },
              () => {
                // 取消导出
              }
            );
        }
      }
    },
    /**
     * @description 导出数据
     * @param {object} params 参数
     * @returns
     */
    exportAlarmData(params) {
      AlarmHistorySvr.exportHistory({ ...params, columns: this.manager.getExportSetting() }).then((res) => {
        if (res.code === 0) {
          this.$message({
            message: this.$t('导出成功，请前往任务列表下载'),
            type: 'success'
          });
        }
      });
    },
    /**
     * @description 获取所有得布控任务
     */
    getAllTask() {
      AlarmHistorySvr.getTaskList().then((res) => {
        if (res.code === 0) {
          this.taskList = res.data;
          if (this.$route.query.type) {
            this.$refs.searchForm.search();
          } else {
            this.$nextTick(() => {
              if (this.$refs.searchForm) {
                this.$refs.searchForm.changeDropdown({
                  type: 1,
                  name: this.$t('按相机检索'),
                });
              }
            });
          }
        }
      });
    },
    /**
     * @description 获取底库列表
     * @param {any}
     * @returns
     */
    getCameraAlbum() {
      AlarmHistorySvr.getAlbumList().then((res) => {
        if (res.code === 0) {
          this.allAlbumList = res.data;
        }
      });
    },
    /**
     * @description 处理来自中台的底库列表
     * @param {array} items
     * @returns {array}
     */
    handleAlbumListFromGalaxy(items) {
      const obj = {
        id: 'root',
        name: this.$t('全部'),
        flag: 'category',
        items: [
          {
            id: 'person',
            flag: 'category',
            items: [],
            name: this.$t('人像库')
          },
          {
            id: 'body',
            flag: 'category',
            items: [],
            name: this.$t('人体库')
          },
          {
            id: 'car',
            flag: 'category',
            items: [],
            name: this.$t('车辆库')
          },
          {
            id: 'plate',
            flag: 'category',
            items: [],
            name: this.$t('车牌库')
          },
        ]
      };
      items.forEach((val) => {
        switch (Number(val.deployObject)) {
          case 1:
            obj.items[0].items.push(val);
            break;
          case 2:
            obj.items[1].items.push(val);
            break;
          case 3:
          case 5:
            obj.items[2].items.push(val);
            break;
          case 4:
            obj.items[3].items.push(val);
            break;
          default:
            break;
        }
      });
      obj.items = obj.items.filter((val) => val.items.length);
      return [obj];
    },
    /**
     * @description 获取录像和文件用底库列表
     * @param {any}
     * @returns
     */
    getFileHistoryAlbumTreeData() {
      AlarmHistorySvr.getFileHistoryAlbumTreeData({
        deployAlbumType: [1],
        deployObject: [1, 2, 3, 4, 5],
        srcType: [1],
        type: [2],
      }).then((res) => {
        if (res.code === 0) {
          // this.fileHistoryAlbumTreeData = [{
          //   id: 'root',
          //   items: res.data,
          //   name: this.$t('全部')
          // }];
          this.fileHistoryAlbumTreeData = this.handleAlbumListFromGalaxy(res.data);
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.alarm-history {
  height: 100%;
  width: 100%;
  .main-container {
    background: #dce1e5;
    padding: 0px;
    .content {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      flex-wrap: nowrap;
      .main-nav {
        height: 56px;
        line-height: 56px;
        margin: 0 20px;
        color: #435068;
        text-align: center;
        position: relative;
        display:flex;
        justify-content:space-between;
        .main-nav-left {
          height: 56px;
          line-height: 56px;
          text-align: left;
          span {
            display: inline-block;
          }
        }
        .main-nav-middle {
          height: 56px;
          line-height: 56px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .main-nav-right {
          height: 56px;
          .right-button-margin {
            margin-left: 10px;
          }
        }
      }
      .main-content {
        height: calc(100% - 56px);
        margin: 0px 20px 0 17px;
        .loading-box {
          height: 100%;
          width: 100%;
          overflow: auto;
        }
      }
    }
  }
}
</style>
