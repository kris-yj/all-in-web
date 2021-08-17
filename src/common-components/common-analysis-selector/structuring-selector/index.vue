<template>
  <div
    class="meg-structuring-selector"
    v-loading="loading||imgLoading">
    <div
      class="image-pane ss-flex-box">
      <p class="pane-title">
        {{ $t('上传图') }}
      </p>
      <div class="viewer-container">
        <img-viewer
          :src="imgUrl"
          :size="imgState.size">
          <custom-structure
            v-if="customStructing"
            @cancel="customStructing = false"
            @send="addNewStructure">
          </custom-structure>
          <structure-cover
            v-else
            ref="structureCover"
            :value="structureList"></structure-cover>
        </img-viewer>
        <div
          v-if="faceTracing"
          :class="['tracing-tips', tracingValue.length >= 2 ? 'mouth-tip' : 'eyes-tip']">
          <p class="tracing-tip-word">
            <span>{{ tracingTipWord.word1 }}</span>
            <br />
            {{ tracingTipWord.word2 }}
          </p>
        </div>
      </div>
      <div
        class="viewer-operate">
        <meg-tooltip
          :content="$t('手动框选')"
          v-show="!faceTracing">
          <meg-button
            type="text"
            icon="cut_another"
            @click="customStructingSwitch">
          </meg-button>
        </meg-tooltip>
        <meg-tooltip
          :content="$t('镜像图片')"
          v-show="!faceTracing">
          <meg-button
            type="text"
            icon="mirror"
            @click="$emit('img-mirror')"></meg-button>
        </meg-tooltip>
        <meg-tooltip
          :content="$t('旋转图片')"
          v-show="!faceTracing">
          <meg-button
            type="text"
            icon="restore"
            @click="$emit('img-rotate')"></meg-button>
        </meg-tooltip>
      </div>
    </div>
    <div
      class="operate-pane ss-flex-box">
      <div
        class="scroll-bar"
        v-if="list.length"
        :style="`height:${slotOn?'75%':'100%'}`">
        <template v-if="!faceTracing">
          <div class="select-all">
            <meg-checkbox
              v-if="isMultiMode"
              :indeterminate="isIndeterminate"
              v-model="checkAll"
              @change="handleCheckAll">
              {{ $t('全选') }}
            </meg-checkbox>
          </div>
          <div class="selector-group">
            <template
              v-for="(itemList,key) in structureList">
              <structure-group
                v-if="itemList.length"
                :key="key"
                :type="key"
                :list="itemList"
                :show-quality="showQuality"
                :low-quality-available="lowQualityAvailable"
                @change-check="checkedChange"
                @click-track="faceTrack"></structure-group>
            </template>
          </div>
        </template>
        <template v-if="faceTracing">
          <div class="detail-img-pane">
            <meg-img-container :img-src="tracingImg">
            </meg-img-container>
            <tracing-cover
              class="tracing-cover"
              v-model="tracingValue"
              @undo="tracingUndo"
              @cancel="tracingCancel"
              @save="tracingSure">
            </tracing-cover>
          </div>
        </template>
      </div>
      <template v-if="slotOn&&list.length&&showSlot">
        <slot></slot>
      </template>
      <div
        v-if="!list.length"
        class="structures-empty">
        <div class="tips-content">
          <div class="empty-tittle">
            <meg-icon
              name="warning"
              width="20px"
              height="20px"></meg-icon>
            {{ $t('未检测到目标') }}
          </div>
          <div class="empty-tips">
            {{ $t('请框选出包含识别目标的区域') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { cloneDeep } from 'lodash';
import TracingCover from './components/tracing-cover';
import ImgViewer from './components/img-viewer';
import CustomStructure from './components/custom-structure';
import StructureCover from './components/structure-cover';
import StructureGroup from './components/structure-group';

const pxInt = (value) => Math.round(value);

export default {
  name: 'StructingSelector',
  components: {
    ImgViewer,
    TracingCover,
    CustomStructure,
    StructureCover,
    StructureGroup
  },
  props: {
    imgUrl: {
      type: String,
      default: ''
    },
    list: {
      type: Array,
      default: () => ([])
    },
    showQuality: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    slotOn: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'multi'
    },
    lowQualityAvailable: { // 低质量是否可选中
      type: Boolean,
      default: true
    },
    enlarge: {
      type: Number,
      default: 1
    },
    showLicensePlate: { // 是否显示车牌
      type: Boolean,
      default: true
    }
  },
  data() {
    const canvas = document.createElement('canvas');
    return {
      // 人工标注类型
      tracingType: '',
      // 人工标注index
      tracingIndex: -1,
      // 人工标注数据
      tracingValue: [],
      // 是否正在进行人工标注
      faceTracing: false,
      // 是否正在创建自定义结构化
      customStructing: false,
      // 图片是否在加载中
      imgLoading: false,
      // 图片状态数据
      imgState: this.getImageState(),
      // 画布
      canvas,
      ctx: canvas.getContext('2d'),
      // 全选
      checkAll: true,
      // 半选
      isIndeterminate: false,
      // 是否显示slot
      showSlot: false,
      // 各类型结构化数据数组
      structureList: {
        faceList: [],
        bodyList: [],
        motorList: [],
        nonMotorList: [],
        motorLicensePlate: [],
        nonMotorizedLicenseplate: []
      },
    };
  },
  computed: {
    // 是否为多选模式
    isMultiMode() {
      return this.mode === 'multi';
    },
    // 当前激活项（如果存在）
    tracingItem() {
      return this.tracingIndex > -1 && this.tracingType ? this.structureList[this.tracingType][this.tracingIndex] : null;
    },
    tracingImg() {
      return this.tracingItem ? this.tracingItem.base64 : null;
    },
    tracingTipWord() {
      return {
        word1: `标注${this.tracingValue.length >= 2 ? '嘴巴' : '眼睛'}位置`,
        word2: '通过标注提高识别精准度'
      };
    }
  },
  watch: {
    imgUrl(val) {
      if (val) {
        this.loadImage();
        this.imageLoaded();
      }
    },
    list() {
      // this.initStructures(this.isMultiMode);
    }
  },
  mounted() {
    if (this.imgUrl) {
      this.loadImage();
    }
  },
  methods: {
    // 获取基础数据
    getBaseStructure() {
      return {
        labelValue: [],
        absLabelValue: [],
        imgSize: cloneDeep(this.imgState.size)
      };
    },
    // 重置结构化数据数组
    resetStructureList() {
      this.structureList = {
        faceList: [],
        bodyList: [],
        motorList: [],
        nonMotorList: [],
        motorLicensePlate: [],
        nonMotorizedLicenseplate: []
      };
    },
    // 初始化结构化数据数组
    initStructures() {
      this.resetStructureList();
      if (!this.list.length) { // 没有目标时取消初始化
        this.imgLoading = false;
        return;
      }
      this.list.forEach((item) => {
        if (item.locator) {
          if (this.enlarge !== 1 && !item.enlarge) { // 如果配置了enlarge 会根据enlarge数值缩放rect框
            delete item.locator.landmark;
            const oriWidthPixels = item.locator.rect.widthPixels;
            item.locator.rect.widthPixels *= this.enlarge;
            item.locator.rect.leftPixels -= (item.locator.rect.widthPixels - oriWidthPixels) / 2;
            const oriHeightPixels = item.locator.rect.heightPixels;
            item.locator.rect.heightPixels *= this.enlarge;
            item.locator.rect.topPixels -= (item.locator.rect.heightPixels - oriHeightPixels) / 2;
            item.enlarge = true;
          }
          const newItem = { // 初始化结构化数据
            type: 'rect',
            inner: true,
            textUp: false,
            checked: false,
            ...this.getBaseStructure(),
            ...cloneDeep(item)
          };
          newItem.styles = newItem.checked ? { strokeStyle: '#3a99f1' } : { strokeStyle: '#fff' };
          // 如果传入的数据中没有points数据但是有rect数据，则使用rect转换得到points数据
          if (item.locator.rect && !item.locator.points) {
            const points = this.formatRect(item.locator.rect, newItem);
            Object.assign(newItem, {
              ...points
            });
          }
          if (!newItem.base64) {
            Object.assign(newItem, this.getStructureBase64(newItem));
          }
          this.dispatchStructures(newItem);
        }
      });
      // 数据初始化完成 修改默认选中
      const needCheck = Boolean(!this.list.some((i) => i.checked));
      if (needCheck && this.isMultiMode) {
        this.checkAllChange(true);
      }
      this.updateCheckAllState();
      // 判断人体选中slot
      this.showSlot = this.list.some((i) => i.checked && i.detectType === 1);
      this.imgLoading = false;
      this.emitStructure();
    },
    // 派发结构化数据
    dispatchStructures(item) {
      switch (item.detectType) {
        case 0:
          this.structureList.faceList.push(cloneDeep(item));
          break;
        case 1:
          this.structureList.bodyList.push(cloneDeep(item));
          break;
        case 5:
          if (!item.typed && !item.licensePlate) { // 标记
            this.structureList.motorList.push({ ...cloneDeep(item), typed: true }); // 添加标记防止编辑是重复添加车牌
            if (this.showLicensePlate && item.property && item.property.license_plate_text && item.property.license_plate_style && item.property.license_plate_color) {
              const motorLicensePlate = { ...cloneDeep(item), licensePlate: true, licensePlateText: item.property.license_plate_text.showValue };
              delete motorLicensePlate.feature;
              this.structureList.motorLicensePlate.push(motorLicensePlate);
            }
          } else if (item.typed) { // 根据标记添加到不同数组
            this.structureList.motorList.push(cloneDeep(item));
          } else if (item.licensePlate) {
            this.structureList.motorLicensePlate.push(cloneDeep(item));
          }
          break;
        case 6:
          if (!item.typed && !item.licensePlate) { // 同上
            this.structureList.nonMotorList.push({ ...cloneDeep(item), typed: true });
            if (this.showLicensePlate && item.property.license_plate_text && item.property.license_plate_style && item.property.license_plate_color) {
              const nonMotorizedLicenseplate = { ...cloneDeep(item), licensePlate: true, licensePlateText: item.property.license_plate_text.showValue };
              delete nonMotorizedLicenseplate.feature;
              this.structureList.nonMotorizedLicenseplate.push(nonMotorizedLicenseplate);
            }
          } else if (item.typed) {
            this.structureList.nonMotorList.push(cloneDeep(item));
          } else if (item.licensePlate) {
            this.structureList.nonMotorizedLicenseplate.push(cloneDeep(item));
          }
          break;
        default: break;
      }
    },
    // 格式化rect 得到points
    formatRect(rect, item) {
      let {
        widthPixels, heightPixels, leftPixels, topPixels
      } = rect;
      const { width: imgWidth, height: imgHeight } = item.imgSize;
      if (leftPixels < 1) {
        leftPixels = 1;
      }
      if (topPixels < 1) {
        topPixels = 1;
      }
      if (widthPixels >= imgWidth - leftPixels) {
        widthPixels = imgWidth - leftPixels - 2;
      }
      if (heightPixels >= imgHeight - topPixels) {
        heightPixels = imgHeight - topPixels - 2;
      }
      const [width, height] = [widthPixels / imgWidth, heightPixels / imgHeight];
      const start = { x: leftPixels / imgWidth, y: topPixels / imgHeight };
      const end = { x: (leftPixels + widthPixels) / imgWidth, y: (topPixels + heightPixels) / imgHeight };
      return {
        width,
        height,
        start,
        points: [start, end]
      };
    },
    // 获取图片初始状态
    getImageState() {
      return {
        img: new Image(),
        size: null
      };
    },
    // 加载图片
    loadImage() {
      this.imgLoading = true;
      this.imgState = this.getImageState();
      Object.assign(this.imgState.img, {
        onload: this.imageLoaded.bind(this),
        src: this.imgUrl,
        crossOrigin: 'Anonymous'
      });
    },
    // 图片加载成功
    imageLoaded() {
      const { width, height } = this.imgState.img;
      this.imgState.size = { width, height };
      this.initStructures();
    },
    // 获取结构化选取的图片base64
    getStructureBase64(structure) {
      const { imgState: { img, size }, canvas, ctx } = this;
      const { start: { x, y }, width: w, height: h } = structure;
      const [left, top, width, height] = [pxInt(size.width * x), pxInt(size.height * y), pxInt(size.width * w), pxInt(size.height * h)];
      Object.assign(canvas, { width, height });
      ctx.drawImage(img, left, top, width, height, 0, 0, width, height);
      return {
        base64: canvas.toDataURL(),
        rect: {
          heightPixels: height, widthPixels: width, topPixels: top, leftPixels: left
        }
      };
    },
    // 标注人脸
    faceTrack(index, type) {
      this.tracingType = type;
      this.tracingIndex = index;
      this.faceTracing = true;
      if (this.tracingItem.labelValue && this.tracingItem.labelValue.length) {
        this.tracingValue = cloneDeep(this.tracingItem.labelValue);
      }
    },
    // 标注点撤销
    tracingUndo() {
      this.tracingValue.shift();
    },
    // 标注取消
    tracingCancel() {
      this.tracingValue = [];
      this.structureList[this.tracingType][this.tracingIndex].textUp = false;
      this.tracingType = '';
      this.tracingIndex = -1;
      this.faceTracing = false;
    },
    // 标注确认
    tracingSure() {
      if (this.tracingItem) {
        Object.assign(this.tracingItem, {
          labelValue: this.tracingValue,
          textUp: false,
          absLabelValue: this.getAbsoluteLabelValue(this.tracingValue)
        });
        this.structureList[this.tracingType][this.tracingIndex] = this.tracingItem;
        this.emitStructure();
      }
      this.tracingCancel();
    },
    // 获取标点相对于原图的坐标值
    getAbsoluteLabelValue(tracingValue) {
      const { start, width, height } = this.tracingItem;
      return tracingValue.map((item) => {
        const [point] = item.points;
        return {
          left: start.x * (1 + width * point.x),
          top: start.y * (1 + height * point.y)
        };
      });
    },
    // 自选结构化开始
    customStructingSwitch() {
      this.customStructing = !this.customStructing;
    },
    // 添加自定义
    addNewStructure(path) {
      const newItem = this.getStructureBase64(path);
      this.$emit('change-source', newItem.base64);
    },
    // 触发全选
    handleCheckAll() {
      this.isIndeterminate = false;
      this.checkAllChange(this.checkAll);
    },
    // 触发选中修改
    checkedChange(index, type, check) {
      // 多选
      const style = check ? { strokeStyle: '#3a99f1' } : { strokeStyle: '#fff' };
      if (this.isMultiMode) {
        this.structureList[type][index].checked = check;
        this.structureList[type][index].styles = style;
        this.updateCheckAllState();
        this.emitStructure();
      } else {
        // 单选
        this.checkAllChange(false);
        this.showSlot = Boolean(type === 'bodyList') && check;
        this.structureList[type][index].checked = check;
        this.structureList[type][index].styles = style;
        this.emitStructure();
      }
      // 更新结构化框样式
      this.$refs.structureCover.update();
    },
    // 改变全选
    checkAllChange(check) {
      Object.keys(this.structureList).forEach((key) => {
        this.structureList[key].forEach((item) => {
          item.checked = check;
          item.styles = check ? { strokeStyle: '#3a99f1' } : { strokeStyle: '#fff' };
        });
      });
      this.checkAll = check;
      this.isIndeterminate = false;
      this.emitStructure();
      // 更新结构化框样式
      if (this.$refs.structureCover) this.$refs.structureCover.update();
    },
    updateCheckAllState() {
      let unChecked = 0;
      let listLength = 0;
      Object.keys(this.structureList).forEach((key) => {
        if (this.structureList[key].length) {
          listLength += this.structureList[key].length;
          unChecked += this.structureList[key].filter((item) => !item.checked).length;
        }
      });
      if (unChecked && unChecked === listLength) {
        this.isIndeterminate = false;
        this.checkAll = false;
      } else if (unChecked) {
        this.isIndeterminate = true;
        this.checkAll = false;
      } else {
        this.isIndeterminate = false;
        this.checkAll = true;
      }
    },
    // 发送数据更新通知
    emitStructure() {
      let res = [];
      Object.keys(this.structureList).forEach((key) => {
        res = res.concat(this.structureList[key]);
      });
      this.$emit('change', cloneDeep(res));
    },
  }
};
</script>
<style lang="scss">
.meg-structuring-selector {
  display: flex;
  height: 100%;
  @mixin abs-cover($position: top) {
    position: absolute;
    left: 0;
    #{$position}: 0;
    width: 100%;
    height: 100%;
  }
  .operate-bar {
    position: absolute;
    display: flex;
    height: 18px;
    padding: 9px 0;
    border-radius: 2px;
    background: #3a3e44;
    box-shadow: 0 2px 4px 0 rgba(0,0,0,0.50);
    .meg-button {
      margin: 0;
      padding-top: 0;
      flex: 1;
      border-right: 1px solid rgba(255, 255, 255, .2);
      &:not(.is-disabled) {
        color: #fff;
      }
      &.is-disabled {
        color: #999;
      }
    }
  }
  .ss-flex-box {
    display: flex;
    flex-direction: column;
  }
  .pane-title {
    color: #999;
    text-align: left;
  }
  .image-pane {
    // flex: 1;
    margin: 20px 54px 0 21px;
    .viewer-container {
      position: relative;
      flex: 1;
      width: 418px;
      height: 418px;
    }
    .tracing-tips {
      @include abs-cover;
      z-index: 100;
      &.eyes-tip {
        background: rgba(0,0,0,0.15) url('./images/eye-marking.png') no-repeat center top / auto 100%;
      }
      &.mouth-tip {
        background:  rgba(0,0,0,0.15) url('./images/mouth-marking.png') no-repeat center top / auto 100%;
      }
    }
    .tracing-tip-word {
      position: absolute;
      width: 100%;
      bottom: 20px;
      font-size: 14px;
      color: #fff;
      text-align: center;
      span {
        font-size: 16px;
      }
    }
    .viewer-operate {
      text-align: center;
      line-height: 53px;
      height: 53px;
      .meg-button {
        padding: 0 25px;
        height: 38px;
      }
      .meg-button:hover {
        background: #E6F2FF;
      }
    }
  }
  .operate-pane {
    box-sizing: border-box;
    flex: 1;
    padding-right: 0;
    .scroll-bar {
      overflow-y: auto;
    }
    .meg-scrollbar__wrap {
      padding-left: 5px;
    }
    .structures-empty {
      width: 100%;
      height: 100%;
      background: rgb(249, 249, 249);
      margin: 25px 0 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      .tips-content{
        text-align: center;
      }
      .empty-tittle {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 18px;
        color: rgb(158, 164, 176);
      }
      .empty-tips {
        font-size: 16px;
        color: rgb(158, 164, 176);
      }
    }
    .select-all {
      margin-top: 43px;
    }
    .detail-img-pane {
      margin: 0 auto;
      position: relative;
      width: 260px;
      height: 260px;
      background: #f3f3f3;
      border: 1px solid rgba(210, 214, 222, .6);
    }
  }
}
</style>
