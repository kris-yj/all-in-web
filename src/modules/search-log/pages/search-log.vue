<template>
  <page-layout>
    <div
      class="searchLog"
      @click="iDepPer">
      <form-interactive-log
        ref="inter"
        @retrieval="retrieval"
        @reset="reset"
        format="yyyy-MM-dd HH:mm">
        <template slot="moduleName">
          <meg-return-button
            :title="$t('检索日志')"
            :button-visible="false"></meg-return-button>
        </template>
        <section
          slot="otherFormElement"
          class="form">
          <!-- <div class="line"></div> -->
          <div class="depWrap">
            <h3>{{ $t('部门列表') }}</h3>
            <div class="treeWrap">
              <meg-tree
                v-if="flagTree"
                :data="depData"
                :props="{children:defaultProps.nodesType,label:defaultProps.name}"
                type-prop-name="type"
                :show-search="false"
                :default-expand-all="false"
                :default-checked-all="true"
                @tree-update-ready="treeUpdateReady"
                deep-child-node-type="user"
                ref="tree"
                :show-checkbox="true"
                @check-change="checkChanged">
              </meg-tree>
            </div>
          </div>
        </section>
      </form-interactive-log>
      <div
        class="searchLogTable"
        v-loading="isloading">
        <div class="tableHead">
          <span style="color:#435068">{{ $t('检索结果: 共') }} <i>{{ total }}</i> {{ $t('条') }}</span>
          <meg-radio-group
            v-model="modeModel"
            @change="tab(modeModel)">
            <meg-radio-button
              v-for="(item, index) in Object.keys(search)"
              :label="item"
              :key="index">
            </meg-radio-button>
          </meg-radio-group>
          <div
            class="reviNumber"
            @click.stop>
            <retrieval-times
              @click="iDep"
              :data="depDate"
              name="deptName"
              :ishow="ishowDep"
              v-event-tracking="'SearchLogDepSearchNum'"></retrieval-times>
            <retrieval-times
              @click="iPer"
              :data="userDate"
              :ishow="ishowPer"
              v-event-tracking="'SearchLogUserSearchNum'"></retrieval-times>
          </div>
        </div>
        <div class="logTable">
          <div class="scrollWraps">
            <!-- <meg-scrollbar
            ref="scrollbar"> -->
            <meg-table
              :stripe="true"
              :data="tableData"
              ref="elTabel"
              height="100%"
              style="width: 100%;"
              :default-sort="{prop: 'waitConfirmNums', order: 'descending'}">
              <div
                slot="empty"
                v-background="!isloading && !(tableData.length > 0) ? bg : false"
                class="bg">
              </div>
              <meg-table-column
                prop="operatorCode"
                sortable
                :label="$t('用户名')">
              </meg-table-column>
              <meg-table-column
                prop="operatorName"
                sortable
                :label="$t('姓名')">
              </meg-table-column>
              <meg-table-column
                prop="operatorDeptName"
                sortable
                :label="$t('部门')">
              </meg-table-column>
              <meg-table-column
                prop="operateTime"
                sortable
                :label="modeCode === 'face-comparison' ? $t('比对时间') : $t('检索时间')">
                <template slot-scope="scope">
                  <p
                    v-for="(time, index) in filterDate(scope.row.operateTime)"
                    :key="index">
                    {{ time }}
                  </p>
                </template>
              </meg-table-column>
              <meg-table-column
                width="300"
                prop="waitReceiveNums"
                :label="modeCode === 'face-comparison' ? $t('比对条件') : $t('检索条件')">
                <template slot-scope="scope">
                  <div
                    class="rev"
                    v-if="scope.row.paramInfo">
                    <div
                      class="imgWrapList"
                      v-if="(scope.row.paramInfo['search_photos'] instanceof Array)">
                      <div
                        v-for="(img, index) in scope.row.paramInfo['search_photos']"
                        :key="index"
                        class="imgWrap">
                        <meg-img-container
                          text-align="center"
                          vertical-align="middle"
                          :img-src="img">
                        </meg-img-container>
                      </div>
                    </div>
                    <div
                      class="imgWrap"
                      v-else-if="scope.row.paramInfo['search_photos']">
                      <meg-img-container
                        text-align="center"
                        vertical-align="middle"
                        :img-src="scope.row.paramInfo['search_photos']">
                      </meg-img-container>
                    </div>
                    <div
                      class="info">
                      <template v-for="(text, index) in Object.keys(scope.row.paramInfo).filter((item) => item !== 'camera_size')">
                        <div
                          class="conImgMore"
                          :key="index"
                          v-show="index < 6 && isShow(text, scope.row.paramInfo[text])">
                          <span v-if="text !== 'search_photos' && text !== 'source_type'">{{ i18nText[text] || text }}:</span>
                          <p
                            v-if="text === 'wisdom_archive_tactic_label_type' || text === 'wisdom_archive_tactic_label_status'
                              || text === 'wisdom_archive_abnormal_type' || text === 'wisdom_archive_custom_label'
                              || text === 'album_names' || text === 'cascadeNodeRegNames'">
                            {{ scope.row.paramInfo[text].join && scope.row.paramInfo[text].join(',') }}
                          </p>
                          <p
                            v-else-if="text === 'tasks'">
                            {{ scope.row.paramInfo[text].join(',') }}
                          </p>
                          <div
                            v-else-if="text=== 'wisdom_archive_abnormal' || text === 'wisdom_archive_frequency' || text === 'wisdom_archive_active' || text === 'face_properties' || text === 'body_properties'
                              || text === 'motor_properties' || text === 'nonMotor_properties'">
                            <p
                              v-for="(txt, idx) in Object.keys(scope.row.paramInfo[text])"
                              :key="idx">
                              {{ txt }}：{{ scope.row.paramInfo[text][txt].join(',') }}
                            </p>
                          </div>
                          <p
                            v-else-if="text === 'cameras'">
                            {{ $t('{count}个相机',{ count: scope.row.paramInfo.camera_size }) }}
                          </p>
                          <p v-else-if="text === 'capture_times' || text === 'wisdom_archive_active_time' || text === 'wisdom_archive_abnormal_time'">
                            {{ Array.isArray(scope.row.paramInfo[text])? formatDate(scope.row.paramInfo[text]) : formatDate(scope.row.paramInfo[text].split(',')) }}
                          </p>
                          <p v-else-if="text !== 'search_photos' && text !== 'source_type'">
                            {{ displayText(scope.row.paramInfo[text]) }}
                          </p>
                        </div>
                      </template>
                    </div>
                  </div>
                </template>
              </meg-table-column>
              <!--  v-if="modeCode !== 'face-comparison'" -->
              <meg-table-column
                prop="waitFeadBackNums"
                align="center"
                :label="$t('操作')">
                <template slot-scope="scope">
                  <div class="operation">
                    <!-- <span
                    v-if="modeCode === 'face-comparison'"
                    @click="comparison">一件比对</span> -->
                    <!--  v-else -->
                    <span
                      @click="retrievalTab(scope.row)"
                      v-event-tracking="'SearchLogDetail'">
                      <!-- {{ modeCode !== 'face-comparison' ? '检索条件' : '比对条件' }} -->
                      {{ $t('详情') }}
                    </span>
                    <span
                      @click="backToSearch(scope.row)"
                      v-event-tracking="'SearchLogResault'">
                      {{ $t('查看结果') }}
                    </span>
                  </div>
                </template>
              </meg-table-column>
            </meg-table>
          <!-- </meg-scrollbar> -->
          </div>
          <div class="page">
            <meg-pagination
              :current-page.sync="page.pageNo"
              :total="total"
              @size-change="sizeChange"
              @current-change="currentChange"></meg-pagination>
          </div>
        </div>
      </div>
      <!-- 检索条件 -->
      <meg-dialog
        :visible="reOperation"
        :show-footer="false"
        @close="closeDialog">
        <span slot="title">
          {{ $t('检索条件') }}
        </span>
        <div class="log-detail-dialog">
          <div
            class="dialogRe"
            v-if="!!reOperationData">
            <ul class="item">
              <li
                v-for="(key, index) in Object.keys(reOperationData.paramInfo).filter((item) => item !== 'camera_size')"
                v-show="isShow(key, reOperationData.paramInfo[key])"
                :key="index">
                <span>{{ i18nText[key] || key }}:</span>
                <p
                  v-if="key === 'wisdom_archive_tactic_label_type' || key === 'wisdom_archive_tactic_label_status'
                    || key === 'wisdom_archive_abnormal_type' || key === 'wisdom_archive_custom_label'
                    || key === 'album_names' || key === 'cascadeNodeRegNames'">
                  {{ reOperationData.paramInfo[key].join(',') }}
                </p>
                <p
                  v-else-if="(key === 'cameras' || key === 'tasks') && reOperationData.paramInfo[key].length > 0"
                  class="camera-text-list">
                  {{ reOperationData.paramInfo[key].join(',') }} {{ reOperationData.paramInfo.camera_size > 10 ? $t('共{count}个相机', { count: reOperationData.paramInfo.camera_size }) : '' }}
                </p>
                <div
                  v-else-if="key=== 'wisdom_archive_abnormal' || key === 'wisdom_archive_frequency' || key === 'wisdom_archive_active' || key === 'face_properties' || key === 'body_properties'
                    || key === 'motor_properties' || key === 'nonMotor_properties'"
                  class="camera-text-list">
                  <div>
                    <p
                      v-for="(txt, idx) in Object.keys(reOperationData.paramInfo[key])"
                      :key="idx">
                      {{ txt }}: {{ reOperationData.paramInfo[key][txt].join(',') }}
                    </p>
                  </div>
                  <!-- {{ reOperationData.paramInfo[key].join(',') }} -->
                </div>
                <p v-else-if="key === 'capture_times' || key === 'wisdom_archive_active_time' || key === 'wisdom_archive_abnormal_time'">
                  {{ Array.isArray(reOperationData.paramInfo[key])? formatDate(reOperationData.paramInfo[key]) : formatDate(reOperationData.paramInfo[key].split(',')) }}
                </p>
                <p v-else-if="key !== 'search_photos'">
                  {{ displayText(reOperationData.paramInfo[key]) }}
                </p>
                <div
                  v-if="key === 'search_photos'"
                  class="imgContainerWrap">
                  <div
                    class="searchimgWrap"
                    v-if="key === 'search_photos' && (reOperationData.paramInfo[key] instanceof Array)">
                    <div
                      v-for="(img, i) in reOperationData.paramInfo[key]"
                      :key="i">
                      <meg-img-container
                        class="imgContainer"
                        text-align="center"
                        vertical-align="middle"
                        :img-src="img">
                      </meg-img-container>
                    </div>
                  </div>
                  <div
                    v-else
                    class="imgContainer">
                    <div>
                      <meg-img-container
                        text-align="center"
                        vertical-align="middle"
                        :img-src="reOperationData.paramInfo[key]">
                      </meg-img-container>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </meg-dialog>
    </div>
  </page-layout>
