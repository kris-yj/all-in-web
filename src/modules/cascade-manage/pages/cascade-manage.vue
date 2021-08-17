<template>
  <div class="register-content">
    <register-tree
      :cascade-type="cascadeLevel"
      :main-node="mainNode"
      :sub-nodes="subNodes"
      :readonly="nodeReadonly"
      @node-add="onNodeAdd"
      @node-edit="onNodeEdit"
      @node-delete="onNodeDelete"
      @node-info="onNodeInfo"
      @register-code-gen="onRegisterCodeGen"
      @main-node-name-edit="onMainNodeNodeEdit">
    </register-tree>
    <node-handle-dialog
      v-if="nodeHandleDialogVisible"
      :node-info="curNodeInfo"
      :handle-type="curHandleType"
      :connect-status="nodeHandleConnectStatus"
      :register-code-parse-fn="registerCodeParseHandle"
      @handle-finish="onNodeHandleFinish"
      @connect-test="onNodeConnectTest">
    </node-handle-dialog>
    <node-info-dialog
      v-if="nodeInfoDialogVisible"
      :node-info="curNodeInfo"
      :connect-status="nodeHandleConnectStatus"
      @close="nodeInfoDialogVisible=false">
    </node-info-dialog>
  </div>
</template>
<script>
import RegisterTree from '../components/register-tree';
import NodeHandleDialog from '../components/node-handle-dialog';
import NodeInfoDialog from '../components/node-info-dialog';
import cascadeManageSvr from '../cascade-manage.service';

const mapStatus = (statusCode) => {
  if (statusCode === 1) return 'normal';
  if (statusCode === 0 || statusCode === 2) return 'exception';
  if (statusCode === 3) return 'delete';
  return 'exception';
};

const nodeConvert = (node) => ({
  nodeName: node.nodeName || '',
  nodeRegisterCode: node.token || '',
  nodeNumber: node.regId || '',
  coreVersion: node.coreVersion || '',
  status: mapStatus(node.connectStatus),
  ...node
});

