<template>
  <div class="template-wrap">
    <div class="list-head">
      <div>
        <!-- 画像检索 -->
        {{ $t('画像检索') }}
      </div>
      <div>
        <meg-radio-group
          v-model="activeType"
          @change="activeTypeChange">
          <meg-radio-button
            v-for="(item, index) in typeArr"
            :label="item.value"
            :key="index">
            {{ item.label }}
          </meg-radio-button>
        </meg-radio-group>
      </div>
      <meg-button
        class="guide-btn"
        @click="showGuide = true">
        {{ $t('使用说明') }}
      </meg-button><!-- 使用说明 -->
    </div>
    <meg-card-frame
      class="templates"
      :card-min-width="206">
      <div
        v-for="(item, index) in showTemplats"
        :key="index"
        class="one-template"
        @click="selcetOneTemplate(item)">
        <div class="img">
          <img :src="item.url" />
          <div class="handdle-btns">
            <!-- i18n: 检索 -->
            <meg-tooltip
              :content="$t('检索')"
              placement="top"
              effect="dark">
              <meg-button
                v-show="activeType===1"
                @click.stop="searchOneTemplate(item)">
                <meg-icon
                  name="mission_search"></meg-icon>
              </meg-button>
            </meg-tooltip>
            <!-- i18n: 下载 -->
            <meg-tooltip
              :content="$t('下载')"
              placement="top"
              effect="dark">
              <meg-button
                v-show="activeType===1"
                @click.stop="downloadOneTemplate(item)">
                <meg-icon
                  name="download_task"></meg-icon>
              </meg-button>
            </meg-tooltip>
            <!-- i18n: 编辑 -->
            <meg-tooltip
              :content="$t('编辑')"
              placement="top"
              effect="dark">
              <meg-button
                @click.stop="selcetOneTemplate(item)">
                <meg-icon
                  name="edit_photo"></meg-icon>
              </meg-button>
            </meg-tooltip>
          </div>

          <meg-popover
            placement="top"
            width="160"
            v-model="item.deleteShow">
            <!-- 删除后将不可恢复，确定删除吗？ item.deleteShow = false-->
            <p>{{ $t('删除后将不可恢复，确定删除吗？') }}</p>
            <div style="text-align: right; margin: 0">
              <meg-button
                size="mini"
                type="text"
                @click="$set(item, 'deleteShow', false);">
                {{ $t('取消') }}
              </meg-button><!-- 取消 -->
              <meg-button
                type="primary"
                size="mini"
                @click="deleteOneTemplate(item)">
                {{ $t('确定') }}
              </meg-button><!-- 确定 -->
            </div>
            <!--
              v-show="item.id" -->
            <meg-button
              slot="reference"
              class="delete-btn"
              v-show="item.id || item.indexId"
              @click.stop="deleteTipsShow(item)">
              <meg-icon
                name="mission_del"></meg-icon>
            </meg-button>
          </meg-popover>
        </div>
        <div
          class="text"
          v-if="!item.id && !item.indexId">
          {{ baseTemplatesNames[index] }}
        </div>
        <div
          class="text"
          v-else>
          {{ item.name }}
        </div>
      </div>
    </meg-card-frame>
    <meg-dialog
      :visible="showGuide"
      width="800px"
      body-height="540px"
      :show-footer="false"
      :append-to-body="true"
      :title="$t('使用说明')"
      @close="showGuide = false">
      <div
        class="main-container">
        <div
          v-show="showGuide"
          class="guide-box">
          <!-- <meg-card shadow="never"> -->
          <p
            v-for="(text, index) in guideText"
            :key="text"
            class="text item">
            {{ index+1+'、'+text }}
          </p>

          <meg-button
            style="padding: 20px 0"
            type="text"
            @click="resetStorage">
            {{ $t('恢复设置') }}
          </meg-button>
          <!-- 恢复设置 -->
          <!-- </meg-card> -->
        </div>
      </div>
    </meg-dialog>
  </div>
</template>

<script>
import { imgSizeInfo } from './image-data';
import modelMan from './images/model/man-front.png';
import modelMan2 from './images/model/man-front-2.png';
import modelWoman from './images/model/woman-front.png';
import modelWoman2 from './images/model/woman-front-2.png';
import modelBoy from './images/model/boy-front.png';
import modelBoy2 from './images/model/boy-front-2.png';
import modelGirl from './images/model/girl-front.png';
import modelGirl2 from './images/model/girl-front-2.png';

