<template>
  <div
    v-loading="loading"
    class="business-config">
    <section class="config-header">
      <h2>业务配置</h2>
      <section class="config-tab">
        <meg-radio-group
          v-model="currentTab">
          <meg-radio-button
            label="event">
            事件
          </meg-radio-button>
          <meg-radio-button
            label="search">
            检索
          </meg-radio-button>
          <meg-radio-button
            label="judge">
            研判
          </meg-radio-button>
          <meg-radio-button
            v-if="!(isDual && !isVideoNet && dualScene===3)"
            label="analyze">
            解析
          </meg-radio-button>
        </meg-radio-group>
      </section>
      <div
        class="header-btns">
        <template v-if="saveAuth">
          <meg-button
            @click="restoreConfig">
            {{ $t('还原默认设置') }}
          </meg-button>
          <meg-button
            type="primary"
            @click="saveConfig">
            {{ $t('保存') }}
          </meg-button>
        </template>
      </div>
    </section>
    <section class="config-content">
      <event-config
        ref="eventConfig"
        v-show="currentTab==='event'"
        :config-rules="eventConfigRules"
        :config-data="eventConfigData">
      </event-config>
      <search-config
        ref="searchConfig"
        :album-list="albumList"
        :config-rules="searchConfigRules"
        v-show="currentTab==='search'"
        :config-data="searchConfigData">
      </search-config>
      <judge-config
        ref="judgeConfig"
        :config-rules="judgeConfigRules"
        v-show="currentTab==='judge'"
        :config-data="judgeConfigData"></judge-config>
      <analyze-config
        :config-rules="analyzeConfigRules"
        ref="analyzeConfig"
        v-show="currentTab==='analyze'&&!(isDual && !isVideoNet && dualScene===3)"
        :config-data="analyzeConfigData"></analyze-config>
    </section>
  </div>
</template>

<script>
import EventConfig from '../components/event-config';
import SearchConfig from '../components/search-config';
import JudgeConfig from '../components/judge-config';
import AnalyzeConfig from '../components/analyze-config';
import BusinessConfigServ from '../business-config.service';
import ConfigRules from '../business-config.rules';

