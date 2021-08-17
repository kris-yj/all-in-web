<template>
  <meg-dialog
    :visible="true"
    :title="$t('节点信息')"
    body-height="300px"
    width="700px"
    @close="onClickClose">
    <template v-slot:header-content>
    </template>
    <template>
      <div class="dialog-content">
        <div class="info-container">
          <div class="info-item">
            <div class="info-key">
              {{ $t('节点名称') }}
            </div>
            <div class="info-value">
              {{ info.nodeName }}
            </div>
          </div>
          <div class="info-item">
            <div class="info-key">
              {{ $t('节点编号') }}
            </div>
            <div class="info-value">
              {{ nodeNumber }}
            </div>
          </div>
          <div class="info-item">
            <div class="info-key">
              {{ $t('特征版本号') }}
            </div>
            <div class="info-value">
              {{ coreVersion }}
            </div>
          </div>
          <div class="info-item">
            <div class="info-key">
              {{ $t('连接状态') }}
            </div>
            <div class="info-value">
              <div class="connect-input">
                <div
                  class="connect-status"
                  v-show="connectStatus !== null">
                  <meg-icon
                    :name="connectStatusIcon"
                    :color="connectStatusColor"
                    width="14px"
                    height="14px"></meg-icon>
                  <span
                    style="margin-left:5px"
                    :style="{color:connectStatusColor}">{{ connectStatusTip }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </meg-dialog>
</template>
<script>

export default {
  name: 'NodeInfoDialog',
  props: {
    // 节点信息
    nodeInfo: {
      type: Object,
      default: () => ({})
    },
    // 连接状态
    connectStatus: {
      type: undefined,
      default: null
    }
  },
  data() {
    return {
      info: {
        // 节点名称
        nodeName: '',
        // 节点注册码
        nodeRegisterCode: ''
      },
      // 节点编号
      nodeNumber: '',
      // 特征版本号
      coreVersion: '',
      // 节点ip 解析获取
      nodeIp: ''
    };
  },
  computed: {
    connectStatusIcon() {
      return this.connectStatus ? 'success' : 'mission_failed_pink';
    },
    connectStatusColor() {
      return this.connectStatus ? 'green' : 'red';
    },
    connectStatusTip() {
      return this.connectStatus ? this.$t('连接成功') : this.$t('连接失败，请重新验证');
    }
  },
  mounted() {
    const {
      nodeName = '', nodeRegisterCode = '', nodeNumber = '', coreVersion = '', nodeIp = '',
    } = this.nodeInfo;
    this.info = { nodeName, nodeRegisterCode, ...this.nodeInfo };
    this.nodeNumber = nodeNumber;
    this.coreVersion = coreVersion;
    this.nodeIp = nodeIp;
  },
  methods: {
    onClickClose() {
      this.$emit('close');
    }
  }
};
</script>
<style lang="scss" scoped>
.dialog-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.info-container {
  display: flex;
  width: 400px;
  flex-direction: column;
  align-items: stretch;

  .info-item {
    flex: 1 1 50px;
    display: flex;
    align-items: center;

    .info-key {
      flex: 0 0 80px;
      display: flex;
      justify-content: flex-end;
      font-size: 13px;
      color: #869abb;
    }

    .info-value {
      padding-left: 20px;
      flex: 1 0 200px;
      justify-content: flex-start;
    }
  }
}

.connect-input {
  display: flex;
  justify-content: space-between;
  flex-direction: row-reverse;
  align-items: center;
  height: 40px;

  .connect-status {
    width: 100%;
    height: 40px;
    line-height: 40px;
  }
}
</style>
