<template>
  <page-layout>
    <div class="face-compare">
      <header class="face-compare-head">
        <span class="modmeg-introduce">{{ $t('人脸比对') }}</span>
        <span class="modmeg-introduce2">{{ $t('两张人像比对，或一张人像与证件号比对') }}</span>
      </header>
      <section class="upload-model">
        <div
          v-loading="compareing"
          class="main-container">
          <div class="img-container">
            <common-img-analysis
              class="upload-container"
              selector-mode="single"
              jump-visible
              :analyze-type="[0]"
              :max-img-num="1"
              :font-size="'18px'"
              :bottom-height="'48px'"
              :drop-file="dropFile1"
              background="face"
              @output="dealWithImg($event,'face1')"></common-img-analysis>
            <common-img-analysis
              class="upload-container"
              selector-mode="single"
              v-model="idNumber"
              jump-visible
              :analyze-type="[0]"
              input-num
              :max-img-num="1"
              :font-size="'18px'"
              :bottom-height="'48px'"
              :drop-file="dropFile2"
              background="face"
              @output="dealWithImg($event,'face2')"></common-img-analysis>
          </div>
          <result-frame
            v-if="resultList.length"
            :result-list="resultList"
            :right-img-file="face2"
            @select-result="selectResult"></result-frame>
        </div>
      </section>
      <section class="option-button">
        <meg-button
          type="primary"
          class="begin-compare"
          :disabled="disable"
          @click="compare">
          {{ $t('立即比对') }}
        </meg-button>
        <meg-button
          v-show="face1.photoData || face2.photoData"
          type="info"
          @click="showFullScreen"
          class="full-screen">
          <meg-icon
            name="fullscreen"
            width="10"
            height="10"></meg-icon>
          {{ $t('全屏') }}
        </meg-button>
      </section>
      <section
        class="compare-result"
        :class="fontColor"
        v-if="showCompareResult">
        <p class="score-font">
          {{ Number(compareScore).toFixed(2) }}
        </p>
        <p class="result-font">
          [ {{ comparePrompt }} ]
        </p>
      </section>
      <section
        v-else>
        <score-bar
          :verify-threshold="verifyThreshold"></score-bar>
      </section>
    </div>
    <common-img-scaled
      v-model="fullImgScreen"
      :check-orientation="false"
      :is-all-scaled-show="fullImgUrl.length === 2"
      :is-single-scaled-show="fullImgUrl.length === 2"
      :left-img-rect="face1.rect?face1.rect:{}"
      :right-img-rect="face2.rect?face2.rect:{}"
      :compare-score="compareScore"
      :imgs-src="fullImgUrl"></common-img-scaled>
  </page-layout>
</template>

<script>
import CommonImgScaled from '@/common-components/common-img-scaled';
import CommonImgAnalysis from '@/common-components/common-img-analysis';
import commonSwitchParams from '@/common-components/common-switch-params';
import ResultFrame from '../components/result-frame';
import ScoreBar from '../components/score-bar';
import FaceComparisonSrv from '../face-compare.service.js';