import modelManBack from './images/model/man-back.png';
import modelManBack2 from './images/model/man-back-2.png';
import modelWomanBack from './images/model/woman-back.png';
import modelWomanBack2 from './images/model/woman-back-2.png';
import modelBoyBack from './images/model/boy-back.png';
import modelBoyBack2 from './images/model/boy-back-2.png';
import modelGirlBack from './images/model/girl-back.png';
import modelGirlBack2 from './images/model/girl-back-2.png';

const baseTemplates = [
  {
    url: modelMan,
    // name: '男',
    images: [
      {
        imgname: 'man.png',
        imgsrc: modelMan2,
        layer: 'canvas_model',
        px: 190,
        py: 70,
        height: 600,
        width: 207
      }
    ]
  }, {
    url: modelWoman,
    // name: '女',
    images: [
      {
        imgname: 'woman-front.png',
        imgsrc: modelWoman2,
        layer: 'canvas_model',
        px: 190,
        py: 70,
        height: 600,
        width: 207
      }
    ]
  }, {
    url: modelBoy,
    // name: '男孩',
    images: [
      {
        imgname: 'z_boy-front.png',
        imgsrc: modelBoy2,
        layer: 'canvas_model',
        px: 190,
        py: 125,
        height: 560,
        width: 193
      }
    ]
  }, {
    url: modelGirl,
    // name: '女孩',
    images: [
      {
        imgname: 'z_girl-front.png',
        imgsrc: modelGirl2,
        layer: 'canvas_model',
        px: 190,
        py: 125,
        height: 560,
        width: 193
      }
    ]
  }, {
    url: modelManBack,
    // name: '男-背',
    images: [
      {
        imgname: 'man-back.png',
        imgsrc: modelManBack2,
        layer: 'canvas_model',
        px: 190,
        py: 70,
        height: 600,
        width: 207
      }
    ]
  }, {
    url: modelWomanBack,
    // name: '女-背',
    images: [
      {
        imgname: 'woman-back.png',
        imgsrc: modelWomanBack2,
        layer: 'canvas_model',
        px: 190,
        py: 90,
        height: 600,
        width: 207
      }
    ]
  }, {
    url: modelBoyBack,
    // name: '男孩-背',
    images: [
      {
        imgname: 'z_boy-back.png',
        imgsrc: modelBoyBack2,
        layer: 'canvas_model',
        px: 190,
        py: 125,
        height: 560,
        width: 193
      }
    ]
  }, {
    url: modelGirlBack,
    // name: '女孩-背',
    images: [
      {
        imgname: 'z_girl-back.png',
        imgsrc: modelGirlBack2,
        layer: 'canvas_model',
        px: 190,
        py: 125,
        height: 560,
        width: 193
      }
    ]
  }
];

