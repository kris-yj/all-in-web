<template>
  <div class="settings-info-wrap">
    <div
      class="info-title"
      v-show="mode!=='text'">
      <i
        :class="(mode==='text')?'meg-icon-caret-right': 'meg-icon-caret-bottom'"></i>
      <!-- 尺寸 -->
      {{ $t('尺寸') }}
    </div>
    <div
      class="info-body image-size"
      :class="{'collapse':mode!=='hand'}">
      <!-- 宽度 -->
      <label for="">{{ $t('宽度') }}</label>
      <meg-input-number
        v-model="width"
        controls-position="right"
        @change="changeSize"
        :min="1"
        :max="600"></meg-input-number>
      <!-- 高度 -->
      <label for="">{{ $t('高度') }}</label>
      <meg-input-number
        v-model="height"
        controls-position="right"
        @change="changeSize"
        :min="1"
        :max="600"></meg-input-number>
    </div>
    <div
      class="info-body image-size"
      :class="{'collapse':(mode!=='pen' && mode!=='eraser')}">
      <label for="">{{ $t('画笔半径') }}</label>
      <!-- 画笔的颜色和 画笔半径 -->
      <meg-input-number
        v-model="penRValue"
        controls-position="right"
        @change="penChange"
        :min="1"
        :max="600"></meg-input-number>
    </div>

    <div
      class="info-title"
      v-show="!(mode==='text' || mode==='eraser')">
      <i
        :class="(mode==='text' || mode==='eraser')?'meg-icon-caret-right': 'meg-icon-caret-bottom'"></i>
      <!-- 颜色 -->
      {{ $t('颜色') }}
    </div>
    <div
      class="info-body image-color"
      :class="{'collapse':(mode==='eraser' || mode==='text')}">
      <meg-color-picker
        v-model="color1"
        v-show="mode==='hand'"
        @change="imageColorChange"></meg-color-picker>
      <meg-color-picker
        v-model="penColor"
        v-show="mode==='pen'"
        @change="penChange"></meg-color-picker>
      <div
        class="colors">
        <!-- 填充 -->
        <div class="colors-title">
          {{ $t('填充') }}
        </div>
        <div class="colors-big">
          <span
            class="color-item"
            v-for="(item,index) in colorList1"
            :key="index"
            :style="{'background-color':item, 'border':(index===4)?'1px solid #d1d5dd':''}"
            @click="imageColorChange(item, 'history')"></span>
        </div>
        <div class="colors-small">
          <span
            class="color-item"
            v-for="(item,index) in colorList2"
            :key="index"
            :style="{'background-color':item}"
            :class="{'margin10': index%2!==0}"
            @click="imageColorChange(item, 'history')"></span>
        </div>
      </div>
    </div>

    <div
      class="info-title"
      v-show="mode==='hand'">
      <i
        :class="(mode!=='hand')?'meg-icon-caret-right': 'meg-icon-caret-bottom'"></i>
      <!-- 纹理 -->
      {{ $t('纹理') }}
    </div>
    <!-- :style="{'background-img': item.src}" -->
    <div
      class="info-body image-cover"
      :class="{'collapse':(mode!=='hand')}">
      <div class="cover-style">
        <!-- <span>选中: {{ styleValue }}</span> -->
        <span
          :class="{'active': styleValue}"
          :style="{'background-image': styleValue?('url('+styleImages[styleValue]+')'):''}"></span>
        <span
          v-for="(item,index) in styleOptions"
          :key="index"
          :class="{'active': (item.value && item.value === styleValue)}"
          :style="{'background-image': 'url('+item.src+')'}"
          @click="changeStyleType(item)"></span>
      </div>
      <div class="style-inputs">
        <div>
          <!-- 宽度 -->
          <label for="">{{ $t('宽度') }}</label>
          <meg-input-number
            v-model="RValue"
            controls-position="right"
            @change="styleChange"
            :min="1"
            :max="100"></meg-input-number>
          <meg-slider
            v-model="RValue"
            @change="styleChange"
            :min="1"
            :max="100"></meg-slider>
        </div>
        <div
          v-show="styleValue === 'spot'">
          <!-- 圆心距 -->
          <label for="">{{ $t('圆心距') }}</label>
          <meg-input-number
            v-model="RDestance"
            controls-position="right"
            @change="styleChange"
            :min="1"
            :max="200"></meg-input-number>
          <meg-slider
            v-model="RDestance"
            @change="styleChange"
            :min="1"
            :max="200"></meg-slider>
        </div>
        <div>
          <!-- 颜色1 -->
          <label for="">{{ $t('颜色') }}1</label>
          <meg-color-picker
            v-model="styleColor1"
            @change="styleChange"></meg-color-picker>
        </div>
        <div>
          <!-- 颜色2 -->
          <label for="">{{ $t('颜色') }}2</label>
          <meg-color-picker
            v-model="styleColor2"
            @change="styleChange"></meg-color-picker>
        </div>
      </div>
    </div>

    <div
      class="info-title"
      v-show="mode==='text'">
      <i
        :class="(mode!=='text')?'meg-icon-caret-right': 'meg-icon-caret-bottom'"></i>
      <!-- 文字 -->
      {{ $t('文字') + ' (' + text.length + '/18)' }}
      <meg-button
        type="text"
        class="text-btn"
        v-show="mode==='text'"
        @click="paintText">
        {{ $t('确认使用') }}
      </meg-button><!-- 确认使用 -->
    </div>
    <div
      class="info-body image-text"
      :class="{'collapse':mode!=='text'}">
      <div>
        <meg-input
          class="text"
          v-model="text"
          :placeholder="$t('请输入文字')"
          :maxlength="18"
          @input="fontChange"
          @keydown.13="keydownTestFn"></meg-input><!-- 请输入文字 -->
      </div>
      <div>
        <!-- 字体 -->
        <label for="">{{ $t('字体') }}</label>
        <meg-select
          v-model="textFont"
          @change="fontChange">
          <meg-option
            v-for="item in fontOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </meg-option>
        </meg-select>
        <!-- 字号 -->
        <label for="">{{ $t('字号') }}</label>
        <meg-input-number
          v-model="fontSize"
          controls-position="right"
          @change="fontChange"
          :min="12"
          :max="200"></meg-input-number>
      </div>
      <div>
        <!-- 粗度 -->
        <label for="">{{ $t('粗度') }}</label>
        <meg-select
          v-model="fontWeight"
          @change="fontChange">
          <meg-option
            v-for="item in fontWeightOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </meg-option>
        </meg-select>
        <!-- 颜色 -->
        <label for="">{{ $t('颜色') }}</label>
        <meg-color-picker
          v-model="textColor"
          @change="fontChange"></meg-color-picker>
      </div>
    </div>
  </div>