export default {
  components: {
    CommonImgAnalysis,
    ResultFrame,
    ScoreBar,
    CommonImgScaled,
  },
  data() {
    return {
      compareing: false, // 比对loading
      dropFile1: {}, // 初始化左图
      dropFile2: {}, // 初始化右图
      face1: {}, // 左图信息
      face2: {}, // 右图信息
      idNumber: '',
      resultList: [], // 身份证比对结果
      compareScore: 0, // 比分
      showCompareResult: false, // 是否显示比分
      verifyThreshold: [], // 比分字典
      autoCompare: false, // 自动触发比对
      fullImgScreen: false, // 查看大图
    };
  },
  computed: {
    fontColor() {
      const { verifyThreshold } = this;
      if (this.compareScore >= verifyThreshold[0] && this.compareScore < verifyThreshold[1]) {
        return 'greenFont';
      } if (this.compareScore >= verifyThreshold[1] && this.compareScore < verifyThreshold[2]) {
        return 'yellowFont';
      } if (this.compareScore >= verifyThreshold[2] && this.compareScore < verifyThreshold[3]) {
        return 'orangeFont';
      }
      return 'redFont';
    },
    comparePrompt() {
      const { verifyThreshold } = this;
      if (this.compareScore >= verifyThreshold[0] && this.compareScore < verifyThreshold[1]) {
        return this.$t('极可能不是一个人');
      } if (this.compareScore >= verifyThreshold[1] && this.compareScore < verifyThreshold[2]) {
        return this.$t('可能不是一个人');
      } if (this.compareScore >= verifyThreshold[2] && this.compareScore < verifyThreshold[3]) {
        return this.$t('可能是一个人');
      }
      return this.$t('极可能是一个人');
    },
    disable() {
      return !((this.face1.photoData && this.face2.photoData) || (this.face1.photoData && this.idNumber)) || this.compareing;
    },
    fullImgUrl() {
      const list = [];
      if (this.face1.photoData) {
        list.push(this.face1.photoData);
      }
      if (this.face2.photoData) {
        list.push(this.face2.photoData);
      }
      return list;
    }
  },
  mounted() {
    this.verifyThreshold = `0,${this.$store.getters.systemByType('verifyThreshold').value}`.split(',');
    if (JSON.stringify(this.$route.query) !== '{}') {
      const routerParams = this.$route.query;
      // 检索日志跳转
      if (routerParams.id) {
        this.fillBySearchLog(routerParams.id);
      } else {
        // 其他跳转
        commonSwitchParams.getOriginalQuery(this.$route.query).then((params) => {
          if (params.jumpWithImgInfo && params.jumpWithImgInfo.photo) {
            this.dropFile1 = { ...params.jumpWithImgInfo.photo, photo: params.jumpWithImgInfo.photoUrl };
          }
        });
      }
    }
  },
  created() {
  },
  methods: {
    // 根据检索日志填充信息
    fillBySearchLog(id) {
      FaceComparisonSrv.getOperationLog({ id }).then((res) => {
        if (res.code === 0) {
          const { param, type } = JSON.parse(res.data.realParam);
          if (type === 'byProperties') { // 人像与身份证号码检索
            this.idNumber = param.idCard; // 填充身份证号码
            this.dropFile1 = this.formatOpts(param, 'face');
          } else { // 两张人像比对
            this.dropFile1 = this.formatOpts(param, 'face1');
            this.dropFile2 = this.formatOpts(param, 'face2');
          }
          this.autoCompare = true;
        }
      });
    },
    // 格式化图片信息
    formatOpts(param, sub) {
      const data = {
        photo: param[sub].photoData,
        couldEdit: false,
        goAnalyze: false,
        images: [{
          locator: {
            landmark: param[sub].landmark,
            usefulFrame: param[sub].rect,
          }
        }]
      };
      if (Object.prototype.hasOwnProperty.call(param[sub], 'hint')) {
        data.coordinate = param[sub].hint;
        data.hasCoordinate = true;
      }
      return data;
    },
    // 处理上传图
    dealWithImg(file, from) {
      if (file && file.length) {
        const structure = file[0].images[0] || {};
        const obj = {
          photoData: file[0].photo,
          qualityPass: !!structure.pass,
          feature: structure.feature,
          landmark: structure.locator && structure.locator.landmark,
          rect: structure.locator && structure.locator.rect,
          body: false
        };
        // 是否有描点
        if (structure.hasCoordinate) {
          obj.hint = structure.coordinate;
        }
        this[from] = obj;
        // 是否为回填结果
        if (file[0].extra) {
          this.face2.index = file[0].extra.index;
          return;
        }
      } else {
        this[from] = {};
      }
      this.resultList = [];
      if (from === 'face2') { this.idNumber = ''; }
      this.showCompareResult = false;
      // 如果 autoCompare 比对
      if (this.autoCompare && this.face1.photoData && (this.face2.photoData || this.idNumber)) {
        this.compare();
        this.autoCompare = false;
      }
    },
    // 回填图片
    backFill(file, target) {
      if (file && file.photo && target) {
        if (target === 'left') {
          this.dropFile1 = file;
        } else {
          this.dropFile2 = file;
        }
      }
    },
    // 结果中选择 填充右组件
    selectResult(index) {
      const rightImg = {
        photo: this.resultList[index].photoUrl,
        goAnalyze: false,
        couldEdit: false,
        extra: {
          index,
          add: true // 没有images且不通过analysis时的加入组件flag
        }
      };
      this.backFill(rightImg, 'right');
      this.compareScore = this.resultList[index].score;
    },
    // 对比
    compare() {
      this.eventTracking('FaceCompareCom');
      this.compareing = true;
      if (this.face2.photoData) {
        FaceComparisonSrv.getVerifyFaceToFace({
          'face1': this.face1,
          'face2': this.face2
        }).then((res) => {
          if (res.code === 0) {
            this.resultList = [];
            this.compareScore = res.data.score;
            this.showCompareResult = true;
          }
          this.compareing = false;
        });
      } else {
        FaceComparisonSrv.getVerifyFaceToIdCard({
          'face': this.face1,
          'idCard': this.idNumber
        }).then((res) => {
          if (res.code === 0) {
            this.resultList = res.data;
            this.compareScore = this.resultList[0].score;
            this.selectResult(0);
            this.showCompareResult = true;
          }
          this.compareing = false;
        });
      }
    },
    // 点击全屏
    showFullScreen() {
      this.fullImgScreen = true;
    },
  }
};
</script>

<style lang="scss" scoped>
.face-compare {
  height: 100%;
  background-color: #e0e4ed;
  .greenFont {
    color: #4baf78;
  }
  .yellowFont {
    color: #dbac58;
  }
  .orangeFont {
    color: #ed673e;
  }
  .redFont {
    color: #ce3636;
  }
  .face-compare-head {
    line-height: 56px;
    height: 56px;
    background-color: #eeeeee;
    text-align: center;
    .modmeg-introduce {
      font-size: 16px;
      font-weight: bold;
      color: #435068;
      margin: 0 25px;
      float: left;
    }
    .modmeg-introduce2 {
      font-size: 12px;
      color: #89969f;
      float: left;
    }
  }
  .upload-model {
    display: flex;
    justify-content: center;
    margin-top: 34px;
    .main-container {
      display: flex;
      justify-content: flex-start;
      height: 330px;
    }
    .img-container {
      display: flex;
      justify-content: flex-start;
      height: 330px;
      width: 660px;
    }
    .upload-container {
      overflow: hidden;
    }
  }
  .option-button {
    margin: 26px auto 0 auto;
    width: 660px;
    text-align: center;
    position: relative;
    .begin-compare {
      width: 180px;
      height: 34px;
      font-size: 14px;
      font-weight: bold;
    }
    .full-screen {
      height: 34px;
      font-size: 14px;
      font-weight: bold;
      position: absolute;
      right: 0;
      line-height: 7px;
    }
  }
  .compare-result {
    display: flex;
    flex-direction: column;
    margin: 50px auto 0 auto;
    height: 50px;
    width: 550px;
    justify-content: center;
    align-items: center;
  }
  .score-font {
    font-family: "HEMIHEAD";
    font-size: 50px;
    line-height: unset;
  }
  .result-font {
    font-size: 14px;
  }
}
</style>
