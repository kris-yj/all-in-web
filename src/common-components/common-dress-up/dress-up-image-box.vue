<template>
  <div class="images-box">
    <meg-button
      class="expand-btn"
      type="text"
      @click="expandImages=!expandImages">
      <meg-icon
        name="arrow_hollow"
        color="#76828E"
        :dir=" expandImages ? 'left' : 'right' "></meg-icon>
    </meg-button>
    <div
      class="image-tabs"
      :class="{'expand':expandImages}">
      <meg-tabs
        tab-position="left"
        v-model="nowTab"
        @tab-click="tabClick()">
        <meg-tab-pane
          v-for="(itemWrap,key) in imageData"
          :key="key"
          :name="key"
          :label="tabNames_show[ tabNames.indexOf(key) ]">
          <!-- 由于每个tab内部也可能有多个类型，所以，先按类型遍历，然后再遍历每个类型内部的数据 -->
          <div
            class="item-wrap"
            v-for="(item) in itemWrap"
            :key="item.layerName">
            <div
              class="item-title"
              v-show="itemWrap.length>1">
              <i
                :class="collapseObj[item.layerName]?'meg-icon-caret-bottom': 'meg-icon-caret-top'"
                @click="collapseObj[item.layerName] = !collapseObj[item.layerName]"></i>
              <span @click="tabClick(item.layerName)">{{ layerNames_show[layerNames.indexOf(item.layerName)] }}</span>
            </div>
            <div
              class="item-content"
              v-show="!collapseObj[item.layerName]">
              <div
                class="item"
                @click="clearChoose(item.layerName)">
                <img
                  :src="require('./pointer/noimages.svg')"
                  :alt="&quot;&quot;" />
              </div>
              <div
                v-for="(imgItem, index) in item.imgArr"
                :key="index"
                :class="{'active': (imgItem.name===nowImageName && item.layerName===nowlayer), 'selected': (nowImageInLayer[item.layerName]===imgItem.name && item.layerName!==nowlayer) }"
                class="item"
                @click="rechoose(imgItem, imgItem.name, item.layerName, key)">
                <img
                  :src="imgItem.src"
                  :alt="&quot;&quot;" />
              </div>
            </div>
          </div>
        </meg-tab-pane>
      </meg-tabs>
    </div>

    <div
      class="mask"
      v-show="mode!=='hand'"></div>
  </div>
</template>

<script>

import images from './image-data';

