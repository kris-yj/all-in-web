import Service from './huixun-mixins.service';

// 当前产品要求写死的总可跳转列表（未经权限筛选）
const jumpList = [{
  alias: 'document',
  id: 'ef5bb4f5-a580-4f13-b92a-557c6759482d',
  name: '全息档案',
}, {
  alias: 'capture-search',
  id: '73ec9a60-e604-4613-bfe4-0cf3153ba842',
  name: '抓拍检索',
}];
/**
 * @description 自定义的慧寻双网全景图拉取函数
 * @param {Object} that 子组件的this，对目标子组件的值进行修改
 * @param {string} emptyImage 失败占位图
 * @param {string} loadingImg 加载过程占位图
 * @returns
 */
async function customFullImgHandler(that, emptyImage, loadingImg) {
  const originalUrl = this.info.fullUrl;
  if (!originalUrl) {
    return false;
  }
  if (originalUrl.includes('bremote---') || originalUrl.includes('remote://')) {
    that.$set(that.info, 'fullUrl', loadingImg);
    const photoCoreId = originalUrl.split('_insightCoreId_')[1];
    const preResult = await Service.emitRemoteFullImage({ photoCoreId });
    if (preResult.code === 0) {
      const result = await Service.fetchRemoteFullImage({ photoCoreId });
      if (result.code === 0) {
        that.$set(that.info, 'fullUrl', result.data.fullUrl);
      } else {
        this.$message.error(result.msg);
        that.$set(that.info, 'fullUrl', emptyImage);
      }
    } else {
      this.$message.error(preResult.msg);
      that.$set(that.info, 'fullUrl', emptyImage);
    }
  }
  return true;
}

export default {
  created() {
    // 所有代码，必须放在 isHuixun 判断里面，避免影响模块原来逻辑
    if (this.isHuiXun) {
      this.analyzeType = this.isBodySearchEnable ? [0, 1] : [0];
      this.background = this.isBodySearchEnable ? 'body' : 'face';
      this.otherThresholdText = '人体相似度';
      this.showHistoryRecord = false;
      this.otherThresholdHidden = !this.isBodySearchEnable;
      this.customTargetList = this.getJumpList(jumpList);
      this.sourceTypes = ['CAMERA'];
      this.listCardButtons = [];
      this.noTrackBtn = true;
      this.showTemporary = false;
      this.showFeedBack = false;
      this.showFullImgJump = false;
      this.showCompare = false;
      this.showPeer = false;
      this.showVideo = false;
      this.showExportButton = false;
      this.customFullImgHandler = customFullImgHandler;
    }
  },
  data() {
    return {
      // 当前系统是否为慧寻系统
      isHuiXun: this.$store.getters.systemByType('systemCode').value === 'wisdom',
      // 是否支持人体检索
      isBodySearchEnable: this.$store.getters.systemByType('body_enable').value === '1',
    };
  },
  methods: {
    /**
     * @description 获取经慧寻当前用户权限过滤的可跳转模块列表
     * @param {Array} 未经过滤的目标跳转模块列表
     */
    getJumpList(originalList) {
      const filterList = [];
      originalList.filter((item) => this.$store.getters.modulesByAlias(item.alias)).forEach((el) => {
        filterList.push({
          alias: el.alias,
          name: el.name,
          id: el.id
        });
      });
      return filterList;
    }
  }
};