</template>

<script>
import styleHorizontal from './style-images/horizontal.svg';
import styleVertical from './style-images/vertical.svg';
import stylePlaid from './style-images/plaid.svg';
import stylePot from './style-images/spot.svg';
import styleNo from './style-images/no.svg';

const styleImages = {
  horizontal: styleHorizontal,
  vertical: styleVertical,
  plaid: stylePlaid,
  spot: stylePot,
  no: styleNo,
};
export default {
  props: {
    eventBus: {
      type: Object,
      default() {
        return null;
      }
    },
    mode: {
      type: String,
      default() {
        return '';
      }
    }
  },
  data() {
    return {
      // 当前激活的canvas
      canvName: '',
      // 宽高
      height: 10,
      width: 10,
      // 画笔半径
      penRValue: 10,
      // 画笔颜色
      penColor: '#53A1D9',
      // 衣服颜色
      color1: '',
      colorList1: ['#000', '#313131', '#898989', '#bfbfbf', '#fff'],
      colorList2: ['#a40000', '#e60110', '#6b3907', '#ceaa71', '#005e14', '#009944', '#012d72', '#0068b6', '#450062', '#690160', '#eb6941', '#f29a76', '#f8b553', '#fff106', '#14b5b1', '#cce199', '#05b6ed', '#7fcef4', '#8857a1', '#c490bf'],
      styleValue: '',
      styleImages,
      styleOptions: [{
        value: 'horizontal',
        label: '横条', // i18n 这个文字只是实例，不会显示，不用国际化
        src: styleImages.horizontal
      }, {
        value: 'vertical',
        label: '竖条',
        src: styleImages.vertical
      }, {
        value: 'plaid',
        label: '格子',
        src: styleImages.plaid
      }, {
        value: 'spot',
        label: '斑点',
        src: styleImages.spot
      }, {
        value: '',
        label: '无纹理',
        src: styleImages.no
      }],
      // 纹理半径
      RValue: 10,
      RDestance: 30,
      // 纹理颜色
      styleColor1: '#000',
      styleColor2: '#fff',
      // 默认纹理颜色
      defaultColor1: '#000',
      defaultColor2: '#fff',
      // 文字
      text: '',
      // 文字颜色
      textColor: '#000000',
      // 字体
      textFont: 'SimHei',
      // 字体选项
      fontOptions: [{
        value: 'SimHei',
        label: this.$t('黑体') // '黑体'
      }, {
        value: 'Microsoft YaHei',
        label: this.$t('微软雅黑') // '微软雅黑'
      }, {
        value: 'SimSun',
        label: this.$t('宋体') // '宋体'
      }, {
        value: 'NSimSun',
        label: this.$t('新宋体') // '新宋体'
      }, {
        value: 'KaiTi',
        label: this.$t('楷体') // '楷体'
      }],
      // 字号
      fontSize: 30,
      // 字体加粗
      fontWeight: 'normal',
      // 字体加粗选项
      fontWeightOptions: [{
        value: 'normal',
        label: this.$t('常规') // '常规'
      }, {
        value: 'bold',
        label: this.$t('加粗') // '加粗'
      }]

    };
  },
  computed: {
  },
  watch: {
  },
  beforeMount() {
  },
  mounted() {
    // 获取图层的基本信息 （大小 ，染色颜色，位置等）
    this.eventBus.$on('emitImageInfo', (obj) => {
      console.log(obj);
      this.width = obj.width;
      this.height = obj.height;
      this.color1 = obj.color1;
      this.styleValue = obj.type;
      this.styleColor1 = obj.color1 || this.defaultColor1;
      this.styleColor2 = obj.color2 || this.defaultColor2;
      this.RValue = obj.sWidth;
      this.RDestance = obj.distance;
      this.canvName = obj.canvName;
    });
    // 重置基本信息
    this.eventBus.$on('resetImageInfo', () => {
      this.eventBus.$emit(
        'emitImageInfo',
        { // 当前激活的canvas
          canvName: '',
          // 宽高
          height: 10,
          width: 10,
          color1: '',
          // 纹理半径
          RValue: 10,
          RDestance: 30
        }
      );
    });
    this.$nextTick(() => {
      this.penChange(); // 将初始化的值传过去。
    });
  },
  methods: {
    /**
     * 改变大小
    */
    changeSize() {
      console.log(this.canvName);
      if (this.canvName !== global.layerNames[0]) {
        this.eventBus.$emit(`changeSize_${this.canvName}`, this.width, this.height);
        clearInterval(this.changeTimer);
        this.changeTimer = setTimeout(() => {
          this.eventBus.$emit(`saveData_${this.canvName}`);
          this.eventBus.$emit(`saveHistory_${this.canvName}`);
        }, 600);
      }
    },
    /**
     * 颜色改变 （纯色）
    */
    imageColorChange(val, type) {
      if (type === 'history') { // 如果是点击最近颜色历史的情况
        if (this.mode === 'pen') { // 是画笔的情况
          this.penColor = val;
          this.penChange();
        } else { // 是上色的情况
          this.color1 = val;
          this.eventBus.$emit(`drawColor_${this.canvName}`, 'pure', val);
        }
      } else if (val) {
        this.eventBus.$emit(`drawColor_${this.canvName}`, 'pure', val);
      } else {
        console.log(val);
      }
    },
    /**
     * 画笔改变 大小 颜色
    */
    penChange() {
      console.log(this.penRValue, this.penColor);
      this.eventBus.$emit('penChange', this.penRValue, this.penColor);
    },
    /**
     * 纹理改变 颜色大小等数值
    */
    styleChange(val) {
      if (this.styleColor1 && this.styleColor2 && this.styleValue) { // 还需要加入半径 和 圆心距的判断
        this.eventBus.$emit(`drawColor_${this.canvName}`, this.styleValue, this.styleColor1, this.styleColor2, this.RValue, this.RDestance, 1, 1, 'fromsetting');
      } else {
        console.log(val);
      }
    },
    /**
     * 纹理改变 类型
    */
    changeStyleType(item) {
      this.styleValue = item.value;
      if (this.styleValue) {
        this.styleChange();
      } else {
        this.eventBus.$emit(`clearColor_${this.canvName}`);
      }
    },
    /**
     * 文字改变
    */
    fontChange() {
      this.eventBus.$emit('drawText', this.text, parseInt(this.fontSize, 10), this.textColor, this.fontWeight, this.textFont);
    },
    /**
     * 将文字绘制到会图层  确认使用
    */
    paintText() {
      this.text = '';
      this.eventBus.$emit('paintText');
    },
    /**
     * 测试
    */
    keydownTestFn(e) {
      console.log('1------------1', e);
    }
  }
};
</script>