export default {
  components: {
    EventConfig,
    SearchConfig,
    JudgeConfig,
    AnalyzeConfig,
  },
  data() {
    return {
      currentTab: 'event',
      loading: true, // 加载状态
      albumList: [],
      // 事件设置
      eventConfigData: {
        assembleDuration: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_body_assemble_duration')), // 人群聚集时长
        assembleNum: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_body_assemble_num')), // 人群聚集人数
        rangeThreshold: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_export_warn_range_threshold')), // 报警导出范围阈值
        bodyThreshold: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_body_identify_threshold')), // 人体识别布控阈值
        motorThreshold: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_motor_identify_threshold')), // 机动车识别布控阈值
        nonMotorThreshold: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_non_motor_identify_threshold')), // 非机动车识别布控阈值
        deploymentThreshold: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_alarm_deployment_recommend_threshold')), // 报警布控推荐阈值
        attrThreshold: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_attr_identify_threshold')), // 属性检测布控阈值
        warningVideoTime: this.analysisPlaceholder(this.$store.getters.systemByType('warningVideoTime')), // 报警视频长度
        durationXzone: this.analysisPlaceholder(this.$store.getters.systemByType('duration_alarm_xzone')), // 报警活动轨迹检索时长
        retrievalThreshold: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_alarm_trajectory_human_retrieval_threshold')), // 报警活动轨迹人体检索推荐阈值
        alarmSound: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_alarm_sound_default_config')), // 报警声音默认设置
        alarmInterval: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_alarm_interval')), // 报警间隔
        distinctInterval: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_alarm_distinct_interval')), // 报警去重间隔
        fullShowTime: this.analysisPlaceholder(this.$store.getters.systemByType('fullShowTime')), // 抓拍图展示时间
        enableDuplicates: this.analysisPlaceholder(this.$store.getters.systemByType('enableDuplicates')), // 历史报警去重
        videoResolution: this.analysisPlaceholder(this.$store.getters.systemByType('videoResolution')), // 视频分辨率
        alarmType: this.analysisPlaceholder(this.$store.getters.systemByType('mask_alarm')), // 口罩报警类型
        enableDelRetrievalCapture: this.analysisPlaceholder(this.$store.getters.systemByType('enableDelRetrievalCapture')), // 视频找人
        alarmLevel: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_deploy_default_album_level')), // 报警级别
      },
      // 检索设置
      searchConfigData: {
        deepSearchModel: this.analysisPlaceholder(this.$store.getters.systemByType('deepSearchModel')), // 深度检索
        captureFaceThreshold: this.analysisPlaceholder(this.$store.getters.systemByType('galaxy_capture_face_search_threshold')), // 人像检索推荐阈值
        otherFaceThreshold: this.analysisPlaceholder(this.$store.getters.systemByType('galaxy_capture_other_search_threshold')), // 人机非检索推荐阈值
        alarmVideoLengthSec: this.analysisPlaceholder(this.$store.getters.systemByType('alarmVideoLengthSec')), // 抓拍视频长度
        defaultSelectionTime: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_capture_search_default_selection_time')), // 抓拍检索默认选择时间
        bmnmRangeThreshold: this.analysisPlaceholder(this.$store.getters.systemByType('galaxy_capture_search_range_threshold')), // 人机非检索范围
        captureFaceLimit: this.analysisPlaceholder(this.$store.getters.systemByType('galaxy_capture_face_result_limit_threshold')), // 人脸检索单个目标返回数量
        captureOtherLimit: this.analysisPlaceholder(this.$store.getters.systemByType('galaxy_capture_other_result_limit_threshold')), // 人机非检索单个目标返回数量
        enableOneToMany: this.analysisPlaceholder(this.$store.getters.systemByType('enableOneToMany')), // 是否开启抓拍1：n
        staticAlbum: this.analysisPlaceholder(this.$store.getters.systemByType('staticAlbum')), // 静态库
        exportRange: this.analysisPlaceholder(this.$store.getters.systemByType('galaxy_capture_export_range_threshold')), // 静态库
      },
      // 研判设置
      judgeConfigData: {
        peerIntervals: this.analysisPlaceholder(this.$store.getters.systemByType('peerIntervals')), // 同行间隔时间
        judgeThreshold: this.analysisPlaceholder(this.$store.getters.systemByType('judgeThreshold')), // 研判阈值
        durationFacebodyXzone: this.analysisPlaceholder(this.$store.getters.systemByType('duration_facebody_xzone')), // 小范围人体检索时长
        thresholdFacebodyXzone: this.analysisPlaceholder(this.$store.getters.systemByType('threshold_facebody_xzone')), // 小范围人体检索推荐阈值
        analyticalPower: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_analytical_power')), // 轨迹追踪默认动态解析算力
        timePeriod: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_default_tracking_time_range')), // 轨迹追踪默认时间段
        trackingTimeRange: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_judge_global_tracking_time')), // 默认追踪时间范围
        trackingMapRange: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_default_tracking_map_range')), // 默认追踪地图范围
        judgeCameraLimit: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_judge_camera_limit')), // 相机选择限制
      },
      // 解析配置
      analyzeConfigData: {
        platformCapabilities: this.analysisPlaceholder(this.$store.getters.systemByType('analysisVideoPlatformLimit')), // 第三方平台转发能力上限
        historySlicingTime: this.analysisPlaceholder(this.$store.getters.systemByType('history_slicing_time')), // 分片时长限制
      },
    };
  },
  computed: {
    saveAuth() {
      return this.$store.getters.modulePermissonsByAlias('business-config', 'business-config-auth');
    },
    isDual() {
      return this.$store.getters.systemByType('isDual').value === 'true';
    },
    videoNetOfThree() {
      return this.isVideoNet && this.dualScene === 3;// 场景三视频网
    },
    isVideoNet() {
      return this.$store.getters.systemByType('dualPlatformType').value === '0';
    },
    dualScene() {
      return Number(this.$store.getters.systemByType('dualScene').value);
    }
  },
  created() {
    this.getSystemConfig();
    this.getRulesData();
    this.getAlbumList();
  },
  methods: {
    /*
    * 获取校验规则
    * @param {any}
    * @return
    * */
    getRulesData() {
      const {
        eventConfig,
        searchConfig,
        judgeConfig,
        analyzeConfig
      } = ConfigRules;
      this.eventConfigRules = eventConfig;
      this.searchConfigRules = searchConfig;
      this.judgeConfigRules = judgeConfig;
      this.analyzeConfigRules = analyzeConfig;
    },
    /*
    * 表单校验
    * @param {any}
    * @return
    * */
    validateConfigForm() {
      const configRefMap = {
        event: 'eventConfig',
        search: 'searchConfig',
        judge: 'judgeConfig',
        analyze: 'analyzeConfig',
      };
      const isValid = this.$refs[configRefMap[this.currentTab]].validateForm();
      return isValid;
    },
    /*
    * 恢复默认设置
    * @param {any}
    * @return
    * */
    restoreConfig() {
      const configData = {
        ...this.eventConfigData,
        ...this.searchConfigData,
        ...this.judgeConfigData,
        ...this.analyzeConfigData,
      };
      Object.keys(configData).forEach((key) => {
        configData[key].value = configData[key].defaultValue;
      });
      this.saveConfig({ isRestore: true });
    },
    /*
    * 保存设置
    * @param {any}
    * @return
    * */
    saveConfig() {
      if (!this.validateConfigForm()) {
        return;
      }
      const newConfigArr = [];
      const configData = {
        ...this.eventConfigData,
        ...this.searchConfigData,
        ...this.judgeConfigData,
        ...this.analyzeConfigData,
      };
      Object.keys(configData).forEach((key) => {
        const config = { ...configData[key] };
        if (config.code === 'staticAlbum' && config.value.length > 0 && Array.isArray(config.value)) {
          config.value = config.value.filter((item) => {
            const isExsit = this.albumList.findIndex((album) => album.id === item) > -1;
            return isExsit;
          });
          config.value = config.value.join(',');
        }
        newConfigArr.push({
          code: config.code,
          value: config.value
        });
      });
      BusinessConfigServ.updateSystemConfig(newConfigArr).then((res) => {
        if (res && res.code === 0) {
          this.$message({
            message: this.$t('修改系统配置信息成功'),
            type: 'success'
          });
          this.getSystemConfig();
        } else {
          this.$message({
            message: this.$t('修改系统配置信息失败'),
            type: 'error'
          });
        }
      });
    },

    /**
     * 获取系统设置
     */
    getSystemConfig() {
      this.loading = true;
      BusinessConfigServ.getSystemConfig().then((res) => {
        if (res.code === 0) {
          this.$store.dispatch('setSystem', res.data);
        }
        this.loading = false;
      });
    },
    /**
     * 获取动静态底库列表
     */
    getAlbumList() {
      const param = {
        'type': [1, 2], // 1-静态库；2-动态库；3-白名单库,
        'srcType': [1] // 1-本地创建或双网同步；2-分发机同步，不允许一键布控
      };
      if (this.videoNetOfThree) {
        param.platformType = 0;
      }
      BusinessConfigServ.getAlbumList(param).then((res) => {
        if (res.code === 0) {
          this.albumList = res.data;
        }
      });
    },
    /**
     * 通过remark解析placeholder
     */
    analysisPlaceholder(configData) {
      // 默认添加placeholder属性
      configData.placeholder = '';
      // 在switch中不识别字符串类型的“true”和“false”，需要进行boolean转换
      if (configData.defaultValue === 'true') {
        configData.defaultValue = true;
      }
      if (configData.defaultValue === 'false') {
        configData.defaultValue = false;
      }
      if (configData.value === 'true') {
        configData.value = true;
      }
      if (configData.value === 'false') {
        configData.value = false;
      }
      if (configData && configData.remark && configData.remark.indexOf('@') > -1) {
        const arr = configData.remark.split('@');
        [configData.placeholder, configData.remark] = arr;
      }
      // 后端会把数组转成字符串 所以前端需要把数组转成字符串传给后端 但是给select赋值的时候需要转成数组
      if (configData.code === 'staticAlbum' && typeof configData.value === 'string') {
        configData.value = configData.value ? configData.value.split(',') : [];
        configData.value = configData.value.filter((item) => !!item);
      }
      return configData;
    },
  }
};
</script>

<style lang="scss" scoped>
.business-config {
  padding: 0 10px;
  background: #dce1e5;
  height: 100%;
  .config-header {
    padding: 0 10px;
    height: 56px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    h2 {
      font-weight: 600;
      font-size: 16px;
    }
  }
  .config-content {
    height: calc(100% - 56px);
    overflow-y: scroll;
    &::v-deep .item {
      width: 100%;
      font-size: 12px;
      .meg-input,
      .meg-select,
      .meg-input-number,
      .meg-textarea {
        width: 270px;
      }
      .meg-input-number {
        .meg-input__inner {
          text-align: left;
        }
      }
      .tip {
        font-size: 12px;
        color: #999999;
        display: inline-block;
        margin-left: 5px;
      }
    }
  }
}
</style>