export default {
  props: {
    eventBus: {
      type: Object,
      default() {
        return null;
      }
    },
    addTemplates: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      templates: baseTemplates,
      baseTemplatesNames: ['男', '女', '男孩', '女孩', '男-背', '女-背', '男孩-背', '女孩-背'],
      // 使用说明中的文字
      guideText:
      [
        'delete键可以删除选中的服饰',
        '历史记录最多保留20步',
        'ctrl+z键  撤销',
        'ctrl+shift+z键  重做',
        '所有服饰的位置，会根据个人操作储存，并可以通过点击本页下的 “恢复设置” 以恢复系统原位置数据',
      ],
      activeType: 0,
      typeArr: [{
        label: this.$t('模板'), // '模板'
        value: 0,
      }, {
        label: this.$t('最近'), // '最近',
        value: 1
      }],
      /**
       * 切换类型
      */
      activeTypeChange() {
        // this.getList();
      },
      // 显示使用说明
      showGuide: false,
      historyTemplates: []
    };
  },
  computed: {
    showTemplats() {
      let tmps = this.templates;
      if (this.activeType === 1) {
        tmps = this.historyTemplates;
      }
      return tmps;
    }
  },
  watch: {
    addTemplates(val) {
      this.templates = baseTemplates.concat(val);
    }
  },
  beforeMount() {
    // 去获取 本地保存的草稿
    this.getdressUpHistory();
  },
  mounted() {
  },
  methods: {
    /**
     * 选中一个模板
    */
    selcetOneTemplate(templateItem) {
      // 这里出现了个无法定位原因的问题，保存模板的时候，模特图层没被保存，导致images[0].imagname报错，这里使用判断的方式兼容了，防止重现
      if (templateItem.images && templateItem.images[0] && templateItem.images[0].imgname) {
        this.eventBus.$emit('selcetOneTemplate', templateItem);
      } else {
        this.$message.error('此模板数据异常，请删除');
      }
    },
    /**
     * 重置缓存数据
    */
    resetStorage() {
      localStorage.setItem('imgSizeInfo', JSON.stringify(imgSizeInfo));
      this.$message.success(this.$t('重置成功')); // 重置成功
    },
    /**
     * 查询
    */
    searchOneTemplate(item) {
      this.eventBus.$emit('searchOneTemplate', item);
    },
    /**
     *  点击删除图标，显示删除提示
    */
    deleteTipsShow() {
      // this.templates.forEach((item) => {
      //   if (item.deleteShow) {
      //     this.$set(item, 'deleteShow', false);
      //   }
      //   this.$set(template, 'deleteShow', true);
      // });
    },
    /**
     * 下载
    */
    downloadOneTemplate(item) {
      this.eventBus.$emit('base64Img', item.url);
    },
    /**
     * 去获取 本地保存的草稿
    */
    getdressUpHistory() {
      const indexArr = JSON.parse(localStorage.getItem('dressUpHistoryIndexArr'));
      const items = [];
      if (indexArr) {
        indexArr.forEach((item) => {
          const historyItem = localStorage.getItem(`dressUpHistory${item}`);
          if (historyItem) {
            items.push(JSON.parse(historyItem));
          }
        });
        this.historyTemplates = items;
        if (indexArr.length > 0) {
          this.activeType = 1;
        } else {
          this.activeType = 0;
        }
      }
    },
    /**
     * 删除一个模板
    */
    deleteOneTemplate(templateItem) {
      if (templateItem.id) { // 删除的是云端的模板
        this.eventBus.$emit('deleteOneTemplate', templateItem.id);
        this.$set(templateItem, 'deleteShow', false);
        // templateItem.deleteShow = false;
      } else { // 删除的是本地的草稿
        const { indexId } = templateItem;
        const indexArr = JSON.parse(localStorage.getItem('dressUpHistoryIndexArr'));
        indexArr.splice(indexArr.indexOf(indexId), 1);
        localStorage.setItem('dressUpHistoryIndexArr', JSON.stringify(indexArr));
        localStorage.removeItem(`dressUpHistory${indexId}`);

        this.getdressUpHistory();
      }
    },
  }
};
</script>

<style scoped lang="scss">
.template-wrap{
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.list-head{
  color: #435068;
  font-size: 16px;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 0 50px 0 20px;
}
.templates{
  flex: 1;
  padding:10px;
  overflow-y: auto;
}
.one-template{
  box-sizing: border-box;
  .img{
    position: relative;
    width: 100%;
    padding:0 0 133%;
    height:0;
    margin: 0 0 10px;
    background: #FFF;
    transition: all 0.3s ease;
  }
  .text{
    height: 18px;
    overflow: hidden;
  }
  img{
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    max-width: 100%;
    max-height: 100%;
  }
  .handdle-btns{
    position: absolute;
    bottom: 10px;
    right: 10px;
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 10;
  }
  .delete-btn{
    position: absolute;
    top: 10px;
    right: 10px;
    opacity: 0;
  }
}

.one-template .img:hover{
  transform: translate(0, -3px);
  box-shadow: 0px 10px 20px rgba(34, 52, 109, 0.25);
  .handdle-btns{
    opacity: 1;
  }
  .delete-btn{
    opacity: 1;
  }

}
.guide-btn{
  float: right;
  margin-right: 20px;
}
.guide-box{
  // position: absolute;
  // left: 0;
  // top: 0;
  // bottom: 0;
  // right: 0;
  // background: #fff;
  padding: 20px;
  font-size: 14px;
  p{
    line-height: 2em;
  }
  .meg-card{
        box-shadow: none;
  }
}
</style>

<style lang="scss">
.template-wrap{
  .one-template .meg-button{
    // border-radius: 70% !important;
    padding: 5px;
  }
}
</style>
