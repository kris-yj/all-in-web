<template>
  <div
    class="meg-img-analysis"
    @drop="imgDrop">
    <div
      class="img-analysis"
      v-loading="loading">
      <ul
        class="upload-list"
        v-if="maxImgNum===3">
        <template v-for="i in 3">
          <li
            :key="i"
            :style="{backgroundImage: `url(${backgroundImg})`}"
            @click="selectList(i-1)">
            <meg-img-container
              v-show="listLength>=i"
              :useful-frame="getUsefulFrame(i-1)"
              :img-src="getImgSrc(i-1)">
            </meg-img-container>
          </li>
        </template>
      </ul>
      <meg-imgs-upload
        :multiple-list="maxImgNum===3"
        :from-history="fromHistory"
        :bottom-height="bottomHeight"
        :font-size="fontSize"
        :bottom-prompt-text="bottomPromptText"
        :upload-prompt-text="uploadPromptText"
        :accept-img-type="acceptImgType"
        :shield-upload="shieldUpload"
        @get-file="getFile"
        @upload-click="$emit('upload-click')"
        @bottom-click="showHistory">
        <template v-slot="{showIcon}">
          <upload-container
            :list-length="listLength"
            :jump-visible="jumpVisible"
            :scale="scale"
            :show-icon="showIcon"
            :background-img="backgroundImg"
            :active-item="activeItem"
            :is-multi-mode="isMultiMode"
            :show-origin="showOrigin"
            @edit-img="editFile"
            @delete-img="deleteFile"></upload-container>
          <meg-input
            v-if="inputNum&&!listLength"
            class="id-number"
            :placeholder="$t('请输入证件号')"
            :value="value"
            @click.native.stop
            @input="emitOut">
          </meg-input>
        </template>
      </meg-imgs-upload>
    </div>
    <common-analysis-selector
      v-if="showSelector"
      :loading="rotateFlag"
      :mode="selectorMode"
      :list="list"
      :enlarge="enlarge"
      :slot-on="slotOn"
      :img-url="editImg"
      :selector-loading="selectorLoading"
      :low-quality-available="lowQualityAvailable"
      :show-quality="showQuality"
      :show-license-plate="showLicensePlate"
      @img-mirror="imgChange('mirror')"
      @img-rotate="imgChange('rotate')"
      @change-source="changeSource"
      @close="closeSelector"
      @send="dealSelectData">
      <slot></slot>
    </common-analysis-selector>
    <common-upload-history
      :visible="showUploadHistory"
      :image-list-data="imageListData"
      @cancel="cancel"
      @confirm="confirm"></common-upload-history>
  </div>
</template>

<script>
// import _ from 'lodash';
import { utils } from '@/utils/utils';
import imgUtils from './img-utils.js';
import ImgAnalysisSrv from './img-analysis.service.js';
import MegImgsUpload from './imgs-upload';
import UploadContainer from './upload-container';
import CommonUploadHistory from '../common-upload-history';
import CommonAnalysisSelector from '../common-analysis-selector';
import defaultBg from './images/img-analysis-bg.svg';
import faceBg from './images/face-bg.png';
import bodyBg from './images/body-bg.png';

