<template>
  <meg-form
    ref="addForm"
    :label-width="'110px'"
    class="search-form left-form-content add-file-task">
    <meg-form-item
      required
      :label="$t('任务名称')">
      <meg-input
        v-model="creatTaskForm.taskName"
        style="width:270px"
        :placeholder="$t('请输入任务名称')"></meg-input>
    </meg-form-item>
    <meg-form-item
      required
      :label="$t('解析类型')"
      prop="analysisType"
      class="analysis-types">
      <analysis-type
        :analysis-type-arr="analysisTypeArr"
        v-model="analysisType"></analysis-type>
    </meg-form-item>
    <meg-form-item
      required
      :label="$t('解析倍速')">
      <div>
        <meg-input
          style="width:100px"
          v-model="creatTaskForm.speed"></meg-input>
        <span class="calc-text">{{ `${$t('预估剩余算力')}/${$t('总算力')}:${monitorInfo.remainVideoPower || 0}/${monitorInfo.totalVideoPower || 0}` }}</span>
      </div>
    </meg-form-item>
    <meg-form-item
      label="优先级">
      <meg-radio-group v-model="creatTaskForm.priority">
        <meg-radio :label="1">
          {{ $t('一般任务') }}
        </meg-radio>
        <meg-radio :label="0">
          {{ $t('紧急任务') }}
        </meg-radio>
      </meg-radio-group>
    </meg-form-item>
    <meg-form-item
      :label="$t('自动比对')">
      <div>
        <meg-switch
          v-model="creatTaskForm.autoCompare"></meg-switch>
        <span class="calc-text">{{ $t('分析结果与底库进行比对，并产生报警') }}</span>
      </div>
    </meg-form-item>
    <meg-form-item
      v-if="creatTaskForm.autoCompare && analysisTypes.doFace"
      :label="$t('比对目标')">
      <meg-radio-group v-model="creatTaskForm.doPackage">
        <meg-radio :label="false">
          {{ $t('布控库') }}
        </meg-radio>
        <meg-radio :label="true">
          {{ $t('图片文件') }}
        </meg-radio>
      </meg-radio-group>
    </meg-form-item>
    <template v-if="creatTaskForm.autoCompare && creatTaskForm.doPackage">
      <meg-form-item :label="$t('文件')">
        <div
          class="gather-file-upload">
          <meg-upload
            v-loading="isUploadingFile"
            :class="[
              'package-upload',
              packageUpload.isUploading? 'uploading' : '',
              $refs.packageUpload && $refs.packageUpload.uploadFiles.length ? 'has-filelist' : ''
            ]"
            drag
            ref="packageUpload"
            :name="packageUpload.fileParamName"
            :auto-upload="false"
            :multiple="false"
            :headers="packageUpload.headers"
            action="uploadUrl"
            :accept="packageUpload.acceptType"
            :on-change="onPackageUploadChange"
            :on-exceed="onExceed"
            :on-remove="onRemove">
            <meg-icon
              :name="packUploadIcon"
              class="upload-icon"></meg-icon>
            <div
              class="el-upload__text">
              <p>{{ uploadText }}</p>
              <p>{{ uploadTip }}</p>
            </div>
            <!-- <div
              class="file-delete"
              v-if="packageUpload.packageFileName">
              <meg-icon name="file"></meg-icon>
              <span
                class="file-name"
                v-tooltip="true">{{ uploadText }}</span>
              <meg-icon
                v-if="!isUploadingFile"
                @click.stop="resetPackageUpload"
                name="delete_1"></meg-icon>
            </div> -->
          </meg-upload>
        </div>
      </meg-form-item>
      <meg-form-item :label="$t('比对阈值')">
        <meg-input-number
          class="compare-threshold"
          v-model="threshold"
          :controls="false"
          :min="0"
          :max="100"
          :precision="2"></meg-input-number>
      </meg-form-item>
    </template>
    <template v-if="creatTaskForm.autoCompare && !creatTaskForm.doPackage">
      <meg-form-item
        class="compre-sets"
        v-show="analysisTypes.doFace"
        :label="$t('人像库')"
        prop="compareFaceSets">
        <analysis-album-select
          ref="compareFaceSets"
          :default-threshold="faceThreshold"
          :placeholder="$t('请选择人像库')"
          :album-data="faceSets"
          :album-type="1"
          :init-data="initData.compareFaceSets"
          @check-change="checkChange(...arguments, 'compareFaceSets')"></analysis-album-select>
      </meg-form-item>
      <meg-form-item
        class="compre-sets"
        v-show="analysisTypes.doBody"
        :label="$t('人体库')"
        prop="compareBodySets">
        <analysis-album-select
          :default-threshold="bodyThreshold"
          ref="compareBodySets"
          :placeholder="$t('请选择人体库')"
          :album-data="bodySets"
          :album-type="2"
          :init-data="initData.compareBodySets"
          @check-change="checkChange(...arguments, 'compareBodySets')"></analysis-album-select>
      </meg-form-item>
      <meg-form-item
        class="compre-sets"
        v-show="analysisTypes.doMotor"
        :label="$t('机动车库')"
        prop="compareMotorSets">
        <analysis-album-select
          ref="compareMotorSets"
          :placeholder="$t('请选择机动车库')"
          :default-threshold="motorThreshold"
          :album-data="motorSets"
          :album-type="3"
          :init-data="initData.compareMotorSets"
          @check-change="checkChange(...arguments, 'compareMotorSets')"></analysis-album-select>
      </meg-form-item>
      <meg-form-item
        class="compre-sets"
        v-show="analysisTypes.doNonMotor"
        :label="$t('非机动车库')"
        prop="compareNonMotorSets">
        <analysis-album-select
          ref="compareNonMotorSets"
          :placeholder="$t('请选择非机动车库')"
          :default-threshold="nonMotorThreshold"
          :album-data="nonMotorSets"
          :album-type="4"
          :init-data="initData.compareNonMotorSets"
          @check-change="checkChange(...arguments, 'compareNonMotorSets')"></analysis-album-select>
      </meg-form-item>
      <meg-form-item
        class="compre-sets"
        v-show="analysisTypes.doMotor"
        :label="$t('机动车车牌库')"
        prop="compareMotorLicenseSets">
        <analysis-album-select
          is-license
          ref="compareMotorLicenseSets"
          :placeholder="$t('请选择机动车车牌库')"
          :default-threshold="otherFaceThreshold"
          :album-data="motorLicenseSets.motor"
          :album-type="5"
          :init-data="initData.compareMotorLicenseSets"
          @check-change="checkChange(...arguments, 'compareMotorLicenseSets')"></analysis-album-select>
      </meg-form-item>
      <meg-form-item
        class="compre-sets"
        v-show="analysisTypes.doNonMotor"
        :label="$t('非机动车车牌库')"
        prop="compareNonMotorLicenseSets">
        <analysis-album-select
          is-license
          ref="compareNonMotorLicenseSets"
          :placeholder="$t('请选择非机动车车牌库')"
          :default-threshold="otherFaceThreshold"
          :album-data="motorLicenseSets.nonMotor"
          :album-type="6"
          :init-data="initData.compareNonMotorLicenseSets"
          @check-change="checkChange(...arguments, 'compareNonMotorLicenseSets')"></analysis-album-select>
      </meg-form-item>
    </template>
  </meg-form>
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import analysisType from '@/components/analysis/analysis-type';
import analysisAlbumSelect from '@/components/analysis/analysis-album-select';
import commonMapList from '@/utils/data-map.utils';

