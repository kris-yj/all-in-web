<template>
  <div
    class="resource-header"
    :class="{beta: isBeta}">
    <span>{{ title }}
      <span
        v-if="isBeta"
        class="beta-tag">beta</span>
      <meg-popover
        v-if="isBeta"
        placement="top-start"
        width="200"
        trigger="hover"
        :content="$t('受限于国标平台的网络运行环境，部分录像文件可能会解析失败，当解析失败时，请手动重试，若多次失败，请联系厂家技术支持或将录像文件从国标平台下载到本地后，应用“文件解析”功能完成解析工作。')">
        <meg-icon
          slot="reference"
          name="info"
          width="16"
          height="16"
          color="#21539b"></meg-icon>

      </meg-popover>
    </span>
    <span
      v-if="showResourceMonitor"
      class="resouce-monitor">{{ `${$t('预估剩余算力')}/${$t('总算力')}：${remainVideoPower}/${totalVideoPower}` }}</span>
  </div>
</template>
<script>
import ResourceHeaderSrv from './analysis-resource-header.service';

const timeoutValue = 2; // 资源状态刷新时间为2min

export default {
  name: 'AnalysisResourceHeader',
  props: {
    title: {
      type: String,
      default: '实时解析'
    },
    showResourceMonitor: {
      type: Boolean,
      default: true
    },
    isBeta: {
      type: Boolean,
      default: false
    }
  },
  data() {
    this.timeoutFunc = null;
    return {
      remainVideoPower: '0', // 剩余解析算力资源
      totalVideoPower: '0', // 所有解析算力资源
    };
  },
  created() {
    if (this.showResourceMonitor) {
      this.getLastResource();
    }
  },
  destroyed() {
    clearTimeout(this.timeoutFunc);
  },
  methods: {
    /**
     * @description 获取解析服务器资源使用情况
     */
    async getLastResource() {
      const { code, data = {} } = await ResourceHeaderSrv.getLastResouce();
      if (code === 0) {
        this.totalVideoPower = data.totalVideoPower;
        this.remainVideoPower = data.remainVideoPower;
        clearTimeout(this.timeoutFunc);
        this.timeoutFunc = setTimeout(this.getLastResource, timeoutValue * 60 * 1000);
      }
      return data;
    }
  }
};
</script>
<style lang="scss" scoped>
.resource-header{
  &.beta {
    .resouce-monitor{
      font-size: 12px;
      display: block;
      margin-left: 0;
      margin-top: 2px;
    }
  }
  .resouce-monitor{
    font-size: 14px;
    color: #A1A7B3;
    margin-left: 16px;
    font-weight: normal;
  }

  .beta-tag {
    background-color: #ED673E;
    color: #ffffff;
    width: 32px;
    height: 16px;
    border-radius: 2px;
    display: inline-block;
    font-size: 12px;
    line-height: 16px;
    text-align: center;
    position: relative;
    margin-right: 5px;
    top: -2px
  }
}
</style>
