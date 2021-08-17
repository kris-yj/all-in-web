<template>
  <meg-dialog
    :title="$t('一键比对')"
    :visible="true"
    width="1250px"
    :append-to-body="appendToBody"
    :modal-append-to-body="appendToBody"
    top="15vh"
    custom-class="compareImgDialog"
    @close="compareImageDataDialogClose">
    <div
      class="compare-img-dialog-body">
      <div
        class="compareContainer"
        v-loading="loading"
        :element-loading-text="$t('拼命比对中')">
        <div class="compareImgContainer">
          <h3>{{ $t('比对图') }}</h3>
          <div class="compareImgContainer-content">
            <div class="compareImgContainer-content1">
              <div class="imgContainer">
                <meg-double-card
                  class="card-item"
                  :left-img-src="compareData.faceOnlyUrl"
                  :right-img-src="compareData.compareAlbumPhotoUrl">
                </meg-double-card>
              </div>
              <div class="imgInfoContainer">
                <div class="imgInfoContainerItem">
                  <div class="checkbox-container">
                    <meg-checkbox v-model="faceOnlyUrlChecked">
                      {{ $t('抓拍图') }}
                    </meg-checkbox>
                  </div>
                </div>
                <div class="imgInfoContainerItem">
                  <div class="checkbox-container">
                    <meg-checkbox v-model="albumPhotoUrlChecked">
                      {{ $t('底库图') }}
                    </meg-checkbox>
                  </div>
                  <p v-tooltip="true">
                    {{ compareData.albumPhotoName }}
                  </p>
                  <p v-tooltip="true">
                    {{ compareData.cardNo }}
                  </p>
                </div>
              </div>
            </div>
            <div class="compareImgContainer-content2">
              <div class="compareImgContainer-content2-top">
                <div class="compareImgContainer-content2-left">
                  <div class="imgContainer">
                    <img
                      :src="allPeoplePhotoUrl"
                      alt="" />
                  </div>
                </div>
                <div class="numberContainer">
                  <meg-input
                    :placeholder="$t('请输入身份证进行查询')"
                    suffix-icon="meg-icon-search"
                    v-model="searchNo">
                  </meg-input>
                </div>
              </div>

              <div class="checkbox-container">
                <meg-checkbox v-model="allPeoplePhotoUrlChecked">
                  {{ $t('全国常住人口照片') }}
                </meg-checkbox>
              </div>
            </div>
            <div class="compareImgContainer-content3">
              <div class="compareImgContainer-content3-top">
                <meg-img-select
                  :limit="1"
                  tip="上传人像"
                  :multiple="false"
                  file-type="base64"
                  ref="initFile1"
                  @file-changed="getImgData1"
                  @remove="delFile1"></meg-img-select>
                <meg-img-select
                  :limit="1"
                  tip="上传人像"
                  :multiple="false"
                  file-type="base64"
                  ref="initFile2"
                  @file-changed="getImgData2"
                  @remove="delFile2"></meg-img-select>
                <meg-img-select
                  :limit="1"
                  tip="上传人像"
                  :multiple="false"
                  file-type="base64"
                  ref="initFile3"
                  @file-changed="getImgData3"
                  @remove="delFile3"></meg-img-select>
              </div>
              <div class="checkbox-container">
                <meg-checkbox v-model="uploadImgChecked">
                  {{ $t('上传图片') }}
                </meg-checkbox>
                <span class="uploadNum">{{ $t('已上传') }}{{ upLoadImgNum }}/3{{ $t('张') }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="resultImgContainer">
          <h3>{{ $t('比对结果') }}</h3>
          <div class="resultImgContainer-content">
            <div
              class="card-box"
              v-for="(item,index) in compareResultDataList"
              :key="index">
              <meg-double-card
                class="card-item"
                :score="item.score"
                :left-img-src="item.firstImg.url"
                :right-img-src="item.secondImg.url">
                <div
                  class="item-bottom-one-compare"
                  slot="bottom">
                  <div class="left-bottom">
                    <p class="card-line">
                      {{ item.firstImg.name }}
                    </p>
                  </div>
                  <div class="right-bottom">
                    <p class="card-line">
                      {{ item.secondImg.name }}
                    </p>
                  </div>
                </div>
              </meg-double-card>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      slot="footer"
      class="dialog-footer">
      <meg-button
        type="primary"
        :disabled="!enableCompare"
        @click="compareImageData">
        {{ $t('立即比对') }}
      </meg-button>
      <meg-button @click="compareImageDataDialogClose">
        {{ $t('关闭') }}
      </meg-button>
    </div>
  </meg-dialog>
</template>
<script>
import _ from 'lodash';
import { utils } from '@/utils/utils';
import noPhotoImage from '../image/no-photo-image';
import OneKeyCompareSrv from '../alarm-detail.service';

export default {
  name: 'ByOneKeyCompare',
  props: {
    compareData: {
      type: Object,
      default: () => {}
    },
    appendToBody: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      // 是否能进行一键比对
      enableCompare: true,
      loading: false,
      faceOnlyUrlChecked: true,
      albumPhotoUrlChecked: false,
      allPeoplePhotoUrlChecked: false,
      uploadImgChecked: false,
      allPeoplePhotoUrl: noPhotoImage,
      upLoad1ImageData: '',
      upLoad2ImageData: '',
      upLoad3ImageData: '',
      uploadLandmark1: null,
      uploadLandmark2: null,
      uploadLandmark3: null,
      searchNo: '',
      multiVerifyParams: {
        'rangeImages': [],
        'targetImage': {}
      },
      compareImgObj: {},
      compareResultDataList: [], // 人脸检测请求参数
      faceAnalyzeParams: {
        'photoData:': '',
        // 图像使用场景， 枚举类型，CAPTURE（抓拍）, MONITOR （布控入库）, STATIC （静态入库）
        'scenario': 'CAPTURE'
      },
    };
  },
  computed: {
    upLoadImgNum() {
      return (this.upLoad1ImageData ? 1 : 0) + (this.upLoad2ImageData ? 1 : 0) + (this.upLoad3ImageData ? 1 : 0);
    }
  },
  created() {
    if (this.compareData.compareAlbumPhotoUrl && this.compareData.compareAlbumPhotoUrl !== noPhotoImage) {
      this.albumPhotoUrlChecked = true;
    }
  },
  methods: {
    // 清理数据
    clearCompareImageData() {
      this.compareResultDataList = [];
      this.multiVerifyParams.rangeImages = [];
      delete this.compareImgObj.allPeoplePhoto;
      delete this.compareImgObj.faceOnly;
      delete this.compareImgObj.albumPhoto;
      delete this.compareImgObj.upLoadImage1;
      delete this.compareImgObj.upLoadImage2;
      delete this.compareImgObj.upLoadImage3;
    },
    // 点击一键比对按钮后的处理程序
    compareImageData() {
      this.clearCompareImageData();
      if (!this.faceOnlyUrlChecked && !this.albumPhotoUrlChecked && !this.allPeoplePhotoUrlChecked && !this.uploadImgChecked) {
        this.$message.error(this.$t('请选择比对照片'));
        return;
      }
      const vm = this;
      // 如果选择抓拍图,且抓拍图不为空
      if (this.faceOnlyUrlChecked) {
        if (this.compareData.faceOnlyUrl !== '') {
          this.compareImgObj.faceOnly = {
            name: this.$t('抓拍图'),
            photoTag: 'faceOnly',
            url: this.compareData.faceOnlyUrl
          };
        } else {
          this.$message.error(this.$t('没有抓拍图'));
          return;
        }
      } else {
        delete this.compareData.faceOnly;
      }
      // 如果选择底库图,且底库图不为空
      if (this.albumPhotoUrlChecked) {
        if (this.compareData.compareAlbumPhotoUrl !== noPhotoImage) {
          this.compareImgObj.albumPhoto = {
            name: this.$t('底库图'),
            photoTag: 'albumPhoto',
            url: this.compareData.compareAlbumPhotoUrl
          };
        } else {
          this.$message.error(this.$t('没有底库图'));
          return;
        }
      } else {
        delete this.compareData.albumPhoto;
      }
      // 如果选择全国人口常住照片,且人口常住照片不为空
      if (this.allPeoplePhotoUrlChecked) {
        if (this.allPeoplePhotoUrl !== noPhotoImage) {
          this.compareImgObj.allPeoplePhoto = {
            name: this.$t('常住人口'),
            photoTag: 'allPeoplePhoto',
            url: this.allPeoplePhotoUrl
          };
        } else {
          this.$message.error(this.$t('没有全国人口常住照片'));
          return;
        }
      } else {
        delete this.compareData.allPeoplePhoto;
      }
      // 如果选择上传图片,且上传图片不为空
      if (this.uploadImgChecked) {
        if (this.upLoadImgNum < 1) {
          this.$message.error(this.$t('请上传图片'));
          return;
        }
        // 如果上传了第一张图片
        if (this.upLoad1ImageData) {
          this.compareImgObj.upLoadImage1 = {
            name: this.$t('上传图片'),
            photoTag: 'upLoadImage1',
            url: this.upLoad1ImageData,
            landmark: this.uploadLandmark1
          };
        }

        // 如果上传了第二张图片
        if (this.upLoad2ImageData) {
          this.compareImgObj.upLoadImage2 = {
            name: this.$t('上传图片'),
            photoTag: 'upLoadImage2',
            url: this.upLoad2ImageData,
            landmark: this.uploadLandmark2
          };
        }
        // 如果上传了第三张图片
        if (this.upLoad3ImageData) {
          this.compareImgObj.upLoadImage3 = {
            name: this.$t('上传图片'),
            photoTag: 'upLoadImage3',
            url: this.upLoad3ImageData,
            landmark: this.uploadLandmark3
          };
        }
      } else {
        delete this.compareData.upLoadImage1;
        delete this.compareData.upLoadImage2;
        delete this.compareData.upLoadImage3;
      }
      const imgObjKeys = Object.keys(this.compareImgObj);
      if (imgObjKeys.length < 2) {
        this.$message.error(this.$t('比对图片不得少于两张'));
        return;
      }
      const PromiseArray = [];
      imgObjKeys.forEach((item) => {
        PromiseArray.push(vm.urlToBase64Promise(vm.compareImgObj[item]));
      });
      Promise.all(PromiseArray).then((resultList) => {
        vm.multiVerifyParams.rangeImages = resultList;
        vm.multiVerify();
      });
    },
    // 多人脸识别
    faceAnalyze(imgData, upLoadImageArray, initFile, uploadLandmark) {
      const vm = this;
      this.enableCompare = false;
      vm[upLoadImageArray] = '';
      vm.faceAnalyzeParams.photoData = imgData;
      OneKeyCompareSrv.faceAnalyze(vm.faceAnalyzeParams).then((result) => {
        vm.enableCompare = true;
        if (result.code !== 0) {
          vm.$message.error(result.msg);
          this.$refs[initFile].removeImage();
        } else {
          const { data } = result;
          const { faceCount, faceList } = data;
          // 先判断是否黑白照片
          if (data.black) {
            vm.$message.error(this.$t('黑白照片'));
            this.$refs[initFile].removeImage();
          } else if (faceCount === 0) { // 如果是无人脸
            // 是否无人脸
            vm.$message.error(this.$t('无人脸'));
            this.$refs[initFile].removeImage();
          } else if (faceCount > 1) {
            // 是否是多人脸
            vm.$message.error(this.$t('多人脸'));
            this.$refs[initFile].removeImage();
          } else {
            // 识别出有人脸的前提下，再检测检测出的人脸质量高低
            const highQuality = _.filter(faceList, (face) => face.qualityPass);
            const landmark = _.filter(faceList, (face) => face.landmark);
            // 如果检测出的人脸都是低质量
            if (highQuality.length === 1) {
              vm[upLoadImageArray] = imgData;
              if (landmark[0].landmark) { vm[uploadLandmark] = landmark[0].landmark; }
            } else {
              vm.$message.error(this.$t('检测出的人脸是低质量'));
              this.$refs[initFile].removeImage();
            }
          }
        }
      });
      // });
    },
    // 一键比对接口
    multiVerify() {
      this.loading = true;
      const vm = this;
      OneKeyCompareSrv.multiVerify(this.multiVerifyParams).then((response) => {
        vm.loading = false;
        if (response.code === 0) {
          vm.compareResultDataList = response.data.verifyPairList.map((item) => ({
            firstImg: {
              name: vm.compareImgObj[item.photoTag1].name,
              url: vm.compareImgObj[item.photoTag1].url
            },
            secondImg: {
              name: vm.compareImgObj[item.photoTag2].name,
              url: vm.compareImgObj[item.photoTag2].url
            },
            score: item.score
          }));
        }
      });
    },
    // 图片转化base64的Promise
    urlToBase64Promise(imgObj) {
      return new Promise((resolve, reject) => {
        utils.urlToBase64(imgObj.url).then((res) => {
          if (res === '') {
            reject('err'); // eslint-disable-line
          } else {
            resolve({
              'photoDataAndFormat': res,
              'photoTag': imgObj.photoTag,
              'landmark': imgObj.landmark
            });
          }
        });
      });
    },
    delFile1() {
      this.upLoad1ImageData = '';
    },
    delFile2() {
      this.upLoad2ImageData = '';
    },
    delFile3() {
      this.upLoad3ImageData = '';
    },
    compareImageDataDialogClose() {
      this.clearCompareImageData();
      this.faceOnlyUrlChecked = true;
      this.albumPhotoUrlChecked = true;
      this.allPeoplePhotoUrlChecked = false;
      this.uploadImgChecked = false;
      this.upLoad1ImageData = '';
      this.upLoad2ImageData = '';
      this.upLoad3ImageData = '';
      this.$emit('close');
    },
    getImgData1(data) {
      this.faceAnalyze(data[0], 'upLoad1ImageData', 'initFile1', 'uploadLandmark1');
    },
    getImgData2(data) {
      this.faceAnalyze(data[0], 'upLoad2ImageData', 'initFile2', 'uploadLandmark2');
    },
    getImgData3(data) {
      this.faceAnalyze(data[0], 'upLoad3ImageData', 'initFile3', 'uploadLandmark3');
    }
  }
};
</script>
<style scoped lang="scss">
.compare-header-container {
  font-size: 16px;
  height: 32px;
  color: #435068;
  line-height: 32px;
  font-weight: bold;
}
.compareContainer {
  overflow: hidden;
  background: #efefef;
  padding: 0 25px;
  min-height: 500px;
}
.compareContainer h3 {
  line-height: 40px;
  color: #435068;
  font-size: 14px;
  font-weight: normal;
}
.compareImgContainer {
  margin-bottom: 20px;
}
.compareImgContainer-content {
  height: 267px;
}
.compareImgContainer-content1 {
  width: 350px;
  height: 267px;
  box-sizing: border-box;
  margin-right: 16px;
  padding: 15px;
  background: #ffffff;
  float: left;
}
.compareImgContainer-content2 {
  width: 418px;
  height: 267px;
  box-sizing: border-box;
  padding: 15px;
  margin-right: 16px;
  background: #ffffff;
  float: left;
  display: flex;
  flex-direction: column;
  .compareImgContainer-content2-top {
    display: flex;
  }
}
.compareImgContainer-content3 {
  width: 400px;
  height: 267px;
  box-sizing: border-box;
  padding: 15px;
  background: #ffffff;
  float: left;
}
.compareImgContainer-content1 .imgContainer {
  height: 140px;
  width: 100%;
}
.compareImgContainer-content1 .imgContainer .card-item {
  width: 100%;
}
.compareImgContainer-content1 .imgInfoContainer {
  width: 100%;
}
.compareImgContainer-content1 .imgInfoContainerItem {
  width: 50%;
  float: left;
}
.compareImgContainer-content .checkbox-container {
  font-size: 14px;
  margin-bottom: 10px;
}
.compareImgContainer-content p {
  color: #8a97a0;
  line-height: 16px;
}

