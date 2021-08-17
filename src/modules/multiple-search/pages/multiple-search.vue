<template>
  <page-layout>
    <div class="multiple-search__wrap">
      <div class="multiple-search__hearder">
        <outer-tab v-model="outerTabType"></outer-tab>
      </div>
      <div class="multiple-search__content-wrap">
        <div class="inner-tab__wrap">
          <inner-tab
            v-model="innerTabType"
            :items="innerTabItems"></inner-tab>
        </div>
        <div
          :class="['multiple-search__content', {'is-text-search': isTextSearch}]">
          <!-- 图片上传组件 -->
          <div
            class="multiple-search__img">
            <common-img-analysis
              :max-img-num="1"
              @output="imgAnalysisChange"
              ref="imgAnalysis"></common-img-analysis>
          </div>
          <!-- 检索条件 -->
          <div
            class="multiple-search__condition">
            <keep-alive>
              <component
                ref="searchCondition"
                :is="currentTabComponent"
                :is-text-search="isTextSearch"></component>
            </keep-alive>
          </div>
          <!-- 无检索权限提示 -->
          <div
            class="no-condition__tips"
            v-show="!currentTabComponent">
            <div>您无相关菜单权限，</div>
            <div>请联系系统管理员配置操作权限</div>
          </div>
        </div>
        <div class="multiple-search__confirm">
          <meg-button
            type="primary"
            :disabled="searchBtnDisabled"
            @click="searchClick">
            立即检索
          </meg-button>
        </div>
      </div>
      <footer-links
        class="multiple-search__footer"
        :outer-tab-type="outerTabType"
        :inner-tab-type="innerTabType"></footer-links>
    </div>
  </page-layout>
</template>

<script>
import { cloneDeep } from 'lodash';
import CommonImgAnalysis from '@/common-components/common-img-analysis';
import commonSwitchParams from '@/common-components/common-switch-params';
import OuterTab from '../components/outer-tab';
import InnerTab from '../components/inner-tab';
import FooterLinks from '../components/footer-links';

const moduleMap = {
  // 有图+抓拍
  'img-capture': 'capture-search',
  // 有图+底库
  'img-database': 'face-identity',
  // 有图+档案
  'img-document': 'document',
  // 无图+抓拍
  'text-capture': 'attribute-search',
  // 无图+底库
  'text-database': 'face-identity',
  // 无图+档案
  'text-document': 'document',
};

// 埋点 id map
const eventTrackMap = {
  // 有图+抓拍
  'img-capture': 'MultipleSearchPICObjectiveSearch',
  // 有图+底库
  'img-database': 'MultipleSearchPICDatabaseSearch',
  // 有图+档案
  'img-document': 'MultipleSearchPICDocumentSearch',
  // 无图+抓拍
  'text-capture': 'MultipleSearchNoPICObjectiveSearch',
  // 无图+底库
  'text-database': 'MultipleSearchNoPICDatabaseSearch',
  // 无图+档案
  'text-document': 'MultipleSearchNoPICDocumentSearch',
};
// tab 权限 map
const tabMap = {
  'document': {
    code: 'document',
    name: '人员档案',
  },
  'face-identity': {
    code: 'database',
    name: '人员底库',
  },
};