export default {
  name: 'CascadeManage',
  components: { RegisterTree, NodeHandleDialog, NodeInfoDialog },
  data() {
    return {
      mainNode: {},
      subNodes: [],
      // 当前节点信息
      curNodeInfo: {},
      // 处理类型：create - 新建  edit - 编辑
      curHandleType: 'create',
      nodeHandleDialogVisible: false,
      nodeInfoDialogVisible: false,
      nodeHandleConnectStatus: null,
      cascadeLevel: 0,
      nodeReadonly: false
    };
  },
  created() {
    this.loopTimer = null;
    // 获取是否多级
    const cascadeLevel = this.$store.getters.systemByType('cascadeLevel');
    try {
      this.cascadeLevel = parseInt((cascadeLevel && cascadeLevel.value), 10);
    } catch (error) {
      console.warn(error.message);
      this.cascadeLevel = 1;
    }
    const isDual = this.$store.getters.systemByType('isDual').value;
    const dualType = this.$store.getters.systemByType('dualPlatformType').value;
    const cascadeSide = this.$store.getters.systemByType('cascadeCenterSide').value;
    if (isDual === 'true') {
      this.nodeReadonly = dualType !== cascadeSide;
    }
  },
  mounted() {
    this.updateMainNode();
    if (this.cascadeLevel === 1) { this.updateSubNodes(); }
  },
  beforeDestroy() {
    if (this.loopTimer) clearTimeout(this.loopTimer);
  },
  methods: {
    updateMainNode() {
      cascadeManageSvr.getCurrentNodeInfo().then((response) => {
        if (response.code === 0) {
          const {
            regId = '', coreVersion = '', nodeName = '', token = ''
          } = response.data || {};
          this.mainNode = {
            nodeName,
            nodeRegisterCode: token,
            nodeNumber: regId,
            coreVersion,
            ...response.data || {}
          };
        } else {
          this.$message({
            message: response.msg,
            type: 'error'
          });
        }
      });
    },
    updateSubNodes() {
      cascadeManageSvr.getSubNodeInfo().then((response) => {
        if (response.code === 0) {
          this.subNodes = (response.data || []).map(nodeConvert);
        } else {
          this.$message({ message: response.msg, type: 'error' });
        }
        if (this.loopTimer) clearTimeout(this.loopTimer);
        this.loopTimer = setTimeout(this.updateSubNodes, 1000 * 60 * 5);
      });
    },
    registerCodeParseHandle(registerCode, next) {
      cascadeManageSvr.decryptRegisterToken({
        token: registerCode
      }).then((response) => {
        if (response.code === 0) {
          const {
            regId, coreVersion, nodeIp, enabled
          } = response.data || {};
          next({
            nodeNumber: regId,
            coreVersion,
            nodeIp,
            enabled
          });
        } else {
          next({
            nodeNumber: '',
            coreVersion: '',
            nodeIp: '',
            enabled: false
          });
        }
      });
    },
    onNodeAdd() {
      this.curHandleType = 'create';
      this.nodeHandleDialogVisible = true;
    },
    onNodeEdit(index, nodeInfo) {
      this.curHandleType = 'edit';
      this.curNodeInfo = nodeInfo;
      this.curNodeInfo.index = index;
      this.nodeHandleConnectStatus = this.curNodeInfo.status === 'normal';
      this.nodeHandleDialogVisible = true;
    },
    onNodeDelete(index, nodeInfo) {
      this.$confirm(this.$t('删除节点会影响其他模块数据，是否继续？'), this.$t('删除节点'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
      }).then(() => {
        this.$set(this.subNodes, index, Object.assign(nodeInfo, { connectStatus: 3, status: 'delete' }));
        cascadeManageSvr.deleteRegisterNode({
          regId: nodeInfo.regId
        }).then((response) => {
          if (response.code === 0) {
            this.updateSubNodes();
          } else {
            this.$message({
              message: response.msg,
              type: 'error'
            });
          }
        });
      });
    },
    onNodeInfo(index, nodeInfo) {
      this.curNodeInfo = nodeInfo;
      this.curNodeInfo.index = index;
      this.nodeHandleConnectStatus = this.curNodeInfo.status === 'normal';
      this.nodeInfoDialogVisible = true;
    },
    onRegisterCodeGen(next) {
      cascadeManageSvr.getRegisterToken().then((response) => {
        if (response.code === 0) {
          next({
            success: true,
            token: response.data.token
          });
        } else {
          next({
            success: false,
            msg: response.msg
          });
        }
      });
    },
    onMainNodeNodeEdit(nodeInfo, newName, next) {
      cascadeManageSvr.modifyNodeName({
        regId: nodeInfo.regId,
        nodeName: newName
      }).then((response) => {
        if (response.code === 0) {
          this.$message({
            message: this.$t('节点名称修改成功'),
            type: 'success'
          });
          next({
            success: true
          });
        } else {
          next({
            success: false,
            msg: response.msg
          });
        }
      });
    },
    onNodeHandleFinish(handleStatus, handleType, nodeInfo) {
      if (handleStatus === 'confirm') {
        if (handleType === 'create') {
          cascadeManageSvr.addRegisterNode({
            nodeIp: nodeInfo.nodeIp,
            regId: nodeInfo.nodeNumber,
            token: nodeInfo.nodeRegisterCode,
            nodeName: nodeInfo.nodeName,
            coreVersion: nodeInfo.coreVersion
          }).then((response) => {
            if (response.code === 0) {
              const newNode = nodeConvert(response.data);
              this.subNodes.push(newNode);
              this.nodeHandleDialogVisible = false;
              this.nodeHandleConnectStatus = null;
            } else {
              this.$message({
                message: response.msg,
                type: 'error'
              });
            }
          });
        } else if (handleType === 'edit') {
          cascadeManageSvr.editRegisterNode({
            nodeIp: nodeInfo.nodeIp,
            regId: nodeInfo.nodeNumber,
            token: nodeInfo.nodeRegisterCode,
            nodeName: nodeInfo.nodeName,
            coreVersion: nodeInfo.coreVersion
          }).then((response) => {
            if (response.code === 0) {
              const newNode = nodeConvert(response.data);
              this.$set(this.subNodes, this.curNodeInfo.index, newNode);
              this.nodeHandleDialogVisible = false;
              this.nodeHandleConnectStatus = null;
            } else {
              this.$message({
                message: response.msg,
                type: 'error'
              });
            }
          });
        }
      } else {
        this.nodeHandleDialogVisible = false;
        this.nodeHandleConnectStatus = null;
      }
    },
    onNodeConnectTest(nodeInfo) {
      cascadeManageSvr.testNodeConnectStatus({
        regId: nodeInfo.regId
      }).then((response) => {
        if (response.code === 0) {
          this.nodeHandleConnectStatus = true;
        } else {
          this.nodeHandleConnectStatus = false;
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.register-content {
  height: 100%;
  overflow-y: auto;
}
</style>