.compareImgContainer-content2-left .imgContainer {
  width: 122px;
  height: 122px;
  background: linear-gradient(#e6edf8, #f6f6f8); /* 标准的语法 */
  border: 1px solid #d2d6de;
  margin-bottom: 15px;
}
.compareImgContainer-content2-left .imgContainer img {
  width: 100%;
}
.compareImgContainer-content2 .numberContainer {
  padding-left: 15px;
  padding-top: 40px;
  box-sizing: border-box;
  flex: 1;
}
.compareImgContainer-content3-top {
  height: 122px;
  margin-bottom: 15px;
  display: flex;
  width: 370px;
}
.compareImgContainer-content3 .checkbox-container {
  display: flex;
  justify-content: space-between;
}

.left-bottom {
  display: inline-block;
  float: left;
  width: 50%;
}
.right-bottom {
  display: inline-block;
  width: 50%;
}
.card-wrapper {
  width: 100%;
}
.card-box {
  display: inline-block;
  width: 25%;
  background: #ffffff;
}
p.card-line {
  margin: 5px 0;
  padding-left: 15px;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.right {
  float: right;
}
.meg-icon-star-on {
  position: absolute;
  display: inline-block;
  right: 48%;
  top: 2px;
  cursor: pointer;
  color: #ffc300;
}
</style>
<style>
.compareImgDialog .meg-dialog__body {
  padding: 0;
}
.compareImgContainer-content1 .imgContainer .meg-double-card {
  box-shadow: 1px 1px 5px #ffffff;
}
.meg-dialog.compareImgDialog {
  margin-top: 6vh !important;
}
.compareImgContainer-content3-top .meg-img-select {
  width: 33.3%;
}
</style>