</template>

<script>
import { mapGetters } from 'vuex';
import moment from 'moment';
import { switchToModule } from '@/utils/utils';
import commonSwitchParams from '@/common-components/common-switch-params';
import formInteractiveLog from '../components/form-interactive-log';
import retrievalTimes from '../components/retrieval-times';
import Api from '../search-log.service';

export default {
  components: {
    formInteractiveLog,
    retrievalTimes,
  },
  data() {
    return {
      depData: [],
      defaultProps: {
        name: 'name',
        nodesType: 'items',
        id: 'id',
      },
      faceImage: ['备注', '姓名', '性别', '籍贯', '身份证', '民族', '年龄范围', '在逃编号'],
      flagTree: false,
      selectCameraSet: new Set(),
      selectCameraArr: [],
      current: 0,
      ishowDep: false,
      ishowPer: false,
      tableData: [],
      reOperation: false, // 检索条件打开
      iComparison: false, // 比对
      modeCode: 'capture-search',
      modeModel: '',
      userDate: [],
      depDate: [],
      page: {
        pageNo: 1,
        pageSize: 20,
      },
      bg: {
        icon: 'icon_4',
        text: this.$t('检索无数据'),
      },
      total: 0,
      params: {},
      date: new Date() * 1,
      reOperationData: null,
      isloading: false,
      result: [],
      nodes: null,
      i18nSearch: this.$store.getters.dataMapByType('i18n_search_log'),
      i18nText: {},
      cascadeLevel: this.$store.getters.systemByType('cascadeLevel').value
    };
  },
  computed: {
    ...mapGetters([
      'system',
    ]),
    search() {
      let tablist = {
        [this.$t('抓拍检索')]: 'capture-search',
        [this.$t('属性检索')]: 'attribute-search',
        [this.$t('人脸身份')]: 'face-identity',
        [this.$t('全息档案')]: 'document',
        [this.$t('人脸比对')]: 'face-compare',
      };
      if ((this.system.isDual.value === 'true' && this.system.dualPlatformType.value === '0')
        || this.$store.getters.systemByType('cropScene').value === '1') {
        tablist = {
          [this.$t('抓拍检索')]: 'capture-search',
          [this.$t('属性检索')]: 'attribute-search',
          [this.$t('人脸身份')]: 'face-identity',
          [this.$t('人脸比对')]: 'face-compare'
        };
      }
      if (this.cascadeLevel === '1') {
        tablist[this.$t('级联检索')] = 'cascade-capture-search';
      }
      if (this.$store.getters.systemByType('dualEnvType').value === 'static') {
        tablist = {
          [this.$t('人像检索')]: 'face-identity',
          [this.$t('人脸比对')]: 'face-compare',
        };
      }
      return tablist;
    },
    defaultSearch() {
      if (this.system.isDual.value === 'true' && this.system.dualPlatformType.value === '0') {
        return this.$t('抓拍检索');
      }
      if (this.$store.getters.systemByType('dualEnvType').value !== 'static') {
        return this.$t('抓拍检索');
      }
      return this.$t('人像检索');
    },
    isStatic() {
      return this.$store.getters.systemByType('dualEnvType').value === 'static'; // 是否纯静态纯动态 default为全量
    },
  },
  created() {
    this.modeModel = this.defaultSearch;
    this.modeCode = this.search[this.modeModel];
    this.getpeopleTree();
    this.i18nSearch.forEach((item) => {
      if (item.code === 'body_threshold' || item.code === 'motor_threshold' || item.code === 'nonmotor_threshold') {
        this.i18nText[item.code] = '人机非相似度';
      } else {
        this.i18nText[item.code] = item.value;
      }
    });
  },
  methods: {
    // onSortChange({ prop, order }) {
    //   debugger;
    //   console.log(prop);
    //   console.log(order);
    // },
    displayText(text) {
      if (text === false) {
        return '否';
      }
      if (text === true) {
        return '是';
      }
      return text;
    },
    closeDialog() {
      this.reOperation = false;
      this.reOperationData = null;
    },
    formatDate(time) {
      const start = moment(Number(time[0])).format('YYYY-MM-DD HH:mm:ss');
      const end = moment(Number(time[1])).format('YYYY-MM-DD HH:mm:ss');
      return this.$t('{start}至{end}', { start, end });
    },
    searchLog() {
      const { date } = this.$refs.inter;
      const operatorId = this.selectCameraArr.map((item) => item);
      if (!date) {
        this.$message({
          message: this.$t('请选择{entity}', { entity: this.$t('日期') }),
          type: 'warning',
        });
        return;
      } if (operatorId.length === 0) {
        this.$message({
          message: this.$t('请选择{entity}', { entity: this.$t('部门人员') }),
          type: 'warning',
        });
        return;
      }
      if (this.isloading) return;
      this.isloading = true;
      this.params = {
        startTime: new Date(date[0]) * 1,
        endTime: new Date(date[1]) * 1,
        operatorId,
        moduleCode: this.modeCode,
      };
      // const TWidth = this.$refs.elTabel.$el.offsetWidth;
      this.page.pageNo = 1;
      const paramsUsers = {
        startTime: new Date(date[0]) * 1,
        endTime: new Date(date[1]) * 1,
        operatorId,
        moduleCode: this.modeCode,
      };
      this.getQueryLogList();
      this.getCountLogByUsers(paramsUsers);
      this.getCountLogByDepts(paramsUsers);
    },
    /**
     * 检索
     */
    retrieval() {
      this.searchLog();

      this.eventTracking('SearchLogSearch');
    },
    /**
     * 重置
     */
    reset() {
      this.resetTree();
      this.$refs.inter.initDate();
    },
    /**
     * 按用户统计检索次数
     * @param 请求参数
     */
    getCountLogByUsers(params) {
      Api.countLogByUsers(params).then((res) => {
        if (res.code === 0) {
          this.userDate = res.data.sort((a, b) => b.countNum - a.countNum);
          this.isloading = false;
        }
      });
    },
    /**
     * 按部门统计检索次数
     * @param 请求参数
     */
    getCountLogByDepts(params) {
      Api.countLogByDepts(params).then((res) => {
        if (res.code === 0) {
          this.depDate = res.data.sort((a, b) => b.countNum - a.countNum);
          // this.isloading = false;
        }
      });
    },
    /**
     * 获取日志分页列表
     * @param 请求参数
     */
    getQueryLogList() {
      const params = {
        ...this.params,
        ...this.page,
      };
      Api.queryLogList(params).then((res) => {
        if (res.code === 0) {
          const result = res.data.records.map((item) => {
            if (item.paramInfo && typeof item.paramInfo === 'string') {
              item.paramInfo = JSON.parse(item.paramInfo);
            }
            if (this.modeCode === 'capture-search') {
              if (item.paramInfo.source_type) {
                delete item.paramInfo.source_type;
              }
              if (item.paramInfo.nonmotor_threshold) {
                delete item.paramInfo.nonmotor_threshold;
              }
              if (item.paramInfo.motor_threshold) {
                delete item.paramInfo.motor_threshold;
              }
            }
            if (this.modeCode === 'attribute-search') {
              if (item.paramInfo.source_type) {
                delete item.paramInfo.source_type;
              }
            }
            if (item.realParam) {
              try {
                const realParam = JSON.parse(item.realParam);
                item.rect = [];
                if (this.modeCode === 'capture-search' && realParam.type !== 'byProperties') {
                  item.rect.push(realParam.param.photos[0].locators.rect);
                } else if (this.modeCode === 'face-identity' && realParam.type !== 'byProperties') {
                  item.rect.push(realParam.param.faceList[0].rect);
                } else if (this.modeCode === 'face-compare' && realParam.type !== 'byProperties') {
                  item.rect = Object.keys(realParam.param).map((name) => realParam.param[name].rect);
                }

                if (this.modeCode === 'capture-search') {
                  delete item.paramInfo.motor_threshold;
                  delete item.paramInfo.nonmotor_threshold;
                }
              } catch (err) {
                console.log(err);
                item.rect = [];
              }
            }
            return item;
          });

          this.tableData = result;
          this.total = res.data.totalRecords;
          this.isloading = false;
          // this.date = new Date() * 1;
        } else {
          this.isloading = false;
        }
      });
    },
    /**
     * 获取部门树
     */
    getpeopleTree() {
      const params = {
        showHidden: false,
        showHiddenUser: false,
        showAdmin: true
      };
      Api.peopleTree(params).then((res) => {
        if (res.code === 0 && res.data) {
          this.depData.push(res.data);
          this.flagTree = true;
        }
      });
    },
    fliterPlepeo(data) {
      data.forEach((list) => {
        if (list.type === 'user') {
          list.checked = true;
          this.result.push(list);
        }
        if (list.items.length > 0) {
          this.fliterPlepeo(list.items);
        }
      });
    },
    /**
     * 临时过滤
     */
    fliterData(data, type) {
      return data.map((item) => {
        if (item[type] && item[type].length > 0) {
          item.flag = 'place';
          this.fliterData(item[type], type);
        } else {
          item.flag = 'camera';
        }
        return item;
      });
    },
    initData() {
      Object.values(this.nodes).forEach((item) => {
        item.checked = true;
        if (item.type === 'user') {
          // result.push(item.id);
          this.selectCameraSet.add(item.id);
        }
      });
      this.selectCameraArr = Array.from(this.selectCameraSet);
    },
    treeUpdateReady(nodes) {
      if (Object.values(nodes).length === 0) return;
      this.nodes = this.$refs.tree.getCheckedNodes();
      this.initData();
      this.$nextTick(() => {
        this.searchLog();
      });
      // this.cameraNumber = number.totalDeepNodeCount;
    },
    /**
     * tree发生变化
     * 数据处理缓存中心
     */
    checkChanged(data) {
      if (data.type === 'user') {
        if (data.checked) {
          this.selectCameraSet.add(data.id);
        } else {
          this.selectCameraSet.delete(data.id);
        }
      } else {
        const res = this.$refs.tree.getCheckedNodes();
        this.selectCameraSet = new Set();
        res.forEach((item) => {
          if (item.type === 'user') {
            this.selectCameraSet.add(item.id);
          }
        });
      }
      this.selectCameraArr = Array.from(this.selectCameraSet);
    },
    /**
     * 重置
     */
    resetTree() {
      this.selectCameraSet = new Set();
      // this.selectCameraArr = [];
      // this.$refs.tree.setCheck([]);
      this.initData();
    },
    /**
     * 头部切换
     */
    tab(code) {
      const { date } = this.$refs.inter;
      const operatorId = this.selectCameraArr.map((item) => item.id);
      if (!date) {
        this.$message({
          message: '请选择日期',
          type: 'warning',
        });
        return;
      } if (operatorId.length === 0) {
        this.$message({
          message: '请选择部门人员',
          type: 'warning',
        });
        return;
      }
      this.modeCode = this.search[code];
      this.searchLog();

      switch (this.modeCode) {
        case 'face-compare':
          this.eventTracking('SearchLogFaceCompare');
          break;
        case 'face-identity':
          this.eventTracking('SearchLogFaceIdentity');
          break;
        case 'attribute-search':
          this.eventTracking('SearchLogNatureSearch');
          break;
        case 'document':
          this.eventTracking('SearchLogDocument');
          break;
        default: {
          this.eventTracking('SearchLogCaptureSearch');
        }
      }
    },
    /**
     * 点击父元素全部隐藏
     */
    iDepPer() {
      this.ishowPer = false;
      this.ishowDep = false;
    },
    /**
     * 显示隐藏部门
     */
    iDep() {
      this.ishowDep = !this.ishowDep;
      this.ishowPer = false;
    },
    /**
     * 显示隐藏人员
     */
    iPer() {
      this.ishowPer = !this.ishowPer;
      this.ishowDep = false;
    },
    /**
     * 检索条件
     */
    retrievalTab(data) {
      if (!data.paramInfo) {
        this.$message({
          message: this.$t('暂无可检索的数据'),
          type: 'warning',
        });
        return;
      }
      this.reOperation = true;
      this.reOperationData = data;
      console.log(this.reOperationData);
      console.log(this.reOperationData.paramInfo.search_photos instanceof Array);
    },
    /**
     * 回溯到检索页面
     */
    backToSearch(data) {
      const { id, realParam, paramInfo } = data;

      // const query = {
      //   id,
      //   realParam
      // }

      const moduleInfo = {
        isBlank: true,
        pageType: 'single'
      };
      switch (this.modeCode) {
        case 'face-compare':
          moduleInfo.module = 'face-compare';
          moduleInfo.query = {
            id
          };
          switchToModule(moduleInfo);
          break;
        case 'face-identity':
          moduleInfo.module = 'face-identity';
          moduleInfo.query = {
            id
          };
          switchToModule(moduleInfo);
          break;
        case 'cascade-capture-search':
          moduleInfo.module = 'cascade-capture-search';
          break;
        case 'document':
          moduleInfo.module = 'document';
          moduleInfo.query = {
            data: this.buildParamsForDocument(JSON.parse(realParam).param, paramInfo),
            from: 'search-log',
          };
          new commonSwitchParams.FormatSwitchParams(moduleInfo).switchToModule();
          break;
        case 'attribute-search':
          moduleInfo.module = 'attribute-search';
          moduleInfo.query = {
            data: JSON.parse(realParam).param,
            from: 'search-log',
          };
          new commonSwitchParams.FormatSwitchParams(moduleInfo).switchToModule();
          break;
        default: {
          moduleInfo.module = 'capture-search';
          moduleInfo.query = {
            data: JSON.parse(realParam).param,
            from: 'search-log',
          };
          new commonSwitchParams.FormatSwitchParams(moduleInfo).switchToModule();
        }
      }
    },
    /**
     * 查看全息档案检索结果跳转前参数重组
     */
    buildParamsForDocument(realParams, paramInfo) {
      const { photoCondition, profileCondition, realNameCondition } = realParams.condition;
      console.log('profileCondition', profileCondition);
      const params = {};

      // profileCondition参数
      if (profileCondition) {
        if (profileCondition.activeInfo && profileCondition.activeInfo.activeStartTime && profileCondition.activeInfo.activeEndTime) {
          params.activeTime = [profileCondition.activeInfo.activeStartTime, profileCondition.activeInfo.activeEndTime];
        }
        if (profileCondition.activeInfo && profileCondition.activeInfo.areaIdList) {
          params.activeList = profileCondition.activeInfo.areaIdList.concat(profileCondition.activeInfo.cameraIdList);
        }
        if (profileCondition.frequencyArea && profileCondition.frequencyArea.frequencyAreaIds) {
          params.frequencyList = profileCondition.frequencyArea.frequencyAreaIds.concat(profileCondition.frequencyArea.frequencyCameraIds);
        }
        if (profileCondition.tacticLabels && profileCondition.tacticLabels[0]) {
          if (profileCondition.tacticLabels[0].tacticLabelIds) {
            params.tacticLabelIds = profileCondition.tacticLabels[0].tacticLabelIds;
          }
          if (profileCondition.tacticLabels[0].tacticLabelStatus) {
            params.tacticLabelStatus = profileCondition.tacticLabels[0].tacticLabelStatus.map((i) => i.toString());
          }
        }
        if (profileCondition.profileType) {
          params.profileType = profileCondition.profileType;
        }
        if (profileCondition.customLabelIds) {
          params.customLabelIds = profileCondition.customLabelIds;
        }
        if (profileCondition.mobileDeviceNo) {
          params.mobileDeviceNo = profileCondition.mobileDeviceNo;
        }
        if (profileCondition.age.periodCode) {
          params.periodCode = profileCondition.age.periodCode;
        }
        if (profileCondition.genderCode) {
          params.genderCode = profileCondition.genderCode;
        }
        if (profileCondition.abnormalBehavior) {
          if (profileCondition.abnormalBehavior.endTime) {
            params.abnormalTime = [profileCondition.abnormalBehavior.startTime, profileCondition.abnormalBehavior.endTime];
          }
          if (profileCondition.abnormalBehavior.abnormalBehaviorAreaIds) {
            params.abnormalList = profileCondition.abnormalBehavior.abnormalBehaviorAreaIds;
          }
          if (profileCondition.abnormalBehavior.abnormalBehaviorTypeIds) {
            params.abnormalTypeList = profileCondition.abnormalBehavior.abnormalBehaviorTypeIds;
          }
        }
      }

      if (realNameCondition) {
        if (realNameCondition.ancientCity) {
          params.ancientCity = realNameCondition.ancientCity;
        }
        if (realNameCondition.cardNo) {
          params.cardNo = realNameCondition.cardNo;
        }
        if (realNameCondition.cardType) {
          params.cardType = realNameCondition.cardType;
        }
        if (realNameCondition.name) {
          params.name = realNameCondition.name;
        }
        if (realNameCondition.album) {
          const monitorAlbumIds = realNameCondition.album.monitorAlbumIds ? realNameCondition.album.monitorAlbumIds : [];
          const staticAlbumIds = realNameCondition.album.staticAlbumIds ? realNameCondition.album.staticAlbumIds : [];
          monitorAlbumIds.concat(staticAlbumIds);
          params.albumList = monitorAlbumIds;
        }
      }

      if (photoCondition) {
        const fileList = [{}];
        fileList[0].images = [{}];
        fileList[0].couldEdit = false;
        fileList[0].goAnalyze = false;

        if (photoCondition.photoData) {
          fileList[0].photo = photoCondition.photoData;
        }
        // eslint-disable-next-line no-prototype-builtins
        if (photoCondition.hasOwnProperty('detectType')) {
          fileList[0].images[0].detectType = photoCondition.detectType;
        }
        if (photoCondition.featureData) {
          fileList[0].images[0].feature = {
            'featureData': photoCondition.featureData
          };
        }
        fileList[0].images[0].locator = {};
        if (photoCondition.rect) {
          fileList[0].images[0].locator.rect = photoCondition.rect;
        }
        if (photoCondition.hint) {
          fileList[0].images[0].locator.hint = photoCondition.hint;
        }
        if (photoCondition.landmark) {
          fileList[0].images[0].locator.landmark = photoCondition.landmark;
        }
        params.fileList = fileList;
      }

      if (paramInfo.wisdom_archive_search_type === '按档案检索') {
        params.searchType = 'document';
      } else if (paramInfo.wisdom_archive_search_type === '按底库检索') {
        params.searchType = 'album';
      }
      console.log('search-log to document', params);
      return params;
    },
    /**
     * 比对
     */
    comparison() {
      this.iComparison = true;
    },
    /**
     * 日期过滤
     */
    filterDate(time) {
      const date = new Date(time);
      const y = date.getFullYear();
      let m = date.getMonth() + 1;
      let d = date.getDate();
      let h = date.getHours();
      let minute = date.getMinutes();
      let second = date.getSeconds();
      m = m < 10 ? (`0${m}`) : m;
      d = d < 10 ? (`0${d}`) : d;
      h = h < 10 ? (`0${h}`) : h;
      minute = minute < 10 ? (`0${minute}`) : minute;
      second = second < 10 ? (`0${second}`) : second;
      return [`${y}-${m}-${d}`, `${h}:${minute}:${second}`];
    },
    /**
     * 张数发生改变
     */
    sizeChange(val) {
      this.page.pageSize = val;
      this.page.pageNo = 1;
      this.getQueryLogList();
    },
    /**
     * 当前页数发生改变
     */
    currentChange(val) {
      this.page.pageNo = val;
      this.getQueryLogList();
    },
    /**
     * 主要是针对选相机还是选文件的显示处理
     */
    isShow(key, data) {
      if (key === 'cameras' || key === 'tasks') {
        if (data.length === 0) return false;
      }
      return true;
    }
  },
};
</script>
<style lang="scss">
.log-detail-dialog {
  max-height: 500px;
  overflow-y: auto;
}
.meg-dialog__header {
    font-size: 16px;
    color: #435068;
    font-weight: bold;
    line-height: 54px;
  }
