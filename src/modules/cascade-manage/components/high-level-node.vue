<template>
  <div class="outline">
    <div class="node-icon">
      <img
        class="node-icon-img"
        src="@/assets/images/cascade/main-node.svg"
        alt="main-node" />
    </div>
    <div class="node-name">
      <div
        v-show="!isEditing"
        class="node-name__display">
        <span style="margin-right:10px">{{ nodeInfo.nodeName }}</span>
        <meg-icon
          class="node-name-edit__icon"
          style="cursor:pointer"
          v-if="!readonly"
          name="edit_photo"
          width="13px"
          height="13px"
          @click.stop="onClickEditName"></meg-icon>
      </div>
      <div
        v-show="isEditing"
        class="node-name__edit">
        <meg-input
          ref="nameEditInput"
          type="text"
          minlength="2"
          maxlength="30"
          :clearable="false"
          v-model="editName"></meg-input>
        <span
          class="edit-confirm-btn"
          @click="onClickEditConfirm">{{ $t('确定') }}</span>
        <!-- <span
          class="edit-cancel-btn"
          @click="onClickEditCancel">取消</span> -->
      </div>
    </div>

    <div class="node-info">
      <div class="node-info-items">
        <p class="info-item">
          <span class="info-item-label">{{ $t('节点编号') }}</span>
          <span
            class="info-item-value"
            v-tooltip="true">{{ nodeInfo.nodeNumber }}</span>
        </p>
        <p class="info-item">
          <span class="info-item-label">{{ $t('特征版本号') }}</span>
          <span
            class="info-item-value"
            v-tooltip="true">{{ nodeInfo.coreVersion }}</span>
        </p>
      </div>
      <div class="node-info-btn">
        <meg-popover
          placement="bottom"
          :width="220"
          :visible-arrow="false"
          trigger="click"
          v-model="registerCodePnlVisible">
          <div class="register-code-pnl">
            <div class="pnl-header">
              {{ $t('注册码已生成') }}
            </div>
            <div
              class="pnl-body"
              v-loading="registerCodePnlLoading">
              <p>{{ registerCode }}</p>
            </div>
            <div class="pnl-footer">
              <span
                @click="onClickCopy">复制</span>
            </div>
          </div>
          <div
            slot="reference"
            v-if="!readonly"
            class="info-item-code"
            @click="onClickGetRegisterCode">
            {{ $t('获取注册码') }}
          </div>
        </meg-popover>
      </div>
    </div>
  </div>
</template>
<script>
// import mainNodeIcon from '../../assets/images/cascade/main-node';