export default {
  components: {
    // 这类组件在未切换tab 的情况下可能用不到，改成异步的方式
    CaptureCondition: () => import('../components/capture-condition'),
    DocumentCondition: () => import('../components/document-condition'),
    DatabaseCondition: () => import('../components/database-condition'),
    OuterTab,
    InnerTab,
    FooterLinks,
    CommonImgAnalysis
  },
  data() {
    return {
      outerTabType: 'img',
      innerTabType: '',
      hasImage: false,
    };
  },
  computed: {
    isTextSearch() {
      return this.outerTabType === 'text';
    },
    currentTabComponent() {
      return this.innerTabType && `${this.innerTabType}-condition`;
    },
    searchBtnDisabled() {
      return !this.isTextSearch && !this.hasImage && this.innerTabType !== 'capture';
    },
    innerTabItems() {
      // 根据权限获取切换 tab
      const tabs = [...this.captureTabArr];
      Object.keys(tabMap).forEach((key) => {
        if (this.$store.getters.modulesByAlias(key)) {
          tabs.push(tabMap[key]);
        }
      });
      return tabs;
    },
    captureTabArr() {
      const tab = [];
      const permisson = this.$store.getters.modulesByAlias(this.isTextSearch ? 'attribute-search' : 'capture-search');
      console.log('获取到的抓拍权限', this.isTextSearch ? 'attribute-search' : 'capture-search', permisson);
      if (permisson) {
        tab.push({
          code: 'capture',
          name: '目标抓拍',
        });
      }
      return tab;
    }
  },
  watch: {
    innerTabItems: {
      handler(newVal, oldVal) {
        if (!newVal.length) {
          this.innerTabType = '';
          // 由于 tab 是动态生成的，在这里设置的默认 innerTab，要修改默认在这里修改，不要在 data 中改
          // 如果新生成的 tabs 里面没包含当前已经选择的 tab，则选择第一个
        } else if (!oldVal || !newVal.some((item) => item.code === this.innerTabType)) {
          this.innerTabType = newVal[0].code;
        }
      },
      immediate: true,
    }
  },
  created() {
  },
  methods: {
    /**
     * 上传图发生改变
     */
    imgAnalysisChange(images) {
      this.hasImage = images && images.length;
    },
    /**
     * 点击检索
     */
    searchClick() {
      const params = this.$refs.searchCondition && this.$refs.searchCondition.getCondion();
      if (!params) return;
      const fileList = cloneDeep(this.$refs.imgAnalysis.getFileList()) || [];
      const targetModule = moduleMap[`${this.outerTabType}-${this.innerTabType}`];
      // 有图检索
      if (!this.isTextSearch) {
        // 抓拍，但是没有传图片的情况
        if (!fileList.length && this.innerTabType === 'capture') {
          this.$confirm('您可以跳转至属性检索查看结果，或是上传图片并选择目标。', '图片输入为空', {
            confirmButtonText: '属性检索',
            cancelButtonText: '上传图片'
          }).then(() => {
            // 跳转到属性检索
            this.jumpToTarget(params, 'attribute-search');
          }).catch(() => {
          });
          return;
        }

        let warningText = '';
        if (this.innerTabType === 'capture') {
          const selectedImages = fileList[0].images.filter((item) => item.checked);
          // 这种情况应该不会出现，因为图上传组件必定有选择的目标，这里只是为了加强一下逻辑
          if (!selectedImages.length) {
            this.$message.warning('请选择目标');
            return;
          }
          // 约定为 fileList 字段
          params.fileList = fileList;
        }
        // 人员档案
        if (this.innerTabType === 'document') {
          warningText = '建议选择一张人脸图片，用于全息档案检索';
          // 约定为 fileList 字段
          params.fileList = fileList;
        }
        // 人员底库
        if (this.innerTabType === 'database') {
          warningText = '建议选择一张人脸图片，用于人脸身份检索';
          // 约定为 photo 字段
          params.photo = fileList;
        }

        // 遍历出人脸，以及选中的人脸
        const faceImages = fileList[0].images.filter((item) => item.detectType === 0);
        const selectedFaceImages = faceImages.filter((item) => item.checked);

        // 对于图片选择不合适的进行统一提示
        if (this.innerTabType === 'document' || this.innerTabType === 'database') {
          if (!faceImages.length) {
            this.$message.warning('当前图片中无人脸，请重新上传图片');
            return;
          }
          if (selectedFaceImages.length !== 1) {
            this.$message.warning(warningText);
            return;
          }
          // 只要人脸
          fileList[0].images = faceImages;
        }

        // 删除内部 base64，以便数据能 query 传递
        // fileList[0].images.forEach((item) => { img-container usefulFrame 属性在有些时候会出现裂图 暂时不使用
        //   delete item.base64;
        // });
        fileList[0].goAnalyze = false;
      }
      // 埋点请求
      this.eventTracking(eventTrackMap[`${this.outerTabType}-${this.innerTabType}`]);
      // 跳转
      this.jumpToTarget(params, targetModule);
    },
    /**
     * 跳转
     * @param { params } 跳转参数中的 data
     * @param { targetModule } 目标 module
     * @returns
     */
    jumpToTarget(params, targetModule) {
      const moduleInfo = {
        isBlank: true,
        pageType: 'single',
        module: targetModule,
      };
      moduleInfo.query = {
        data: params,
        from: 'multiple-search',
      };
      console.log(moduleInfo);
      new commonSwitchParams.FormatSwitchParams(moduleInfo).switchToModule();
    }
  }
};
</script>

<style lang="scss" scoped>
  .multiple-search__wrap{
    background: rgba(244, 242, 248, 1);
    min-height: 100%;
  }
  .multiple-search__hearder{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 66px;
  }
  .multiple-search__content-wrap{
    width: 860px;
    height: 526px;
    background: #fff;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    position: relative;
    .inner-tab__wrap{
      border-bottom: 1px solid rgba(210,214,222,0.4);
      padding: 7px 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .no-condition__tips{
      position: absolute;
      z-index: 1;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      div{
        margin-bottom: 6px;
      }
    }
  }
  .multiple-search__content{
    width: 860px;
    margin: 0 auto;
    height: 350px;
    display: flex;
    justify-content: space-evenly;
    box-sizing: border-box;
    padding-top: 30px;
    &.is-text-search{
      .multiple-search__img{
        display: none;
      }
      .multiple-search__condition{
        width: 100%;
      }
    }
  }
  .multiple-search__img{
    width: 320px;
    height: 320px;
  }
  .multiple-search__condition{
    width: 320px;
  }
  .multiple-search__confirm{
    height: 121px;
    display: flex;
    justify-content: center;
    align-items: center;
    .meg-button{
      width: 280px;
      height: 46px;
    }
  }
  @media screen and (min-width: 1910px) {
    .multiple-search__content-wrap{
      width: 1000px;
      height: 620px;
    }
    ::v-deep .links__wrap{
      width: 1012px;
    }
  }
</style>
