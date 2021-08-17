<template>
  <div
    v-loading="loading"
    class="basic-config">
    <section class="config-header">
      <h2>基础配置</h2>
      <div
        class="header-btns"
        v-if="saveAuth">
        <meg-button
          @click="restoreConfig">
          {{ $t('还原默认设置') }}
        </meg-button>
        <meg-button
          type="primary"
          @click="saveConfig">
          {{ $t('保存') }}
        </meg-button>
      </div>
    </section>
    <section class="config-content">
      <logo-config
        ref="logoConfig"
        :product-type="productType"
        v-if="isSuperAdmin"
        :upload-url="uploadUrl"
        :config-rules="logoConfigRules"
        :config-data="logoConfigData">
      </logo-config>
      <login-config
        ref="loginConfig"
        :config-rules="loginConfigRules"
        :config-data="loginConfigData">
      </login-config>
      <storage-config
        v-if="!videoNetOfOneOrTwo"
        :config-data="storageConfigData"
        :storage-options="storageOptions"></storage-config>
      <database-config
        v-if="!videoNetOfOneOrTwo"
        :album-list="albumList"
        :config-data="databaseConfigData"></database-config>
      <face-album-config
        v-if="enablePkConfig"
        :config-data="faceAlbumConfigData"></face-album-config>
      <file-config
        v-if="!(videoNetOfOneOrTwo || videoNetOfFour)"
        :config-data="fileConfigData"
        :slicing-time-options="slicingTimeOptions"></file-config>
      <device-config
        v-if="!(videoNetOfOneOrTwo && videoNetOfOneOrTwo)"
        :config-data="deviceConfigData"></device-config>
      <map-config
        ref="mapConfig"
        :config-rules="mapConfigRules"
        :config-data="mapConfigData"></map-config>
      <version-config :config-data="versionInfoData">
      </version-config>
      <quality-config :config-data="qualityConfigData"></quality-config>
    </section>
  </div>
</template>

<script>
import VersionConfig from '../components/version-config';
import LogoConfig from '../components/logo-config';
import LoginConfig from '../components/login-config';
import StorageConfig from '../components/storage-config';
import DatabaseConfig from '../components/database-config';
import FaceAlbumConfig from '../components/face-album-config';
import FileConfig from '../components/file-config';
import DeviceConfig from '../components/device-config';
import MapConfig from '../components/map-config';
import qualityConfig from '../components/quality-config';
import BaseConfigServ from '../base-config.service';
import BasicRules from '../basic-config.rules';