<style scoped lang="scss">
  .settings-info-wrap{
    line-height: 34px;
    font-size: 12px;
    .info-title{
      height: 34px;
      padding-left: 20px;
      position: relative;
    }
    .info-body{
      padding: 5px 0;
      margin: 0 5px;
      padding-left: 30px;
      border-bottom: 1px solid #efefef;
      // max-height: 100px;
      // transition: max-height 0.5s ease;
      overflow: hidden;
    }
    .info-body.collapse{
      // height: 0;
      // padding-top: 0;
      // padding-bottom: 0;
      display: none;
    }
    .image-size{
      overflow: hidden;
      *{
        float: left;
        margin-bottom: 5px;
        margin-right: 5px;
      }

    }
    input[type='number']{
        width: 65px;
        height: 28px;
        margin-left: 5px;
        margin-right: 5px;
        padding-left: 5px;
      }
    .image-color{
      .meg-color-picker{
        display: block;
      }
      .colors{
        width: 230px;
        > div{
          line-height: 20px;
          overflow: hidden;
        }

      }
      .colors-title{
        margin: 8px 0 10px 0;
      }

      .color-item{
        box-sizing: border-box;
        float: left;
        height: 34px;
        width: 34px;
        margin: 0 10px 10px 0;
        cursor: pointer;
        border-radius: 2px;
      }
      .colors-small{
        .color-item{
          width: 14px;
          height: 14px;
          margin: 0 6px 6px 0;
        }
        .margin10{
          margin-right: 10px;
        }
      }
      .color-item:hover{
      }
    }
    .cover-style{
      span{
        vertical-align: middle;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center center;
        margin: 5px;
        cursor: pointer;
        width: 24px;
        height: 24px;
        display: inline-block;
        border: 1px solid #d2d6de;
        border-radius: 3px;
      }
      span:first-child{
        width: 40px;
        height: 40px;
      }
      span.active{
        border-color: #0b318f;
      }
    }
    .style-inputs, .image-text{
      > div{
        margin-top: 10px;
        // overflow: hidden;
        display: flex;
        > *{
          // float: left;
          margin-right: 5px;
        }
        > label{
          min-width: 36px;
        }
        .meg-slider{
          width: 100px;
          margin-left: 10px;
          height: 34px;
        }
      }
    }
    .image-text{
      position: relative;

      .text{
        width: 223px;
      }
      > div:first-child{
        margin-top: 0;
      }
      > div > label{
        min-width: 20px;
      }
    }

    .text-btn{
      position: absolute;
      right: 20px;
      top: 0px;
    }

  }
</style>
<style lang="scss">
.settings-info-wrap{
  .meg-input-number{
    width: 80px !important;
  }
  .meg-select{
    width: 80px !important;
  }
  .meg-color-picker__trigger{
    // height: 34px !important;
    // width: 54px !important;
  }
  .meg-input-number__increase, .meg-input-number__decrease{
    width: 17px;
  }
  .meg-input-number .meg-input__inner{
    padding-right: 28px;
  }
}
.meg-button--mini{
  }

</style>