export default {
  name: 'HighLevelNode',
  props: {
    // 节点信息
    nodeInfo: {
      type: Object,
      default: () => ({
        nodeIp: '',
        nodeName: '',
        nodeRegisterCode: '',
        nodeNumber: '',
        coreVersion: '',
        enabled: true,
        nodeLevel: 1 // 节点级别,上级1，下级2
      })
    },
    // 是否只读
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      registerCodePnlLoading: false,
      registerCodePnlVisible: false,
      registerCode: '',
      isEditing: false,
      // 编辑中的节点名
      editName: '',
      editFinished: true
    };
  },
  methods: {
    onClickCopy() {
      this.$clipboard(this.registerCode).then(() => {
        this.$message({
          type: 'success',
          message: this.$t('复制成功'),
        });
      }, () => {
        this.$message({
          type: 'error',
          message: this.$t('复制失败'),
        });
      });
    },
    onClickGetRegisterCode() {
      if (this.registerCodePnlVisible) return;
      this.registerCode = '';
      this.registerCodePnlLoading = true;
      new Promise((resolve) => {
        this.$emit('register-gen', resolve);
      }).then((res) => {
        if (!res.success) {
          this.$message({
            message: res.msg,
            type: 'error'
          });
        } else {
          this.registerCode = res.token;
          this.registerCodePnlLoading = false;
        }
      });
    },
    onCopySuccess() {
      this.$message({
        message: this.$t('复制成功'),
        type: 'success'
      });
    },
    onClickEditName() {
      this.editName = this.nodeInfo.nodeName;
      this.isEditing = true;
      this.$nextTick(() => {
        this.$refs.nameEditInput.focus();
      });
    },
    onClickEditConfirm() {
      if (this.editName.length < 2) {
        this.$message({
          message: this.$t('节点名称长度不能小于2'),
          type: 'warning'
        });
        return;
      }
      if (this.editName.length > 30) {
        this.$message({
          message: this.$t('节点名称长度不能大于30'),
          type: 'warning'
        });
        return;
      }
      new Promise((resolve) => {
        this.$emit('name-edit', this.nodeInfo, this.editName, resolve);
      }).then((res) => {
        if (res.success) {
          this.nodeInfo.nodeName = this.editName;
          this.isEditing = false;
        } else {
          this.isEditing = false;
          this.$message({
            message: res.msg,
            type: 'error'
          });
        }
      });
    },
    onClickEditCancel() {
      this.isEditing = false;
    }
  }
};
</script>
<style lang="scss" scoped>
.outline {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  user-select: none;

  .node-icon {
    flex: 0 0 28px;
    img {
      width: 28px;
      height: 28px;
    }
  }

  .node-name {
    flex: 0 0 34px;
    min-width: 354px;
    display: flex;
    justify-content: stretch;
    align-items: stretch;
    font-size: 16px;
    color: #435068;

    &:hover {
      .node-name__display {
        background-color: #f7f8f9;
      }
      .node-name-edit__icon {
        display: inline-block;
      }
    }

    .node-name-edit__icon {
      display: none;
    }

    .node-name__display {
      display: flex;
      width: 100%;
      justify-content: center;
      align-items: center;
      background-color: #fff;
    }

    .node-name__edit {
      display: flex;
      position: relative;
      width: 100%;
      justify-content: space-between;
      align-items: center;
      font-family: SourceHanSansCN-Regular;
      font-size: 13px;
      color: #21539b;
      background-color: #f7f8f9;

      .edit-confirm-btn {
        position: absolute;
        right: 10px;
        cursor: pointer;
      }

      // .edit-cancmeg-btn {
      //   position: absolute;
      //   right: 40px;
      //   cursor: pointer;
      // }

      ::v-deep .meg-input__inner {
        border: none;
        background-color: #f7f8f9;
        text-align: center;
        padding-right: 45px;
      }
    }
  }

  .node-info {
    flex: 1 0 65px;
    display: flex;
    flex-direction: row;
    width: 400px;

    padding: 13px 20px;
    margin-top: 10px;

    border: 1px solid #f0f3f7;
    border-radius: 0.2px;
    border-radius: 0.2px;

    .node-info-items {
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      justify-content: space-around;
      .info-item {
        flex: auto 1 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 10px;

        .info-item-label {
          flex: 0 0 65px;
          display: flex;
          justify-content: flex-end;
          font-size: 13px;
          color: #869abb;
        }

        .info-item-value {
          flex: 1 0 auto;
          max-width: 180px;
          display: inline-block;
          padding-left: 10px;
        }
      }
    }

    .node-info-btn {
      flex: 0 0 120px;
      display: flex;
      justify-content: center;
      align-items: center;

      .info-item-code {
        background: #ffffff;
        border: 1px solid rgba(91, 152, 231, 0.3);
        border-radius: 12px;
        border-radius: 12px;
        font-size: 12px;
        padding: 5px 12px;
        color: #21539b;
        cursor: pointer;
      }
    }
  }
}

.register-code-pnl {
  display: flex;
  flex-direction: column;

  .pnl-header {
    flex: 0 0 40px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: 14px;
    font-family: SourceHanSansCN-Medium;
    font-weight: bold;
    color: #435068;
  }

  .pnl-body {
    flex: 1 0 90px;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    font-size: 12px;
    color: #7b8495;
    background-color: #f9f9f9;
  }

  .pnl-footer {
    flex: 0 0 30px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    font-family: SourceHanSansCN-Regular;
    font-size: 13px;
    color: #21539b;

    span {
      cursor: pointer;
    }
  }
}
</style>
