<template>
  <div>
    <meg-dialog
      v-if="visible"
      :visible="visible"
      class="peer-dialog-box"
      width="800px"
      :show-close="true"
      @close="onDialogClose">
      <span slot="title">
        {{ type==="add" ? $t("新建任务") : type === "check" ? $t("查看任务") : $t("复制任务") }}
      </span>
      <div
        class="dialog-body-box">
        <div class="img-box">
          <common-img-analysis
            ref="peerAnalysis"
            :max-img-num="1"
            selector-mode="single"
            :font-size="'14px'"
            background="face"
            :analyze-type="[0]"
            bottom-height="20px"
            :init-file="initFile"
            @output="imgFileChange">
          </common-img-analysis>
        </div>
        <meg-form
          ref="task"
          class="peer-task-form"
          label-position="right"
          label-width="83px"
          :model="taskForm"
          :rules="taskRule">
          <meg-form-item
            :label="$t('任务名称')"
            prop="jobName">
            <meg-input
              :disabled="disiabled"
              v-model.trim="taskForm.jobName"
              :placeholder="$t('请输入{from}-{to}个汉字，字母，数字', { from: 2, to: 50 })">
            </meg-input>
          </meg-form-item>
          <meg-form-item
            class="threshold-form-item"
            :label="$t('同行次数')"
            prop="appearCount">
            {{ $t('不少于') }}
            <meg-input
              :disabled="disiabled"
              class="threshold-input"
              :placeholder="$t('输入数字')"
              v-model.number="taskForm.appearCount">
            </meg-input> {{ $t('次') }}（{{ $t('输入范围：2-100') }}）
          </meg-form-item>
          <meg-form-item
            :label="$t('同行间隔')"
            class="meg-select"
            prop="interval">
            <meg-select
              :disabled="disiabled"
              v-model="taskForm.interval">
              <meg-option
                v-for="item in intervalOptions"
                :key="item.code"
                :label="item.value"
                :value="item.code">
              </meg-option>
            </meg-select>
          </meg-form-item>
          <meg-form-item
            :label="$t('起止时间')"
            prop="startTime">
            <meg-date-picker
              :disabled="disiabled"
              format="yyyy-MM-dd HH:mm"
              v-model="dateValue"
              :prefix-icon-visible="false"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00','23:59:59']"
              :picker-options="pickerOptions">
            </meg-date-picker>
            <div
              v-show="isShowDateError"
              class="el-form-item__error">
              {{ $t('时间不能为空') }}
            </div>
          </meg-form-item>
          <meg-form-item
            class="camera-select"
            :label="$t('选择相机')">
            <div v-if="type !=='check'">
              <common-camera-select
                ref="peerCamera"
                v-if="visible"
                @update-ready="updateReady"
                @change="getCameraIds"></common-camera-select>
              <div
                v-show="isShowError"
                class="el-form-item__error">
                {{ $t('相机不能为空') }}
              </div>
              <div
                v-show="isShowLimitError"
                class="el-form-item__error">
                {{ $t('您选择的相机达到上限{count}，请缩小选择范围', {count: cameraLimitCount}) }}
              </div>
            </div>
            <div
              style="border: 1px solid #e4e7ed;"
              v-else>
              <meg-scrollbar>
                <div class="camera-select-container">
                  <div class="camera-tag-box">
                    <meg-tag
                      v-tooltip="true"
                      v-for="(camera,index) in taskForm.cameras"
                      :key="index"
                      type="info">
                      {{ camera.cameraName }}
                    </meg-tag>
                  </div>
                </div>
              </meg-scrollbar>
            </div>
          </meg-form-item>
        </meg-form>
      </div>
      <span
        slot="footer"
        class="dialog-footer">
        <meg-button @click="onDialogClose">{{ $t('取消') }}</meg-button>
        <meg-button
          type="primary"
          @click="onDialogConfirm">{{ $t('确定') }}</meg-button>
      </span>
    </meg-dialog>
    <analysis-filter
      ref="analysisFilter"
      :visible.sync="filterVisible"
      :filterloading="filterloading"
      @confirm="filterConfirm">
    </analysis-filter>
  </div>
</template>
<script>
import _ from 'lodash';
import commonCameraSelect from '@/common-components/common-camera-selector';
import commonImgAnalysis from '@/common-components/common-img-analysis';
import AnalysisFilter from '@/components/analysis-filter/analysis-filter';
import PeerSrv from '@/modules/peer/peer.service.js';
import rule from '@/modules/common/judge.rule';
import { utils } from '@/utils/utils';

const DefaultFormData = function (threshold) {
  this.threshold = threshold;
  this.photos = [];
  this.groupType = 0;
  this.startTime = '';
  this.endTime = '';
  this.cameraIds = [];
};