function pickArray(arr = []) {
  if (!arr.length) {
    return [];
  }
  const keys = ['id', 'albumType', 'threshold'];
  return arr.map((item) => _.pick(item, keys));
}

export default {
  components: {
    analysisType,
    analysisAlbumSelect
  },
  props: {
    // 资源占用情况
    monitorInfo: {
      type: Object,
      default: () => {}
    },
    // 底库数据
    albums: {
      type: Object,
      default: () => ({})
    },
    formType: {
      type: String,
      default: 'add'
    },
    initData: {
      type: Object,
      default: () => ({})
    },
    isUploadingFile: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const { currentModule } = this.$store.state;
    const id = Math.random().toString(16).slice(2, 7);
    const defaultName = `${currentModule.alias}-${moment().format('YYYYMMDD')}-${id}`;
    return {
      fileList: [],
      analysisTypeArr: commonMapList.analysisTypeArr[5].slice(0, -2),
      analysisType: 0, // 解析类型
      creatTaskForm: {
        taskName: defaultName,
        speed: 0,
        priority: 1,
        autoCompare: false,
        doPackage: false,
        alarmType: 0
      },
      threshold: this.$store.getters.systemByType('kunlun_alarm_deployment_recommend_threshold').value, // 比对阈值
      packageUpload: {
        fileParamName: 'packageFile',
        packageFileName: '',
        isUploading: false,
        acceptType: '.rar,.zip,.rar5',
        headers: {
          'Authorization': `${window.localStorage.getItem('token')}`
        },
        progress: 0
      },
      uploadText: this.$t('点击或拖拽上传图片压缩包'),
      uploadTip: this.$t('推荐图片数量小于2000张')
    };
  },
  computed: {
    // 人像识别布控阈值
    faceThreshold() {
      return parseFloat(this.$store.getters.systemByType('kunlun_alarm_deployment_recommend_threshold').value);
    },
    // 人体识别布控阈值
    bodyThreshold() {
      return parseFloat(this.$store.getters.systemByType('kunlun_body_identify_threshold').value);
    },
    // 机动车识别布控阈值
    motorThreshold() {
      return parseFloat(this.$store.getters.systemByType('kunlun_motor_identify_threshold').value);
    },
    // 非机动车识别布控阈值
    nonMotorThreshold() {
      return parseFloat(this.$store.getters.systemByType('kunlun_non_motor_identify_threshold').value);
    },
    otherFaceThreshold() {
      return parseFloat(this.$store.getters.systemByType('galaxy_capture_other_search_threshold').value);
    },
    packUploadIcon() {
      if (this.packageUpload.isUploading) {
        return 'package_database';
      }
      return 'resouece';
    },
    analysisTypes() {
      let analysisTypes = {};
      this.analysisTypeArr.forEach((item) => {
        if (item.id === this.analysisType) {
          analysisTypes = item.val;
        }
      });
      return analysisTypes;
    },
    chosedAlbums() {
      let datas = [];
      const {
        compareFaceSets,
        compareBodySets,
        compareMotorSets,
        compareNonMotorSets,
        compareNonMotorLicenseSets,
        compareMotorLicenseSets
      } = this.$refs;
      if (compareFaceSets) {
        datas = [...datas, ...pickArray(compareFaceSets.chosedAlbums)];
      }
      if (compareBodySets) {
        datas = [...datas, ...pickArray(compareBodySets.chosedAlbums)];
      }
      if (compareMotorSets) {
        datas = [...datas, ...pickArray(compareMotorSets.chosedAlbums)];
      }
      if (compareNonMotorSets) {
        datas = [...datas, ...pickArray(compareNonMotorSets.chosedAlbums)];
      }
      if (compareNonMotorLicenseSets) {
        datas = [...datas, ...pickArray(compareNonMotorLicenseSets.chosedAlbums)];
      }
      if (compareMotorLicenseSets) {
        datas = [...datas, ...pickArray(compareMotorLicenseSets.chosedAlbums)];
      }
      return datas;
    },
    /**
     * 人像库
     */
    faceSets() {
      return this.albums[1];
    },
    /**
     * 人体库
     */
    bodySets() {
      return this.albums[2];
    },
    /**
     * 机动车库
     */
    motorSets() {
      return this.albums[3];
    },
    /**
     * 非机动车库
     */
    nonMotorSets() {
      return this.albums[5];
    },
    /**
     * 机动车车牌库
     * carType 1机动车、2非机动车
     */
    motorLicenseSets() {
      const licenseSets = this.albums[4];
      const motor = [];
      const nonMotor = [];
      if (licenseSets && licenseSets.length) {
        licenseSets.forEach((item) => {
          if (item.carType === '1') {
            motor.push(item);
          } else {
            nonMotor.push(item);
          }
        });
      }
      return {
        motor,
        nonMotor
      };
    },
    taskFormData() {
      const albums = this.creatTaskForm.doPackage ? [{ threshold: this.threshold }] : this.chosedAlbums;
      return {
        ...this.creatTaskForm,
        ...this.analysisTypes,
        albums
      };
    }
  },
  watch: {
    monitorInfo(val) {
      const { remainVideoPower = 0 } = val;
      if (remainVideoPower > 0) {
        this.creatTaskForm.speed = Math.ceil(remainVideoPower / 2);
      }
    },
    analysisType: {
      immediate: true,
      handler(val) {
        if ([1, 4].includes(val) && this.creatTaskForm.autoCompare) {
          this.creatTaskForm.doPackage = false;
        }
      }
    },
    initData: {
      immediate: true,
      handler(data) {
        console.log('data', data);
        if (this.formType === 'copy' && data) {
          const {
            doBody,
            doFace,
            doMotor,
            doNonMotor
          } = data;
          const analysisTypeTemp = {
            doFace,
            doBody,
            doMotor,
            doNonMotor
          };
          data.autoCompare = Boolean(data.autoCompare);
          data.doPackage = Boolean(data.doPackage);
          this.creatTaskForm = data;
          let id = 0;
          this.analysisTypeArr.forEach((item) => {
            if (item.val) {
              const match = Object.keys(item.val).every((key) => item.val[key] === analysisTypeTemp[key]);
              if (match) {
                id = item.id;
              }
            }
          });
          this.analysisType = id;
        }
      }
    }
  },
  methods: {
    onRemove() {
      this.resetPackageUpload();
    },
    onExceed() {
      // this.fileList = [files[0]];
      // this.uploadText = files[0].name;
    },
    /**
     * 选择文件
     * @param {file}
     * @return
     *
     */
    onPackageUploadChange(file) {
      console.log('file', file);
      console.log(this.$refs.packageUpload.uploadFiles);
      if (file.status === 'ready') {
        const isLt500M = !(file.size > 500 * 1024 * 1024);
        if (!isLt500M) {
          this.$message.error({
            message: this.$t('上传压缩包超过 500MB!'),
            showClose: true
          });
        } else {
          this.$refs.packageUpload.uploadFiles = [file];
          this.packageUpload.packageFileName = file.name;
          if (file.size > 0) {
            this.uploadText = file.name;
            this.uploadTip = '';
            this.packageUpload.isUploading = true;
            this.$emit('upload-file', file);
          }
        }
      }
    },
    /*
    * 重置上传组件
    * @param {any}
    * @return
    * */
    resetPackageUpload() {
      this.uploadText = this.$t('点击或拖拽上传图片压缩包');
      this.uploadTip = this.$t('推荐图片数量小于2000张');
      this.packageUpload.resetPackageUpload = '';
      this.packageUpload.packageFileName = '';
      this.packageUpload.isUploading = false;
      this.$refs.packageUpload.clearFiles();
      this.$emit('upload-file', '');
    },
    /**
     * @description 解析倍速值校验
     */
    checkValue(speed) {
      const { monitorInfo } = this;
      if (!/^\d+$/.test(speed)) {
        return false;
      }
      if (speed > monitorInfo.totalVideoPower || speed < 0) {
        return false;
      }
      return true;
    },
  },
};
</script>
<style lang="scss" scoped>
.left-form-content {
  width: 415px;
  padding-top: 20px;
  padding-right: 20px;
  padding-left: 10px;
  overflow: hidden;
  overflow-y: auto;
  box-sizing: border-box;
  .meg-input__inner {
    width: 345px;
  }
  .analysis-types{
    margin-left: 35px;
  }
}
.search-form {
  &.horizontal {
    .form-left {
      display: inline-block;
      margin-right: 40px;
      width: 515px;
      vertical-align: top;
    }
    .form-right {
      display: inline-block;
      width: 365px;
    }
  }
  v::deep .meg-form-item__label{
    padding-right: 30px;
  }
  v::deep .meg-checkbox-button .meg-checkbox-button__inner {
    padding: 10px 0;
    width: 39px;
  }
  v::deep .meg-col-6{
    width: 120px;
  }
  v::deep .meg-col-6{
    width: 120px;
  }
  v::deep .meg-col-2{
    width: 34px;
  }
  .calc-text {
    opacity: 0.5;
    font-size: 12px;
    color: #435068;
    margin-left: 10px;
  }
  v::deep .meg-form-item__label{
    padding-right: 20px;
  }
  v::deep .meg-checkbox-button .meg-checkbox-button__inner {
    padding: 10px 0;
    width: 39px;
  }
  v::deep .compre-sets.meg-form-item.is-error .meg-input-number .meg-input__inner{
    border-color: #bec2ca;
  }
  v::deep .compre-sets.meg-form-item.is-error .meg-treeselect{
    border-color: #f05353;
  }
  v::deep .meg-input-number{
    width: 100%;
  }
  .speed-info{
    margin-left: 11px
  }
  .form-item-inner{
    .analysis-speed{
      width: 270px;
    }
    .analysis-type-item{
      border-bottom: 1px solid #f3f3f3;
      padding: 14px 20px;
      line-height: 1;
      .title{
        position: relative;
        margin-bottom: 8px;
        .type-wrap{
          position: absolute;
          right: 0;
          top: 0;
        }
        .type{
          display: inline-block;
          opacity: 0.5;
        }
        .type-icon{
          width: 24px;
        }
      }
      .msg{
        margin-left: 28px;
        color: #999;
        font-size: 12px;
      }
    }
    .analysis-type-item:nth-child(2n-1) {
      background: #f9f9f9;
    }
  }
}
</style>
<style lang="scss">
.analysis-types {
  .meg-form-item__label {
    float: none;
  }
  .meg-form-item__content {
    margin-left: 0!important;
  }
}
.add-file-task{
  .compare-threshold{

  }
  .gather-file-upload {
    .meg-upload {
      vertical-align: top;
    }
    .meg-loading-mask {
      top: 1px;
      right: 0;
      bottom: 1px;
      left: 1px;
    }
    .file-delete{
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      background-color: #E6F2FF;
      align-items: center;
      height: 28px;
      padding: 0 8px;
      .file-name{
        flex: 1;
        text-align: left;
        padding: 0 8px;
      }
    }
    .package-upload {
      position: relative;
      .package-file-name {
        font-size: 12px;
        color: #606266;
      }
      .package-upload-progress {
        position: absolute;
        bottom: 0px;
        width: 100%;
        .el-progress__text {
          position: absolute;
          margin: 0;
          padding-left: 3px;
          bottom: 13px;
          left: 115px;
        }
        .el-progress-bar {
          margin: 0;
          padding: 0;
          position: absolute;
          bottom: 0px;
          width: 100%;
          left: 0px;
          .el-progress-bar__outer {
            border-radius: 0;
            background-color: #d2d6de;
          }
          .el-progress-bar__inner {
            border-radius: 0;
          }
        }
      }
    }
    .has-filelist {
      .meg-loading-mask {
        bottom: 36px;
      }
    }
    .upload-icon {
      color: #dcdde0;
      width: 42px;
      height: 48px;
      margin-top: 28px;
    }
    .meg-upload-dragger {
      width: 268px;
      height: 148px;
      border: 1px solid #d2d6de;
      background-color: #f7f8f9;
      border-radius: 0px;
    }
    .meg-icon-upload {
      margin: 9px 0 16px;
      line-height: 43px;
      font-size: 40px;
    }
    .el-upload__text {
      color: #919ba6;
      font-size: 12px;
      margin-top: 18px;
      line-height: initial;
    }
  }
}
</style>