images.canvas_bag2 = images.canvas_bag;
images.canvas_bag3 = images.canvas_bag;
images.canvas_scarf2 = images.canvas_scarf;
export default {
  props: {
    // 当前编辑类型
    mode: {
      type: String,
      default() {
        return '';
      }
    },
    eventBus: {
      type: Object,
      default() {
        return null;
      }
    }
  },
  data() {
    return {
      // 正背面筛选
      checkBack: false,
      // 所有的图片
      images,
      // 确定图层顺序，越靠前越底层
      layerNames: global.layerNames,
      // 一个类型里有多种类型，所以加了这个数组来。
      tabNames: ['canvas_hair', 'canvas_hat', 'canvas_shirt,canvas_dress', 'canvas_pants', 'canvas_coat', 'canvas_shoesL,canvas_shoesR', 'canvas_bag', 'canvas_glasses,canvas_scarf,canvas_scarf2', 'canvas_mask'],
      tabNames_show: ['发型', '帽子', '上衣', '下衣', '外套', '鞋', '包', '配饰', '特殊'], // i18n: this.$t('DRESSUP.TAB_NAMES'),
      // 每个图层（素材归属）对应的名称
      layerNames_show: global.layerNames_show,
      // 当前选中的tab
      nowTab: 'canvas_hair',
      // 当前选中的类型
      nowlayer: 'canvas_hair',
      // 当前选中的图片
      nowImageName: '',
      // 类型和图片对应的map
      nowImageInLayer: {},
      // 是否展开服饰选择
      expandImages: true,
      // 用于记录每个item展开收起的状态 （由于数组层级太多，在内部每个item上标记不易更新视图）
      collapseObj: {}
    };
  },
  computed: {
    imageData() {
      const myImages = {};
      this.tabNames.forEach((item) => {
        let nowLength = 0;
        //   对 正面和 背面进行筛选
        const layers = item.split(',');
        console.log(layers);
        const myNewItemWrap = [];

        layers.forEach((layerName) => {
          const myNewItem = [];
          const myItem = this.images[layerName];

          if (this.checkBack) { // 选择了背面
            myItem.forEach((item2) => {
              if (item2.name.indexOf('-back') !== -1) {
                myNewItem.push(item2);
              }
            });
          } else { // 显示正面
            myItem.forEach((item2) => {
              if (item2.name.indexOf('-back') === -1) {
                myNewItem.push(item2);
              }
            });
          }
          myNewItemWrap.push({
            layerName, // layer的名称 比如：左鞋  右鞋
            imgArr: myNewItem
          });
          if (myNewItem.length > 0) {
            nowLength += 1;
          }
        });

        // myImages[item] = this.images[item];
        if (nowLength) {
          myImages[item] = myNewItemWrap;
        }
      });

      return myImages;
    },
    // 当前tab中，被使用了的素材
    // selctedImages() {
    //   const obj = {};
    //   if (this.nowTab.indexOf(this.nowlayer) !== -1) {
    //     this.nowTab.split(',').forEach((layer) => {
    //       const nowImageName = this.nowImageInLayer[layer];
    //       console.log('1----', layer, nowImageName);
    //       if (nowImageName && layer !== this.nowlayer) {
    //         obj[layer + nowImageName] = true;
    //       } else {
    //         // obj[layer + nowImageName] = false;
    //       }
    //     });
    //   }

    //   return obj;
    // }
  },
  watch: {
  },
  beforeMount() {
  },
  mounted() {
    global.layerNames.forEach((item) => {
      this.$set(this.collapseObj, item, false);
    });

    // 当选中了某个模板的时候 渲染模板
    this.eventBus.$on('selcetOneTemplate', (templateItem) => {
      global.modelName = templateItem.images[0].imgname;
      if (global.modelName.indexOf('-back') !== -1) {
        this.checkBack = true;
      }

      templateItem.images.forEach((item, index) => {
        console.log(item, index);
        if (!item) {
          // 改图层没有数据。
        // } else if (item.layer === global.layerNames[0]) { // 模特
        //   this.rechoose({
        //     name: item.imgname,
        //     src: item.imgsrc
        //   }, 0, item.layer);
        } else if (item.layer === 'paintLayer') { // 画笔层
          const img = new Image();
          img.width = item.width;
          img.height = item.height;
          img.onload = () => {
            const canv = document.getElementById('paintLayer');
            const ctx = canv.getContext('2d');
            ctx.drawImage(img, 0, 0, canv.width, canv.height); // 先绘制到paintLayer上
            this.eventBus.$emit(`saveHistory_${item.layer}`); // 保存一下历史记录
          };
          img.src = item.imgsrc;
        } else { // 其他有类容层
          const img = new Image();
          img.src = item.imgsrc;
          item.oriImg = img;
          this.eventBus.$emit(`addVirtualHistory_${item.layer}`, item); // 添加两次，以形成两次记录，可后退
          this.eventBus.$emit(`addVirtualHistory_${item.layer}`, null);
          this.eventBus.$emit(`cancelHistory_${item.layer}`); // 再回退以实现绘制
          this.eventBus.$emit(`resetHistory_${item.layer}`);
          this.eventBus.$emit('allHistoryChange', item.layer); // 在总的历史记录中添加一下，以实现可以回退
          // 把服饰信息添加到素材选择存档中
          this.nowImageName = item.imgname;
          this.$set(this.nowImageInLayer, item.layer, item.imgname);
          // this.nowImageInLayer[item.layer] = item.imgname;

          // this.eventBus.$emit('allHistoryChange', item.layer);
        }
      });
    });

    // 切换当前选中的tab和服饰
    this.eventBus.$on('changeTab', (layer) => {
      // console.log(layer, this.tabNames, this.nowImageInLayer);
      if (!layer || global.layerNames[0] === layer) {
        this.nowImageName = '';
      } else {
        this.tabNames.forEach((item) => {
          if (item.indexOf(layer) !== -1) {
            this.nowTab = item;
          }
        });
        this.nowlayer = layer;
        const nowImageName = this.nowImageInLayer[layer];
        if (nowImageName) {
          this.nowImageName = nowImageName;
        } else {
          this.nowImageName = '';
        }
      }
    });
    // 清除当前选中项
    this.eventBus.$on('deleteTabImage', () => {
      this.$set(this.nowImageInLayer, this.nowlayer, '');
      // this.nowImageInLayer[this.nowlayer] = '';
      this.nowImageName = '';
    });
    // 改变当前选中的素材记录
    this.eventBus.$on('changeImagesSelected', (layer, imgname) => {
      console.log(layer, imgname);
      this.nowImageName = imgname;
      this.$set(this.nowImageInLayer, layer, imgname);
      // this.nowImageInLayer[layer] = imgname;
    });
  },
  methods: {
    /**
     * 清除当前项
     */
    clearChoose(layerName) {
      console.log(layerName);
      if (layerName && (this.nowImageName !== '')) { // 由于删除动作是双向的，所以删除动作都放到dressUp中做，然后重置当前选中项的操作再emit回来
        this.eventBus.$emit('deleteImage', layerName);
      }
    },
    /**
     * 选择图片
     */
    rechoose(imgItem, nowImageName, layerName, tabName) {
      this.nowImageName = nowImageName;
      this.nowlayer = layerName;
      this.$set(this.nowImageInLayer, layerName, nowImageName);
      console.log(imgItem, nowImageName, layerName, tabName);
      const img = new Image();
      img.src = imgItem.src;
      img.onload = () => {
        this.eventBus.$emit(`changeImg_${layerName}`, img, imgItem.name);
        this.eventBus.$emit('changeLayer', layerName);
        this.eventBus.$emit(`saveHistory_${layerName}`, 'rechooseDress');
      };
      return false;
    },
    /**
     * 切换类型tab
     */
    tabClick(layer) {
      // this.nowTab = tab.name;
      // if (layer) { // 这里先注释掉了，先取消 selectetImages 的判断
      //   let ifChange = false;
      //   Object.keys(this.selctedImages).forEach((item) => {
      //     if (item.indexOf(layer) !== -1 && this.selctedImages[item]) {
      //       ifChange = true;
      //     }
      //   });
      //   if (!ifChange) {
      //     return false;
      //   }
      // }
      this.nowlayer = layer || this.nowTab.split(',')[0];
      const nowImageName = this.nowImageInLayer[this.nowlayer];
      console.log(nowImageName, this.nowTab, this.nowlayer, this.nowImageInLayer[this.nowlayer], this.nowImageInLayer);
      if (nowImageName || nowImageName === 0) {
        this.nowImageName = nowImageName;
        this.eventBus.$emit('changeLayer', this.nowlayer);
      } else {
        this.nowImageName = '';
      }
      return false;
    }
  }
};
</script>

