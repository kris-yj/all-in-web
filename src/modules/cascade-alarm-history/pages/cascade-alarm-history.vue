<template>
  <page-layout>
    <meg-container class="alarm-history">
      <meg-aside width="320px">
        <search-form
          ref="searchForm"
          :album-tree-data="allAlbumList"
          :default-data="defaultData"
          :cascade-list="cascadeList"
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
                <meg-radio-button label="8">
                  {{ currentSearchType === '9'? this.$t('按{entity}排序', { entity: $t('级联单位') }) : $t('级联单位') }}
                </meg-radio-button>
                <meg-radio-button label="1">
                  {{ currentSearchType === '1'? this.$t('按{entity}排序', { entity: $t('时间') }) : $t('时间') }}
                </meg-radio-button>
                <meg-radio-button label="3">
                  {{ currentSearchType === '3'? this.$t('按{entity}排序', { entity: $t('相似度') }) : $t('相似度') }}
                </meg-radio-button>
                <meg-radio-button label="2">
                  {{ currentSearchType === '2'? this.$t('按{entity}排序', { entity: $t('地点') }) : $t('地点') }}
                </meg-radio-button>
                <meg-radio-button label="4">
                  {{ currentSearchType === '4'? this.$t('按{entity}排序', { entity: $t('底库') }) : $t('底库') }}
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
                :total-records="totalNum"
                :loading="collapseLoading"
                @change="categoryChange"
                @load-list="fetchData"
                @check-list-change="onCheckChange">
                <template v-slot="{item,index}">
                  <alarm-card
                    @click="cardClick(item,index)"
                    :key="item.id"
                    :show-store-icon="false"
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
import AlarmCard from '../../../common-components/common-alarm-card';
import CommonCollapse from '../../../common-components/common-collapse';
import AlarmDetail from '../../../common-components/common-alarm-detail';

import SearchForm from '../components/search-form';
import CascadeAlarmHistorySvr from '../cascade-alarm-history.service';
// 聚类类型（date：日期 position：地点 similarity：相似度  album：底库
//  scenesType：卡口类型   deployType：布控类型 deployTask：布控任务
//  analysisTask：解析任务 file：文件 cascade: 级联）

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
        '3': {
          code: 'similarity',
        },
        '4': {
          code: 'album',
          title: this.$t('按{entity}导出', { 'entity': '底库' })
        },
        '9': {
          code: 'cascade',
          title: this.$t('按{entity}导出', { 'entity': '级联单位' })
        },

      },
      defaultData: {},
      nowCollapseIndex: 99,
      defaultIndex: 99,
      allAlbumList: [], // 全部底库列表
      isShowAlarmDetail: false,
      searchInfo: {

      },
      loading: false, // 获取聚类的loading
      collapseLoading: false, // 手风琴内部的loading
      isSelectMode: false,
      totalNum: 0,
      enableExport: false, // 是否可以导出
      currentSearchType: '9', // 当前选择的维度类型

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
      // 级联单位列表
      cascadeList: [],
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
      this.initExport();
      this.getAlbum();
      this.getCascadeList();
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
     * @description 获取级联单位列表
     */
    getCascadeList() {
      CascadeAlarmHistorySvr.getCascadeList().then((res) => {
        if (res.code === 0) {
          const arr = res.data;
          arr.noStatistics = true;
          this.cascadeList = [arr];
        }
      }).catch((error) => {
        console.log(error);
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
      this.currentSearchType = '9';
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
      this.getClusterList();
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

      CascadeAlarmHistorySvr.getAlarmList(params).then((res) => {
        if (res.code === 0) {
          if (options.reset) {
            this.alarmCardInfoList = res.data.records;
          } else {
            this.alarmCardInfoList = [...this.alarmCardInfoList, ...res.data.records];
          }
          this.loading = false;
          this.collapseLoading = false;
          this.totalNum = res.data.totalRecords;
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

      const params = {
        ...this.searchInfo,
        clusterType: this.currentSearchTypeMap[this.currentSearchType].code,
      };
      CascadeAlarmHistorySvr.getClusterList(params).then((res) => {
        if (res.code === 0) {
          const category = res.data.records;
          this.$nextTick(() => {
            this.isNoData = false;
            if (category.length === 0) this.isNoData = true;
          });
          this.others = category.map((val) => ({
            label: val.displayName,
            value: val.condition,
          }));
          this.categoryList = category;
        }
        this.loading = false;
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
      CascadeAlarmHistorySvr.exportHistory(params).then((res) => {
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
          param.source = 'CASCADE';
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
              tips: '（最多支持导出1000条）',
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
      CascadeAlarmHistorySvr.exportHistory({ ...params, columns: this.manager.getExportSetting() }).then((res) => {
        if (res.code === 0) {
          this.$message({
            message: this.$t('导出成功，请前往任务列表下载'),
            type: 'success'
          });
        }
      });
    },
    /**
     * @description 获取底库列表
     * @param {any}
     * @returns
     */
    getAlbum() {
      CascadeAlarmHistorySvr.getAlbumList({
        deployAlbumType: [2],
        deployObject: [1] // 布控对象：1-人脸库；2-人身库；3-车辆库；4-车牌库
      }).then((res) => {
        if (res.code === 0) {
          // 适配树形结构，增加一个全部根节点
          this.allAlbumList = [{
            flag: 'root',
            name: this.$t('全部'),
            id: 'albumListRoot',
            items: res.data
          }];
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
        display: flex;
        justify-content: space-between;
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