export default {
  components: {
    commonImgAnalysis,
    commonCameraSelect,
    AnalysisFilter
  },
  props: {
    type: {
      type: String,
      default: 'add'
    },
    visible: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default() {
        return {};
      }
    },
  },
  data() {
    return {
      isShowError: false,
      filterloading: false,
      cameraLimitCount: 1000,
      isShowLimitError: false,
      isShowDateError: false,
      taskRule: rule.peer,
      activeFormData: new DefaultFormData(this.threshold),
      filterData: {},
      filterVisible: false,
      initFile: [],
      taskForm: {},
      dateValue: [],
      pickerOptions: {
        shortcuts: [
          'today',
          'pastThreeDays',
          'pastWeek',
          'pastMonth'
        ]
      },
      delay: (() => {
        let r = () => {};
        const p = new Promise((_r) => { r = _r; });
        return { r, p };
      })(),
      cameraIds: [],
    };
  },
  computed: {
    /**
     * 查看模式下，只读
     */
    disiabled() {
      return this.type === 'check';
    },
    threshold() {
      return parseFloat(this.$store.getters.system.judgeThreshold.value);
    },
    intervalOptions() {
      return this.$store.getters.dataMap.peerIntervals;
    }
  },
  watch: {
    formData: {
      handler(newVal) {
        this.taskForm = _.cloneDeep(newVal);
        this.initFile = [];
        if (newVal.startTime) {
          this.dateValue = [new Date(newVal.startTime), new Date(newVal.endTime)];
        }
        if (newVal.cameraIds) {
          this.cameraIds = newVal.cameraIds;
        }
        if (this.$refs.task) {
          this.$refs.task.resetFields();
        }
        if (newVal.face && newVal.face.photoUrl && this.type !== 'add') {
          this.$nextTick(() => {
            utils.urlToBase64(newVal.face.photoUrl).then((base64) => {
              const data = {
                photo: base64,
                couldEdit: true,
                images: [
                  {
                    detectType: 0, // 必须 数据类型 0 人脸 1 人体 5 非机动车 6 机动车 4 画像
                    locator: {
                      landmark: newVal.face.landmark, // 非必须 数据landmark
                      rect: newVal.face.rect // 必须 数据rect
                    }
                  }
                ]
              };
              this.initFile = [data];
            });
          });
          if (newVal.face && !newVal.face.photoUrl) {
            const infos = {
              detectType: 0,
              locator: {
                rect: newVal.face.rect,
                landmark: newVal.face.landmark
              }
            };
            const temp = {
              featureInfos: [infos],
              searchPhotoUri: newVal.face.photoUrl,
              photoData: newVal.face.photoUrl
            };
            this.activeFormData.photos = [temp];
          }
        }
      },
      immediate: true,
      deep: true
    },
    visible(val) {
      if (!val) {
        this.taskForm.cameraIds = [];
        this.activeFormData.cameraIds = [];
        this.taskForm = {};
        this.isShowError = false;
        this.isShowDateError = false;
        this.isShowLimitError = false;
      }
    },
    dateValue(val) {
      if (val && val[0] && val[1]) this.isShowDateError = false;
      else this.isShowDateError = true;
    }
  },
  created() {
    this.activeFormData = new DefaultFormData(this.threshold);
    this.cameraLimitCount = this.$store.getters.systemByType('kunlun_judge_camera_limit').value;
  },
  methods: {
    /**
     * 接受相机选择组件的选择的相机Id
     * @param {ids} 相机Id数组
     */
    getCameraIds(ids) {
      this.isShowError = false;
      this.activeFormData.cameraIds = ids;
      this.isShowLimitError = false;
      if (ids.length > this.cameraLimitCount) {
        this.isShowLimitError = true;
      }
    },
    updateReady() {
      this.$refs.peerCamera.setCheckedKeys(this.cameraIds);
    },
    setInitFile(val) {
      this.initFile = val;
    },
    /**
     * 弹窗关闭
     */
    onDialogClose() {
      this.isShowError = false;
      this.initFile = [];
      this.$emit('update:visible', false);
    },
    onDialogConfirm() {
      if (!(this.dateValue && this.dateValue[0] && this.dateValue[1])) {
        this.isShowDateError = true;
        return;
      }
      this.activeFormData.startTime = this.dateValue[0].getTime();
      this.activeFormData.endTime = this.dateValue[1].getTime();
      if (this.activeFormData.cameraIds.length === 0) {
        this.isShowError = true;
        return;
      }
      if (this.taskForm.cameraIds.length > this.cameraLimitCount) {
        this.isShowLimitError = true;
        return;
      }
      if (this.type !== 'check') {
        this.$refs.task.validate((valid) => {
          if (valid) {
            this.formSearch();
          } else {
            return false;
          }
          return false;
        });
      } else {
        this.$emit('update:visible', false);
      }
    },
    /**
     * 接受图片上传组件的图片结果
     * @param {arr} 图片数组
     */
    imgFileChange(arr) {
      if (!arr.length) {
        this.activeFormData.photos = [];
        return;
      }
      const [photoInfo] = arr;
      const { images } = photoInfo;
      const infos = {
        feature: images[0] && images[0].feature,
        detectType: images[0] && images[0].detectType,
        locator: images[0] && images[0].locator,
        licensePlateText: images[0] && images[0].licensePlateText,
      };
      if (infos.detectType === undefined) {
        infos.detectType = photoInfo.detectType;
      }
      const temp = {
        featureInfos: [infos],
        searchPhotoUri: photoInfo.searchPhotoUri || photoInfo.photo,
        photoData: photoInfo.photo
      };
      this.activeFormData.photos = [temp];
    },
    /**
     * 表单确认，如果有图片的话，进入人工筛选阶段
     */
    formSearch() {
      if (this.activeFormData.photos.length) {
        this.filterVisible = true;
        this.filterloading = true;
        this.queryCapture();
      } else {
        this.$message.warning(this.$t('请先上传图片'));
      }
    },
    queryCapture() {
      const params = {
        photos: this.activeFormData.photos,
        cameraIds: this.activeFormData.cameraIds,
        startTime: this.activeFormData.startTime,
        endTime: this.activeFormData.endTime,
        faceThreshold: this.activeFormData.faceThreshold,
        aggType: 'SCORE',
        sourceType: 'CAMERA',
        withLink: false
      };
      PeerSrv.searchByPhotos(params).then((res) => {
        if (res.code === 0) {
          this.filterloading = false;
          this.$refs.analysisFilter.initData(res.data.records);
        }
      });
    },
    /**
     * 人工筛选的确认回调函数
     */
    filterConfirm(arr) {
      if (!arr.length) {
        this.$emit('update:visible', false);
        return;
      }
      const { startTime, endTime } = this.activeFormData;
      const peerData = {
        ...this.taskForm,
        startTime,
        endTime
      };
      const [photos] = this.activeFormData.photos;
      peerData.face = {
        photoData: photos.photoData,
        ...photos.featureInfos[0].locator
      };
      const flatData = arr.reduce((arc, item) => [...arc, ...item.listResults], []);
      const temp = flatData.map((item) => ({
        captureTime: item.capturedTime,
        cameraId: item.cameraId,
        captureId: item.id,
        videoId: item.videoId,
        sourceType: item.sourceType
      }));
      peerData.appearRecords = temp;
      peerData.cameraIds = this.activeFormData.cameraIds;
      this.$emit('taskConfirm', peerData);
      this.$emit('update:visible', false);
    },
  }
};
</script>
<style lang="scss" scoped>
.camera-select {
  ::v-deep .map-icon-box{
    top: -25px!important;
  }
}
.meg-select {
  width: 100%;
}
::v-deep .meg-dialog__header{
  line-height: 54px;
  font-weight: 700;
  font-size: 16px;
  color: #435068;
}
.meg-dialog__header{
  line-height: 54px;
}
.peer-task-form{
    width: 353px;
    margin: 20px 0 0 25px;
  .photo-form-item{
    margin: 0px 34px 24px;
    height: 138px;
    div.el-form-item__content{
      height: 100%;
      line-height: 14px;
    }
  }
  .threshold-form-item{
    .el-form-item__content{
      font-size: 12px;
      color: #999;
    }

    .threshold-input{
      width: 86px;
      margin:0 6px;
      .el-input__inner{
        padding: 0;
        text-align: center;
      }
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
  .camera-select-container{
    min-height: 32px;
    position: relative;
    padding: 5px 30px 0px 5px;
    max-height: 180px;
    box-sizing: border-box;
    .camera-tag-box{
      line-height: 16px;
      .el-tag{
        max-width: 100%;
        position: relative;
        padding: 0 30px 0 10px;
      }
    }
  }
  .el-form-item__error {
    color: #f56c6c;
    font-size: 12px;
    line-height: 1;
    padding-top: 4px;
  }
  .camera-mask{
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 9999;
    background-color:rgba(246, 247, 250,0.7);
  }
}
  .dialog-body-box{
    display: flex;
    padding: 30px;
    .img-box{
      width: 272px;
      height: 272px;
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
.camera-select-menu{
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
.box-mask{
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(246, 247, 250, 0.6);
  z-index: 9999;
}

</style>
<style lang="scss">
.i18n-en-US{
  .peer-dialog-box{
    .el-dialog {
      width: 920px!important;
    }
    .peer-task-form{
      width: 570px!important;
    }
    .el-form-item__label {
      width: 185px!important;
     }
    .el-form-item__content {
      margin-left: 185px!important;
    }
  }
}
</style>
