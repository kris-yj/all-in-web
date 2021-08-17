<template>
  <div class="property-wrap">
    <div class="left-content">
      <!-- 类型切换 -->
      <div class="tab-wrap">
        <div
          class="tab-item"
          v-for="(pItem,pKey) in archiveImagesObj"
          :class="{'active': pKey == currentType}"
          @click="typeChange(pKey)"
          :key="pKey">
          <span v-tooltip="true">
            {{ pItem.name }} ({{ pItem.checkedNum }}/{{ pItem.data.length }})
          </span>
        </div>
      </div>
      <div class="tab-content">
        <div
          class="tab-form"
          v-if="currentType < 5 && (subImageList.data && subImageList.data.length)">
          <meg-form
            ref="albumForm"
            :model="taskData"
            :rules="rules"
            label-width="80px"
            label-position="left">
            <meg-form-item
              prop="threshold"
              :label="$t('布控阈值')">
              <meg-input
                v-model="taskData.threshold"
                @change="handleThresholdChange"
                placeholder="请输入布控阈值"></meg-input>
            </meg-form-item>
          </meg-form>
        </div>
        <meg-card-frame
          v-if="subImageList.data && subImageList.data.length"
          tag="div"
          class="card-frame"
          :gap="10"
          :card-min-width="120">
          <div
            class="card"
            v-for="(item,index) in subImageList.data"
            :key="index">
            <meg-card
              class="card-item"
              :animation="true"
              :context-download="true"
              :img-src="item.url">
              <div slot="img-custom">
                <meg-checkbox
                  v-model="item.checked"
                  class="check-image-item"
                  @change="checkItemChange($event, index)"></meg-checkbox>
                <meg-icon
                  class="check-image-icon"
                  width="12"
                  height="12"
                  name="full_screen"
                  color="#fff"
                  @click="showImageDetail(item)"></meg-icon>
              </div>
            </meg-card>
          </div>
        </meg-card-frame>
        <div
          class="no-content"
          v-background="{image:'bg_1',icon:'icon_1',text:'暂无数据'}"
          v-else>
        </div>
      </div>
    </div>
    <meg-img-scaled
      v-if="fullImgScreen"
      :imgs-src="fullScreenInfo.imgsSrc"
      :is-all-scaled-show="fullScreenInfo.imgsSrc && fullScreenInfo.imgsSrc.length === 2"
      :is-single-scaled-show="fullScreenInfo.imgsSrc && fullScreenInfo.imgsSrc.length === 2"
      @close="fullImgScreen=false"></meg-img-scaled>
  </div>
</template>

<script>
import { i18n } from '@/utils/i18n.utils';

const validateDetectThreshold = (rule, value, callback) => { // eslint-disable-line
  if (!value) {
    return callback(new Error(i18n.t('请输入布控阈值')));
  }
  if (!/^\d+$/.test(Number(value))) {
    callback(new Error(i18n.t('请输入{entity}', {
      entity: i18n.t('数字值')
    })));
  } else if (value < 1 || value > 100) {
    callback(new Error(i18n.t('请输入0-100之间的数字')));
  } else {
    callback();
  }
};

export default {
  props: {
    archiveImagesObj: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // 当前的图片类型
      currentType: '',
      // 当前类型下面的图片列表
      subImageList: {},
      fullImgScreen: false,
      fullScreenInfo: {},
      taskData: {
        threshold: '',
      },
      rules: {
        threshold: [
          {
            validator: validateDetectThreshold,
            trigger: 'change',
          }
        ],
      },
    };
  },
  created() {
    this.currentType = '1';
    this.subImageList = this.archiveImagesObj['1']; //eslint-disable-line
    this.taskData.threshold = this.archiveImagesObj['1'].threshold;
  },
  methods: {
    /**
     * @description 切换图片类型的时候
     */
    typeChange(key) {
      console.log(key);
      this.taskData.threshold = this.archiveImagesObj[key].threshold;
      this.currentType = key;
      this.subImageList = this.archiveImagesObj[key];
    },
    /**
     * @description 选中单个的时候
     */
    checkItemChange(val, index) {
      this.subImageList.checkedNum += (val ? 1 : -1);
      const { checkedNum, totalNum } = this.subImageList;
      this.subImageList.checkedAll = checkedNum === totalNum;
      const curItem = this.subImageList.data[index];
      const curIndex = this.subImageList.checkedData.find((item) => curItem.clueId === item);
      if (val || val === 0) {
        if (!curIndex) {
          this.subImageList.checkedData.push(curItem.clueId);
        }
      } else {
        if (curIndex) {//eslint-disable-line
          this.subImageList.checkedData = this.subImageList.checkedData.filter((item) => curItem.clueId !== item);
        }
      }
      this.archiveImagesObj[this.currentType].isIndeterminate = checkedNum && checkedNum !== totalNum;
    },
    /**
     * @description 显示图片的全屏效果
     */
    showImageDetail(item) {
      console.log(item);
      this.fullScreenInfo = {
        imgsSrc: [item.url]
      };
      this.fullImgScreen = true;
    },
    /**
     * 布控布控阈值改变，把只塞进archiveImagesObj中
     */
    handleThresholdChange(val) {
      this.archiveImagesObj[this.currentType].threshold = val;
    },
  }
};
</script>

<style lang="scss" scoped>
  .property-wrap{
    border: 1px solid #EFEFEF;
  }
  .tab-wrap{
    height: 595px;
    background: #f3f3f3;
    overflow: auto;
  }
  .tab-item{
    width: 180px;
    height: 45px;
    position: relative;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    >span{
      display: inline-block;
      width: 132px;
    }
    v::deep .check-image-item{
      margin-right: 6px;
      margin-left: 12px;
    }
    &::after{
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #21539B;
      display: none;
    }
    &:hover{
      // background: #fff;
      color: #21539B;
      font-weight: bold;
    }
  }
  .tab-item.active{
    background: #fff;
    font-weight: bold;
    color: #21539B;
    &::after{
      display: block;
    }
  }
  .left-content{
    width: 100%;
    display: flex;
    height: 100%;
  }
  .tab-content{
    padding: 10px;
    overflow-y: auto;
    height: 595px;
    box-sizing: border-box;
    flex: 1;
    .tab-form {
      padding-bottom: 12px;
      ::v-deep.meg-input {
        width: 270px;
      }
      ::v-deep.meg-form-item {
        display: flex;
      }
      ::v-deep .meg-form-item__content {
        margin-left: 0 !important;
      }
    }
    .no-content{
      height: 100%;
      ::v-deep .meg-background{
        background-image: none !important;
        background-color: #fff;
        height: 100%;
      }
      ::v-deep .meg-background__icon{
        width: 90px;
        height: 82px;
      }
    }
    .card:hover .check-image-icon{
      display: block;
    }
    ::v-deep .meg-card{
      box-shadow: none !important;
    }
    ::v-deep.meg-card__img-layer {
      width: 100%;
      margin: 0 !important;
      flex: none;
      .check-image-item{
        position: absolute;
        left: 3px;
        top: -6px;
      }
      .check-image-icon{
        display: none;
        position: absolute;
        right: 3px;
        top: 3px;
        background: #9ea5be;
        padding: 3px;
        border-radius: 2px;
      }
     ::v-deep.meg-card__img{
        width: 100%;
        // height: 120px;
        ::v-deep img {
          width: 100% !important;
          // height: 120px !important;
          object-fit: cover !important;
        }
      }
    }
  }
</style>
