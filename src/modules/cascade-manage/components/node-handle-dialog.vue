<template>
  <meg-dialog
    :confirm-text="$t('保存')"
    :cancel-text="$t('取消')"
    :visible="true"
    :title="handleType === 'create'? $t('新建下级节点'):$t('编辑下级节点')"
    @close="onClickClose">
    <template>
      <div class="dialog-content">
        <meg-form
          ref="nodeInfoForm"
          style="width:400px"
          :model="info"
          :rules="rules"
          label-width="100px">
          <meg-form-item
            :label="$t('节点名称')"
            prop="nodeName">
            <meg-input
              maxlength="30"
              v-model="info.nodeName"></meg-input>
          </meg-form-item>
          <meg-form-item
            :label="$t('节点注册码')"
            prop="nodeRegisterCode">
            <meg-input
              class="register-code-input"
              type="textarea"
              rows="3"
              v-model="info.nodeRegisterCode">
            </meg-input>
          </meg-form-item>
          <meg-form-item
            :label="$t('节点编号')">
            <meg-input
              readonly
              disabled
              :placeholder="$t('自动获取')"
              v-model="nodeNumber">
            </meg-input>
          </meg-form-item>
          <meg-form-item
            :label="$t('特征版本号')">
            <meg-input
              readonly
              disabled
              :placeholder="$t('自动获取')"
              v-model="coreVersion">
            </meg-input>
          </meg-form-item>
          <meg-form-item
            :label="$t('连接状态')"
            v-if="handleType==='edit'">
            <div class="connect-input">
              <meg-button
                size="small"
                @click.stop="onClickConnectTest">
                {{ $t('连接检测') }}
              </meg-button>
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
          </meg-form-item>
        </meg-form>
      </div>
    </template>
    <template slot="footer">
      <meg-button
        @click="onClickConfirm"
        type="primary">
        {{ $t('保存') }}
      </meg-button>
      <meg-button @click="onClickCancel">
        {{ $t('取消') }}
      </meg-button>
    </template>
  </meg-dialog>
</template>
<script>

import _ from 'lodash';

const createRules = {
  nodeName: [
    { required: true, message: '节点名称', trigger: 'blur' },
    {
      min: 2, max: 30, message: '节点名称长度在2到30个字符', trigger: 'blur'
    }
  ],
  nodeRegisterCode: [
    { required: true, message: '请输入节点注册码', trigger: 'blur' }
  ]
};

const editRules = {
  nodeName: [
    { required: true, message: '请输入节点名称', trigger: 'blur' },
    {
      min: 2, max: 30, message: '节点名称长度在2到30个字符', trigger: 'blur'
    }
  ]
};

export default {
  name: 'NodeHandleDialog',
  props: {
    // 节点信息
    nodeInfo: {
      type: Object,
      default: () => ({})
    },
    // 处理类型
    handleType: {
      type: String,
      default: 'create'
    },
    // 连接状态
    connectStatus: {
      type: undefined,
      default: null
    },
    // 注册码解析方法
    registerCodeParseFn: {
      type: Function,
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
  watch: {
    'info.nodeRegisterCode': {
      handler() {
        this.registerCodeParse();
      }
    }
  },
  mounted() {
    if (this.handleType === 'edit') {
      const {
        nodeName = '', nodeRegisterCode = '', nodeNumber = '', coreVersion = '', nodeIp = '',
      } = this.nodeInfo;
      this.info = { nodeName, nodeRegisterCode, ...this.nodeInfo };
      this.nodeNumber = nodeNumber;
      this.coreVersion = coreVersion;
      this.nodeIp = nodeIp;
    }
  },
  created() {
    this.rules = this.handleType === 'create' ? createRules : editRules;
  },
  methods: {
    // 注册码解析，节流操作
    registerCodeParse: _.throttle(function () {
      if (this.registerCodeParseFn) {
        new Promise((resolve) => {
          this.registerCodeParseFn(this.info.nodeRegisterCode, resolve);
        }).then(({ nodeNumber = '', coreVersion = '', nodeIp = '' }) => {
          if (this.handleType === 'create' || (this.handleType === 'edit' && nodeNumber === this.nodeNumber)) {
            this.nodeNumber = nodeNumber;
            this.coreVersion = coreVersion;
            this.nodeIp = nodeIp;
          } else {
            this.$message({
              message: this.$t('节点编号不一致'),
              type: 'warning'
            });
          }
        });
      }
    }, 500, { trailing: true }),
    onClickConfirm() {
      this.$refs.nodeInfoForm.validate((valid) => {
        if (valid) {
          if (!this.nodeNumber) {
            this.$message({
              message: this.$t('{entity}不能为空', {
                entity: this.$t('节点编号')
              }),
              type: 'error'
            });
            return;
          }
          if (!this.coreVersion) {
            this.$message({
              message: this.$t('{entity}不能为空', {
                entity: this.$t('特征版本号')
              }),
              type: 'error'
            });
            return;
          }
          this.$emit('handle-finish', 'confirm', this.handleType, {
            ...this.nodeInfo,
            nodeName: this.info.nodeName,
            nodeRegisterCode: this.info.nodeRegisterCode,
            nodeNumber: this.nodeNumber,
            coreVersion: this.coreVersion,
            nodeIp: this.nodeIp
          });
        }
      });
    },
    onClickCancel() {
      this.$emit('handle-finish', 'cancel');
    },
    onClickClose() {
      this.$emit('handle-finish', 'cancel');
    },
    onClickConnectTest() {
      // 目前不能在编辑时进行校验，因此通过弹窗提示
      // if (!this.info.nodeRegisterCode) {
      //   this.$message({
      //     message: '测试连接时，注册码不能为空',
      //     type: 'error'
      //   });
      //   return;
      // }
      this.$emit('connect-test', this.nodeInfo);
      // this.$refs.nodeInfoForm.validateField(['nodeRegisterCode'], (message) => {
      //   if (!message) {
      //     this.$emit('connect-test', this.info.nodeRegisterCode);
      //   }
      // });
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

.register-code-input ::v-deep textarea {
  resize: none;
}
</style>