export default {
  components: {
    VersionConfig,
    LogoConfig,
    LoginConfig,
    StorageConfig,
    DatabaseConfig,
    FaceAlbumConfig,
    FileConfig,
    DeviceConfig,
    MapConfig,
    qualityConfig
  },
  data() {
    return {
      loading: true, // 加载状态
      uploadUrl: BaseConfigServ.upload,
      albumList: [],
      slicingTimeOptions: this.$store.getters.dataMapByType('slicingTime'),
      storageOptions: this.$store.getters.dataMapByType('offlineFileSize'),

      // 登录设置
      loginConfigData: {
        expiration: this.analysisPlaceholder(this.$store.getters.systemByType('expiration')),
        verificationCode: this.analysisPlaceholder(this.$store.getters.systemByType('loginCodeEnabled'))
      },
      // 存储设置
      storageConfigData: {
        offlineFileSize: this.analysisPlaceholder(this.$store.getters.systemByType('offlineFileSize')),
        imgStoreNum: this.analysisPlaceholder(this.$store.getters.systemByType('imgStoreNum')),
      },
      // 底库配置
      databaseConfigData: {
        albumFilterNum: this.analysisPlaceholder(this.$store.getters.systemByType('albumFilterNum')),
        personCardSaveDays: this.analysisPlaceholder(this.$store.getters.systemByType('personCardSaveDays')),
        personCardDeployAlbum: this.analysisPlaceholder(this.$store.getters.systemByType('personCardDeployAlbum')),
      },

      // 人像底库逻辑分库
      faceAlbumConfigData: {
        multiAlbum: this.analysisPlaceholder(this.$store.getters.systemByType('multiAlbum')), // 是否开启逻辑分库
        multiAlbum_1_factor: this.analysisPlaceholder(this.$store.getters.systemByType('multiAlbum_1_factor')), // 正常库默认调分
        multiAlbum_1_threshold: this.analysisPlaceholder(this.$store.getters.systemByType('multiAlbum_1_threshold')), // 正常库检索阈值
        multiAlbum_2_factor: this.analysisPlaceholder(this.$store.getters.systemByType('multiAlbum_2_factor')), // 老人库默认调分
        multiAlbum_2_threshold: this.analysisPlaceholder(this.$store.getters.systemByType('multiAlbum_2_threshold')), // 老人库检索阈值
        multiAlbum_3_factor: this.analysisPlaceholder(this.$store.getters.systemByType('multiAlbum_3_factor')), // 小孩库默认调分
        multiAlbum_3_threshold: this.analysisPlaceholder(this.$store.getters.systemByType('multiAlbum_3_threshold')), // 小孩库检索阈值
        multiAlbum_4_factor: this.analysisPlaceholder(this.$store.getters.systemByType('multiAlbum_4_factor')), // 低质量库默认调分
        multiAlbum_4_threshold: this.analysisPlaceholder(this.$store.getters.systemByType('multiAlbum_4_threshold')), // 低质量库检索阈值
        multiAlbum_5_factor: this.analysisPlaceholder(this.$store.getters.systemByType('multiAlbum_5_factor')), // 特殊用途库默认调分
        multiAlbum_5_threshold: this.analysisPlaceholder(this.$store.getters.systemByType('multiAlbum_5_threshold')), // 特殊用途库检索阈值
      },
      // 离线文件倍速设置
      fileConfigData: {
        slicingTime: this.analysisPlaceholder(this.$store.getters.systemByType('slicingTime')),
        calibrationTime: this.analysisPlaceholder(this.$store.getters.systemByType('calibrationTime')),
      },
      // 设备配置
      deviceConfigData: {
        orgMaxExpandLevel: this.analysisPlaceholder(this.$store.getters.systemByType('orgMaxExpandLevel')), // 部门树显示层级
        noneCaptureTTL: this.analysisPlaceholder(this.$store.getters.systemByType('noneCaptureTTL')), // 无抓拍预警时长设置
        lowQualityCaptureTTL: this.analysisPlaceholder(this.$store.getters.systemByType('lowQualityCaptureTTL')), // 低质量抓拍预警
        lowQualityCapturePercent: this.analysisPlaceholder(this.$store.getters.systemByType('lowQualityCapturePercent')), // 低质量抓拍百分比
        cameraAggregationStorageScheme: this.analysisPlaceholder(this.$store.getters.systemByType('cameraAggregationStorageScheme')), // 存储设置
        /** 方案1 */
        face_full_1: this.analysisPlaceholder(this.$store.getters.systemByType('face_full_1')), // 方案1人脸全景图存储时间
        face_capture_1: this.analysisPlaceholder(this.$store.getters.systemByType('face_capture_1')), // 方案1人脸抓拍图存储时间
        face_feature_1: this.analysisPlaceholder(this.$store.getters.systemByType('face_feature_1')), // 方案1人脸特征存储时间
        face_feature_index_1: this.analysisPlaceholder(this.$store.getters.systemByType('face_feature_index_1')), // 方案1人脸特征检索时间
        body_full_1: this.analysisPlaceholder(this.$store.getters.systemByType('body_full_1')), // 方案1人体全景图存储时间
        body_capture_1: this.analysisPlaceholder(this.$store.getters.systemByType('body_capture_1')), // 方案1人体抓拍图存储时间
        body_feature_1: this.analysisPlaceholder(this.$store.getters.systemByType('body_feature_1')), // 方案1人体特征存储时间
        body_feature_index_1: this.analysisPlaceholder(this.$store.getters.systemByType('body_feature_index_1')), // 方案1人体特征检索时间
        motor_full_1: this.analysisPlaceholder(this.$store.getters.systemByType('motor_full_1')), // 方案1机动车全景图存储时间
        motor_capture_1: this.analysisPlaceholder(this.$store.getters.systemByType('motor_capture_1')), // 方案1机动车抓拍图存储时间
        motor_feature_index_1: this.analysisPlaceholder(this.$store.getters.systemByType('motor_feature_index_1')), // 方案1机动车特征检索时间
        motor_feature_1: this.analysisPlaceholder(this.$store.getters.systemByType('motor_feature_1')), // 方案1机动车特征存储时间
        non_motor_full_1: this.analysisPlaceholder(this.$store.getters.systemByType('non_motor_full_1')), // 方案1非机动车全景图存储时间
        non_motor_capture_1: this.analysisPlaceholder(this.$store.getters.systemByType('non_motor_capture_1')), // 方案1非机动车抓拍图存储时间
        non_motor_feature_index_1: this.analysisPlaceholder(this.$store.getters.systemByType('non_motor_feature_index_1')), // 方案1非机动车特征检索时间
        non_motor_feature_1: this.analysisPlaceholder(this.$store.getters.systemByType('non_motor_feature_1')), // 方案1非机动车特征存储时间

        /**
         * 方案2
         */
        face_full_2: this.analysisPlaceholder(this.$store.getters.systemByType('face_full_2')), // 方案2人脸全景图存储时间
        face_capture_2: this.analysisPlaceholder(this.$store.getters.systemByType('face_capture_2')), // 方案2人脸抓拍图存储时间
        face_feature_2: this.analysisPlaceholder(this.$store.getters.systemByType('face_feature_2')), // 方案2人脸特征存储时间
        face_feature_index_2: this.analysisPlaceholder(this.$store.getters.systemByType('face_feature_index_2')), // 方案2人脸特征检索时间
        body_full_2: this.analysisPlaceholder(this.$store.getters.systemByType('body_full_2')), // 方案2人体全景图存储时间
        body_capture_2: this.analysisPlaceholder(this.$store.getters.systemByType('body_capture_2')), // 方案2人体抓拍图存储时间
        body_feature_2: this.analysisPlaceholder(this.$store.getters.systemByType('body_feature_2')), // 方案2人体特征存储时间
        body_feature_index_2: this.analysisPlaceholder(this.$store.getters.systemByType('body_feature_index_2')), // 方案2人体特征检索时间
        motor_full_2: this.analysisPlaceholder(this.$store.getters.systemByType('motor_full_2')), // 方案2机动车全景图存储时间
        motor_capture_2: this.analysisPlaceholder(this.$store.getters.systemByType('motor_capture_2')), // 方案2机动车抓拍图存储时间
        motor_feature_index_2: this.analysisPlaceholder(this.$store.getters.systemByType('motor_feature_index_2')), // 方案2机动车特征检索时间
        motor_feature_2: this.analysisPlaceholder(this.$store.getters.systemByType('motor_feature_2')), // 方案2机动车特征存储时间
        non_motor_full_2: this.analysisPlaceholder(this.$store.getters.systemByType('non_motor_full_2')), // 方案2非机动车全景图存储时间
        non_motor_capture_2: this.analysisPlaceholder(this.$store.getters.systemByType('non_motor_capture_2')), // 方案2非机动车抓拍图存储时间
        non_motor_feature_index_2: this.analysisPlaceholder(this.$store.getters.systemByType('non_motor_feature_index_2')), // 方案2非机动车特征检索时间
        non_motor_feature_2: this.analysisPlaceholder(this.$store.getters.systemByType('non_motor_feature_2')), // 方案2非机动车特征存储时间

        cameraResShowOptions: this.analysisPlaceholder(this.$store.getters.systemByType('cameraResShowOptions')), // 相机资源列表显示设置
        activePullEnable: this.analysisPlaceholder(this.$store.getters.systemByType('activePullEnable'))

      },
      // 地图配置
      mapConfigData: {
        mapCenterLon: this.analysisPlaceholder(this.$store.getters.systemByType('mapCenterLon')),
        mapCenterLat: this.analysisPlaceholder(this.$store.getters.systemByType('mapCenterLat')),
        mapMin: this.analysisPlaceholder(this.$store.getters.systemByType('mapMin')),
        mapMax: this.analysisPlaceholder(this.$store.getters.systemByType('mapMax')),
        mapLevel: this.analysisPlaceholder(this.$store.getters.systemByType('mapLevel')),
        mapSource: this.analysisPlaceholder(this.$store.getters.systemByType('mapSource')),
        mapType: this.analysisPlaceholder(this.$store.getters.systemByType('mapType')),
        mapMergeValue: this.analysisPlaceholder(this.$store.getters.systemByType('mapMergeValue')),
        customMapSource: this.analysisPlaceholder(this.$store.getters.systemByType('customMapSource')),
        customMapType: this.analysisPlaceholder(this.$store.getters.systemByType('customMapType')),
      },
      // 版本信息
      versionInfoData: {
        systemVersion: this.analysisPlaceholder(
          this.$store.getters.systemByType('systemVersion')
        ),
        coreVersion: this.analysisPlaceholder(
          this.$store.getters.systemByType('coreVersion')
        ),
        kunlunVersion: this.analysisPlaceholder(
          this.$store.getters.systemByType('kunlun_version')
        )
      },
      qualityConfigData: {
        bodyQuality: this.analysisPlaceholder(this.$store.getters.systemByType('body_quality_threshold')),
      }

    };
  },
  computed: {
    isVideoNet() {
      return !this.dualPlatformType && this.isDual; // 是否视频网
    },
    firstScene() {
      return this.dualScene === 1 && this.isDual; // 场景1
    },
    secondScene() {
      return this.dualScene === 2 && this.isDual; // 场景2
    },
    videoNetOfOneOrTwo() {
      return this.isVideoNet && (this.firstScene || this.secondScene);// 场景一场景二视频网
    },
    videoNetOfFour() {
      return this.isVideoNet && this.dualScene === 4;// 场景四视频网
    },
    isSuperAdmin() {
      return this.$store.getters.user.userName === 'superAdmin';
    },
    enablePkConfig() {
      return this.isSuperAdmin && this.$store.getters.system.enablePKSetting.value === 'true';
    },
    saveAuth() {
      return this.$store.getters.modulePermissonsByAlias('basic-config', 'basic-config-auth');
    },
    productType() {
      return Number(this.$store.getters.systemByType('productType').value);
    },
    // logo设置
    logoConfigData() {
      const logoCode = this.productType === 0 ? 'productLogo' : 'productLogo_DL';
      return {
        productName: this.analysisPlaceholder(this.$store.getters.systemByType('productName')),
        productNameDL: this.analysisPlaceholder(this.$store.getters.systemByType('productName_DL')),
        productLogo: this.analysisPlaceholder(this.$store.getters.systemByType(logoCode)),
        showProductRight: this.analysisPlaceholder(this.$store.getters.systemByType('showProductRight')),
        showPoliceBadge: this.analysisPlaceholder(this.$store.getters.systemByType('showPoliceBadge')),
        showInnerLogo: this.analysisPlaceholder(this.$store.getters.systemByType('showInnerLogo')),
        navLogo: this.analysisPlaceholder(this.$store.getters.systemByType('kunlun_navigation_logo'))
      };
    },
  },
  created() {
    this.getSystemConfig();
    this.getAlbumList();
    this.getRulesData();
  },
  methods: {
    /*
    * 获取校验规则
    * @param {any}
    * @return
    * */
    getRulesData() {
      const {
        logoConfig,
        loginConfig,
        mapConfig
      } = BasicRules;
      this.logoConfigRules = logoConfig;
      this.loginConfigRules = loginConfig;
      this.mapConfigRules = mapConfig;
    },
    /*
    * 表单校验
    * @param {any}
    * @return
    * */
    validateConfigForm() {
      const configArray = ['loginConfig', 'mapConfig'];
      if (this.isSuperAdmin) {
        configArray.push('logoConfig');
      }
      const isValid = !configArray.some((item) => !this.$refs[item].validateForm());
      return isValid;
    },
    /*
    * 获取底库列表
    * @param {any}
    * @return
    * */
    getAlbumList() {
      BaseConfigServ.getAlbumList({
        'type': [2], // 1-静态库；2-动态库；3-白名单库,
        'srcType': [1] // 1-本地创建或双网同步；2-分发机同步，不允许一键布控
      }).then((res) => {
        if (res.code === 0) {
          this.albumList = res.data;
        } else {
          this.$message.warning(this.$t('获取动态库失败！'));
        }
      });
    },
    /*
    * 恢复默认设置
    * @param {any}
    * @return
    * */
    restoreConfig() {
      this.logoType = 0;
      const configData = {
        ...this.logoConfigData,
        ...this.loginConfigData,
        ...this.storageConfigData,
        ...this.databaseConfigData,
        ...this.faceAlbumConfigData,
        ...this.fileConfigData,
        ...this.deviceConfigData,
        ...this.mapConfigData,
        ...this.qualityConfigData
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
      if (!this.deviceFeatureValid()) {
        this.$message.error(this.$t('特征检索时间不能大于特征存储时间'));
        return;
      }
      const newConfigArr = [];
      const configData = {
        ...this.logoConfigData,
        ...this.loginConfigData,
        ...this.storageConfigData,
        ...this.databaseConfigData,
        ...this.faceAlbumConfigData,
        ...this.fileConfigData,
        ...this.deviceConfigData,
        ...this.mapConfigData,
        ...this.qualityConfigData
      };
      Object.keys(configData).forEach((key) => {
        const config = { ...configData[key] };
        if (config.code === 'personCardDeployAlbum' && Array.isArray(config.value)) {
          config.value = config.value.length > 0 ? config.value.join(',') : '';
        }
        if (config.code === 'cameraResShowOptions' && Array.isArray(config.value)) {
          config.value = config.value.length > 0 ? config.value.join(',') : '';
        }
        newConfigArr.push({
          code: config.code,
          value: config.value
        });
      });
      BaseConfigServ.updateSystemConfig(newConfigArr).then((res) => {
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

    /*
    * 特征存储时间要大于等于特征检索时间
    * @param {any}
    * @return
    * */
    deviceFeatureValid() {
      return [1, 2].every((index) => {
        const faceValid = this.deviceConfigData[`face_feature_${index}`].value >= this.deviceConfigData[`face_feature_index_${index}`].value;
        const bodyValid = this.deviceConfigData[`body_feature_${index}`].value >= this.deviceConfigData[`body_feature_index_${index}`].value;
        const nonMotorValid = this.deviceConfigData[`non_motor_feature_${index}`].value >= this.deviceConfigData[`non_motor_feature_index_${index}`].value;
        const motorValid = this.deviceConfigData[`motor_feature_${index}`].value >= this.deviceConfigData[`motor_feature_index_${index}`].value;
        return faceValid && bodyValid && nonMotorValid && motorValid;
      });
    },
    /**
     * 获取系统设置
     */
    getSystemConfig() {
      this.loading = true;
      BaseConfigServ.getSystemConfig().then((res) => {
        if (res.code === 0) {
          this.$store.dispatch('setSystem', res.data);
        }
        this.loading = false;
      });
    },
    /**
     * 通过remark解析placeholder
     */
    analysisPlaceholder(configData) {
      if (configData.code === 'productLogo') {
        configData = this.analysisProductLogo(configData);
      }
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
      if (configData.code === 'personCardDeployAlbum' && typeof configData.value === 'string') {
        configData.value = configData.value ? configData.value.split(',') : [];
      }
      if (configData.code === 'cameraResShowOptions' && typeof configData.value === 'string') {
        configData.value = configData.value ? configData.value.split(',') : [];
      }
      return configData;
    },
    /*
    * logo设置判断logoType
    * @param {configData}
    * @return
    * */
    analysisProductLogo(configData) {
      if (configData.defaultValue === configData.value) {
        configData.logoType = 0;
      } else if (configData.value === '') {
        configData.logoType = 1;
      } else {
        configData.logoType = 2;
      }
      return configData;
    },
  }
};
</script>

<style lang="scss" scoped>
.basic-config {
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