<style scoped lang="scss">
  .images-box{
    position: relative;
    height: 100%;
    .mask{
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      cursor: not-allowed;
    }
    > .expand-btn{
      position: absolute;
      left: 0;
      bottom: 0;
      padding: 0 26px;
      height: 50px;
      width: 68px;
      z-index: 999;
      border: none;
    }
    > .image-tabs{
      width: 66px;
      transition: all 0.2s ease-in;
      // overflow-y: scroll;
      height: 100%;
    }
    > .image-tabs.expand{
      width: 400px;
    }

    .meg-tab-pane{
      overflow-y: auto;
      width: 334px;
      height: 100%;
    }
    .item-content{
      overflow: hidden;
      // padding-left: 10px;
    }
    .item-title{
      height: 34px;
      line-height: 34px;
      background: #fff;
      padding-left: 20px;
      margin-bottom: 1px;
      > span{
        cursor: pointer;
      }
      > i{
        cursor: pointer;
        float: right;
        padding: 10px;
      }

    }
    .item{
      width: 134px;
      height: 134px;
      margin: 10px 0 8px 18px;
      padding: 0px;
      // border: 1px solid #d1d5dd;
      border: 2px solid transparent;
      float: left;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #fff;
      cursor: pointer;
      transition: all 0.3s ease;
      img{
        max-width: 60%;
        max-height: 90%;
      }
    }
    .item.active{
      border-color: #388cf2;
    }
    .item.selected{
      border-color: rgb(209, 213, 221);
    }
    .item:hover{
      transform: translate(0, -3px);
      box-shadow: 0px 10px 20px rgba(34, 52, 109, 0.25);
    }
    .check-back-box{
      text-align: right;
      padding-right: 20px;
    }
  }
</style>
<style lang="scss">
  .dress-wrap .images-box{
    .meg-tabs__item{
    padding: 0 20px;
    height: 50px;
    line-height: 50px;
    color: #435068;
    text-align: center;
    }
    .meg-tabs__item.is-active{
      font-weight: bold;
      color: #21539b;
      background: #f3f3f3;
    }
    .meg-tabs--left .meg-tabs__active-bar.is-left{
      left: 0;
      right: auto;
      width: 4px;
      height: 50px !important;
    }
    .meg-tabs--left .meg-tabs__header.is-left{
      background: #fff;
      margin-right: 0;
    }
    .meg-tabs--left, .meg-tabs__content{
      height: 100%;
    }
  }
</style>