.searchLog {
  .tree-selector-head {
    display: none !important;
  }
  .div.meg-form-item,
  .meg-form-item {
    margin-bottom: 0 !important;
  }
}
</style>
<style lang="scss" scoped>
.searchLog {
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
  div,
  p,
  li,
  ul {
    box-sizing: border-box;
  }
  .camera-text-list {
    line-height: 20px;
    padding-top: -3px;
  }
  .line {
    width: 100%;
    height: 10px;
    background: #efefef;
  }
  .form {
    // flex: 1;
    height: calc(100% - 56px);
    overflow: hidden;
  }
  .depWrap {
    width: 100%;
    height: 100%;
    padding: 0 25px;
    h3 {
      line-height: 54px;
      font-size: 14px;
      color: #435068;
      margin-bottom: 20px;
      font-weight: 600;
      border-bottom: 1px solid #f3f3f3;
    }
    .treeWrap {
      height: calc(100% - 80px);
      overflow: hidden;
    }
  }
  .searchLogTable {
    flex: 1;
    padding-left: 18px;
    background: #dce1e5;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    span {
      font-size: 12px;
    }
    .tableHead {
      width: 100%;
      height: 58px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      span {
        i {
          font-style: normal;
          font-size: 14px;
        }
      }
      .list {
        border: 1px solid #a6bad7;
        height: 34px;
        background: #fff;
        display: flex;
        box-sizing: content-box;
        p {
          width: 90px;
          line-height: 34px;
          text-align: center;
          font-size: 12px;
          color: #21539a;
          border-right: 1px solid #21539a;
          box-sizing: content-box;
          cursor: pointer;
          &:last-child {
            border-right: none;
          }
          &.actived {
            color: #fff;
            background: #21539a;
          }
        }
      }
    }
    .logTable {
      flex: 1;
      display: flex;
      flex-direction: column;
      //  overflow: hidden;
      .scrollWraps {
        width: 100%;
        height: calc(100% - 48px);
        // overflow: hidden;
      }
      .page {
        width: 100%;
        height: 48px;
        background: #fff;
        padding-top: 8px;
      }
    }
    .reviNumber {
      display: flex;
      padding-right: 10px;
    }
  }
  .operation {
    width: 100%;
    height: 100%;
    // display: flex;
    // align-items: center;
    span {
      font-size: 14px;
      color: #21539b;
      margin-right: 16px;
      cursor: pointer;
      // &:last-child{
      //   margin-right: 0;
      // }
    }
  }
  .dialogRe {
    width: 100%;
    height: 100%;
    padding: 35px 25px;
    .photo {
      width: 100%;
      height: 270px;
      border: 1px solid rgb(228, 231, 237);
      p {
        padding: 10px;
        box-sizing: border-box;
      }
    }
  }
  .item {
    width: 100%;
    // max-height: 100%;
    overflow: hidden;
    // border:1px solid #dadee4;
    li {
      // background:#f9f9f9;
      width: 100%;
      height: auto;
      padding: 12px;
      display: flex;
      align-items: center;
      // border-bottom: 1px solid #f2f2f2;
      span {
        display: inline-block;
        width: 90px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.4);
      }
      p {
        font-size: 14px;
        flex: 1;
        color: #435068;
        word-break: break-all;
      }
      .imgContainerWrap {
        flex: 1;
        .searchimgWrap {
          display: flex;
          align-items: center;
          > div {
            margin-right: 2px;
          }
        }
      }
      .imgContainer {
        width: 110px;
        height: 110px;
        > div {
          display: flex;
          align-items: center;
        }
      }
      // &:nth-child(even){
      //   background: #fff;
      // }
      // &:last-child{
      //   border-bottom:none;
      // }
    }
  }
  .imgWrapList {
    display: flex;
    max-width: 120px;
  }
  .imgWrap {
    width: 90px;
    height: 90px;
    overflow: hidden;
    margin-right: 5px;
  }
  .rev {
    display: flex;
    align-items: center;
  }
  .info {
    width: 100%;
    height: 100%;
    > div {
      display: flex;
    }
    span {
      display: inline-block;
      width: 80px;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.4);
    }
    p {
      font-size: 12px;
      color: #435068;
      flex: 1;
    }
  }
  .comparison {
    width: 100%;
    height: 100%;
    padding: 25px 35px;
    display: flex;
    > div {
      flex: 1;
      position: relative;
      &:hover {
        .id {
          display: block;
        }
      }
      .id {
        position: absolute;
        width: 100%;
        line-height: 35px;
        text-align: center;
        color: #fff;
        background: rgba(0, 0, 0, 0.7);
        display: none;
        top: 0;
        left: 0;
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.i18n-en-US {
  .searchLog {
    .info span {
      max-width: 109px;
      width: auto;
    }
    .item li span {
      width: 134px;
    }
  }
}
</style>