export default {
  name: 'CommonImgAnalysis',
  components: {
    MegImgsUpload,
    UploadContainer,
    CommonUploadHistory,
    CommonAnalysisSelector,
  },
  props: {
    fromHistory: {
      type: Boolean,
      default: true
    },
    bottomHeight: {
      type: String,
      default: '45px'
    },
    fontSize: {
      type: String,
      default: '16px'
    },
    bottomPromptText: {
      type: String,
      default: '从上传记录选择'
    },
    uploadPromptText: {
      type: String,
      default: '拖拽或点击上传图像'
    },
    acceptImgType: {
      type: Array,
      default() {
        return ['image/png', 'image/bmp', 'image/jpg', 'image/jpeg'];
      }
    },
    background: { // 自定义展位图
      type: String,
      default: 'all'
    },
    value: { // 身份证号码输入框默认值
      type: String,
      default: ''
    },
    slotOn: {
      type: Boolean,
      default: false
    },
    maxImgNum: { // 最大上传数量1或3
      type: Number,
      default: 3
    },
    selectorMode: { // 选择器模式 单选 single 多选 multi
      type: String,
      default: 'multi'
    },
    jumpVisible: { // 是否展示携图跳转
      type: Boolean,
      default: false
    },
    scale: { // 展示时rect的缩放系数
      type: Object,
      default: () => ({ widthScale: 0.5, heightScale: 0.5 })
    },
    analyzeType: { // 识别参数 0 人脸 1 人体 6 非机动车 5 机动车 4 画像
      type: Array,
      default: () => [0, 1, 5, 6]
    },
    inputNum: { // 是否显示输入身份证号码
      type: Boolean,
      default: false
    },
    shieldUpload: { // 屏蔽上传
      type: Boolean,
      default: false
    },
    defaultShowSelector: { // 上传后默认打开裁切
      type: Boolean,
      default: false
    },
    initFile: { // 手动传入图片 多张
      type: Array,
      default() {
        return [];
      }
    },
    dropFile: { // 手动传入图片 单张
      type: Object,
      default: () => {}
    },
    lowQualityAvailable: { // 低质量是否可选中
      type: Boolean,
      default: true
    },
    enlarge: { // 扩大rect
      type: Number,
      default: 1
    },
    pass: { // 裁切组件确定是否通过
      type: Boolean,
      default: true
    },
    showOrigin: { // 上传框中显示原图
      type: Boolean,
      default: false
    },
    showQuality: {
      type: Boolean,
      default: false
    },
    showLicensePlate: { // 是否显示车牌
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      textUp: false,
      rotateFlag: false, // 旋转图片
      fileList: [],
      fileCache: {},
      activeIndex: -1,
      imageListData: [], // 历史上传数据
      showUploadHistory: false, // 显示历史上传
      showSelector: false, // 显示裁切
      editImg: '', // 当前编辑的图片原图base64
      list: [], // 裁切组件结构化数据对象数组
      selectorLoading: false, // 裁切组件loading
      loading: false,
      init: false,
      editing: false
    };
  },
  computed: {
    listLength() {
      return this.fileList.length;
    },
    // 是否为多选模式
    isMultiMode() {
      return this.selectorMode === 'multi';
    },
    activeItem() {
      return this.activeIndex > -1 ? this.fileList[this.activeIndex] : {};
    },
    // 背景占位图 内置两种 同时可以自定义
    backgroundImg() {
      switch (this.background) {
        case 'face': {
          return faceBg;
        }
        case 'body': {
          return bodyBg;
        }
        case 'all': {
          return defaultBg;
        }
        default: return this.background;
      }
    }
  },
  watch: {
    initFile(val) {
      if (val && val.length) {
        this.init = true;
        val.forEach((item) => {
          this.getFile(item);
        });
      } else {
        this.reset();
      }
    },
    dropFile(item) {
      if (item && item.photo) {
        this.init = true;
        this.getFile(item);
      }
    },
    showSelector(bool) {
      this.$emit('selctor-change', bool);
    }
  },
  methods: {
    getUsefulFrame(index) {
      if (this.listLength > index) {
        const list = this.fileList[index].images.filter((item) => item.checked);
        return list.length === 1 && list[0].locator ? list[0].locator.rect : {};
      }
      return {};
    },
    getImgSrc(index) {
      return this.listLength > index ? this.fileList[index].photo : '';
    },
    // 重置
    reset() {
      this.fileList = [];
      this.activeIndex = -1;
    },
    // 图片变换
    imgChange(type) {
      // 限制旋转
      if (this.rotateFlag) return;
      this.rotateFlag = true;
      let p;
      if (type === 'mirror') {
        p = imgUtils.getMirrorReversalImg(this.editImg);
      } else {
        p = imgUtils.getTurnRightImg(this.editImg);
      }
      p.then((base64) => {
        ImgAnalysisSrv.getAnalyze({
          'photo': base64,
          'analyzeType': this.analyzeType
        }).then((response) => {
          this.rotateFlag = false;
          if (response.code === 0) {
            const { data } = response;
            this.editImg = base64;
            this.list = data.images;
          }
        });
      });
    },
    // 切换选中
    selectList(index) {
      if (this.listLength && index <= (this.listLength - 1)) {
        this.activeIndex = index;
      }
    },
    // 格式化数据
    formatFile(file) {
      if (!file.images) {
        file.images = [];
      }
      if (file.couldEdit !== false) {
        file.couldEdit = true;
      }
      if (file.goAnalyze === false) {
        // 不通过接口检测且传递有目标类型时 增加目标过滤
        file.images = file.images.filter((item) => (item.detectType ? this.analyzeType.indexOf(item.detectType) !== -1 : true));
      } else {
        file.goAnalyze = true;
      }
      if ((this.isMultiMode && file.goAnalyze) || file.images.length === 1) {
        file.images.forEach((obj) => {
          if (this.lowQualityAvailable || obj.pass || obj.feature) {
            obj.checked = true;
          }
        });
      }
      if (!file.images.length && file.id && file.detectType) {
        const { detectType, id } = file;
        file.images.push({ id, detectType });
      }
      return file;
    },
    // 接受文件
    async getFile(item) {
      if (this.maxImgNum === 3 && this.fileList.length >= 3) {
        this.$message(this.$t('最多上传三张图片！'));
        this.loading = false;
        return;
      }
      this.loading = true;
      if ((/http|https|blob|\/core\/|\/storage\//).test(item.photo)) {
        const res = await utils.urlToBase64(item.photo);
        item.photo = res;
        if (item.goAnalyze === false) {
          const file = this.formatFile(item);
          this.addFile(file);
        } else {
          this.getAnalysis(item);
        }
      } else if (item.goAnalyze === false) {
        const file = this.formatFile(item);
        this.addFile(file);
      } else {
        this.getAnalysis(item);
      }
    },
    // 添加文件
    addFile(item) {
      this.fileCache = item;
      this.updateSelector(item);
      if (this.showSelector === true) { return; }
      if (!item.images.length && item.couldEdit) { // 没有目标且可以编辑时
        this.showSelector = true;
        return;
      }
      if (!item.images.length && !item.couldEdit && !(item.extra && item.extra.add)) { // 没有目标且不可以编辑时
        this.$message(this.$t('该图片未识别到目标'));
        this.loading = false;
        return;
      }
      if ((this.defaultShowSelector || item.images.length !== 1) && item.couldEdit && item.goAnalyze) { // 默认打开裁切或多个目标时
        this.showSelector = true;
        return;
      }
      if (!item.images.filter((el) => el.checked).length && item.couldEdit) { // 选中为0时
        this.showSelector = true;
        return;
      }
      this.saveFile(item);
    },
    // 存储
    async saveFile(item) {
      if (item.images[0] && !item.images[0].base64 && item.images[0].locator && item.images[0].locator.rect) {
        item.images[0].base64 = await imgUtils.getExactImg(item.photo, item.images[0].locator.rect, 0.46, 0.46);
      }
      switch (this.maxImgNum) {
        case 1: {
          this.fileList = [item];
          break;
        }
        case 3: {
          this.fileList.push(item);
          break;
        }
        default: break;
      }
      this.activeIndex = this.listLength - 1;
      if (this.init && this.initFile.length === this.listLength) {
        this.$emit('initDone');
      }
      this.loading = false;
      this.$emit('output', this.getFileList(true));
    },
    // 识别目标
    getAnalysis(file) {
      ImgAnalysisSrv.getAnalyze({
        'photo': file.photo,
        'analyzeType': this.analyzeType
      }).then((res) => {
        if (res.code === 0) {
          const item = this.formatFile(Object.assign(res.data, file));
          this.addFile(item);
        } else {
          this.loading = false;
        }
        this.selectorLoading = false;
      });
    },
    // 打开历史上传
    showHistory() {
      const opts = {};
      if (this.analyzeType[0] === 4) {
        opts.type = 2;
      } else {
        opts.type = 1;
      }
      ImgAnalysisSrv.getRecentPhotos(opts).then((res) => {
        if (res.code === 0) {
          if (!res.data.length) {
            this.$message('暂无上传记录');
            return;
          }
          this.imageListData = res.data;
          this.showUploadHistory = true;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 取消从我的上传记录上传
    cancel() {
      this.showUploadHistory = false;
    },
    // 从我的上传记录确认选择
    confirm(item) {
      const photo = {
        photo: item.photoData,
        goAnalyze: true,
      };
      if (this.analyzeType[0] === 4) {
        photo.couldEdit = false;
      }
      this.getFile(photo);
      this.showUploadHistory = false;
    },
    // 向外派发input
    emitOut(value) {
      this.$emit('input', value);
    },
    // 更新裁切组件
    updateSelector(item) {
      if (item) {
        this.editImg = item.photo;
        this.list = item.images;
        return;
      }
      if (this.activeItem && this.activeItem.photo) {
        this.editImg = this.activeItem.photo;
        this.list = this.activeItem.images;
      }
    },
    // 点击编辑触发裁切
    editFile() {
      this.loading = true;
      this.updateSelector();
      this.showSelector = true;
      this.editing = true;
      this.fileCache = this.activeItem;
    },
    deleteFile() {
      this.fileList.splice(this.activeIndex, 1);
      if (this.activeIndex > this.fileList.length - 1) {
        this.activeIndex -= 1;
      }
      this.$emit('output', this.getFileList(true));
    },
    // 关闭人脸裁剪对话框
    closeSelector() {
      this.editing = false;
      this.showSelector = false;
      this.showImg = true;
      this.loading = false;
    },
    // 框选保存
    dealSelectData(data) {
      this.$emit('confirm');
      this.$nextTick(() => {
        if (!this.pass) {
          return;
        }
        if (data && data.length) {
          if (!data.filter((item) => item.checked).length) {
            this.showSelector = false;
            this.showImg = true;
            this.loading = false;
            return;
          }
          if (this.editing) {
            this.editing = false;
            Object.assign(this.fileList[this.activeIndex], { images: data, photo: this.editImg });
          } else {
            this.saveFile(Object.assign(this.fileCache, { images: data, photo: this.editImg }));
          }
          this.$emit('output', this.getFileList(true));
        }
        this.showSelector = false;
        this.showImg = true;
        this.loading = false;
      });
    },
    // 裁切改变图片
    changeSource(base64) {
      ImgAnalysisSrv.getAnalyze({
        'photo': base64,
        'analyzeType': this.analyzeType
      }).then((response) => {
        this.rotateFlag = false;
        if (response.code === 0) {
          const { data } = response;
          this.editImg = base64;
          this.list = data.images;
        }
      });
    },
    // 获取图片信息，可全量可只获取选中项 默认全量获取
    getFileList(chosed = false) {
      if (!chosed) {
        return this.fileList;
      }
      const list = [];
      this.fileList.forEach((element) => {
        const item = { ...element };
        item.hasMultipleTarget = Boolean(element.images.length > 1);
        const { length } = item.images;
        item.images = element.images.filter((i) => i.checked);
        // debugger;
        if ((length !== item.images.length) && item.extra && item.extra.id) delete item.extra.id;
        list.push(item);
      });
      return list;
    },
    imgDrop(e) {
      let draggingData = e.dataTransfer.getData('draggingData');
      if (!draggingData) return;
      draggingData = JSON.parse(draggingData);
      let item = {};
      switch (draggingData.type) {
        case 'capture': {
          item.photo = draggingData.data.cropUrl || draggingData.data.url;
          break;
        }
        case 'database': {
          item.photo = draggingData.data.photoUrl;
          break;
        }
        case 'card': {
          const {
            url, id, detectType
          } = draggingData.data;
          item = {
            photo: url, id, detectType, couldEdit: false, goAnalyze: true
          };
          break;
        }
        case 'alarm': {
          item.photo = draggingData.data.cropUri;
          break;
        }
        default: {
          item.photo = draggingData.data.leftImgSrc;
          break;
        }
      }
      this.getFile(item);
    }
  },
};
</script>

<style lang='scss' scoped>
.meg-img-analysis {
  width: 100%;
  height: 100%;
}
.img-analysis {
  width: 100%;
  height: 100%;
  display: flex;
  .upload-list {
    width: 25%;
    height: 100%;
    float: left;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    li {
      margin:0 6%;
      position: relative;
      height: 29%;;
      border: 1px solid #d4d8dd;
      background: no-repeat;
      background-size: 100%;
    }
    .meg-img-container {
      cursor: pointer;
      background: linear-gradient(180deg,#e6edf8,#f6f6f6);
    }
    .meg-img-container:hover+.mission_del_list {
      display: inline;
    }
    .mission_del_list:hover {
      display: inline;
    }
  }
  .id-number {
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100% - 12px);
    border: none;
    height: 34px;
    font-size: 14px;
    font-weight: bold;
    color: #89969f;
    margin:5px;
    z-index: 3;
    input {
      text-align: center;
    }
  }
  .upload-card{
    flex: 1;
  }
}
</style>
