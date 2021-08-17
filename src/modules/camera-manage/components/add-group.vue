<template>
  <div class="add-Group">
    <meg-dialog
      width="640px"
      :visible="visible"
      :title="isAdd? $t('新建自定义分组') : $t('编辑自定义分组')"
      @close="dialogClose">
      <div class="group-body">
        <meg-form
          ref="addGroupForm"
          label-width="123px"
          :model="groupForm"
          :rules="groupRule">
          <meg-form-item
            prop="name"
            :label="$t('自定义分组名称')">
            <meg-input
              :placeholder="$t('请输入自定义分组名称')"
              v-model.trim="groupForm.name"></meg-input>
          </meg-form-item>
          <meg-form-item
            prop="remark"
            :label="$t('自定义分组备注')">
            <meg-input
              :placeholder="$t('请输入自定义分组备注')"
              v-model.trim="groupForm.remark"></meg-input>
          </meg-form-item>
          <meg-form-item :label="$t('选择相机')">
            <meg-treeselect
              ref="cameraGroupTree"
              show-checkbox
              standard-tree-data
              brief-selected-info
              record-dynamic-select
              :data="cameraTree"
              :props="treeProps"
              :show-count="false"
              :content-height="550"
              :expand-on-click-node="false"
              :pretreatment-node-data-fn="pretreatmentNodeDataFn">
              <div
                style="width:100%"
                v-tooltip="true"
                slot-scope="{ data }">
                <!-- 场所icon -->
                <meg-icon
                  color="#606266"
                  size="14"
                  :name="iconName[data.flag]"></meg-icon>
                {{ data.name }}
              </div>
            </meg-treeselect>
          </meg-form-item>
        </meg-form>
      </div>
      <span
        slot="footer">
        <meg-button
          type="primary"
          :loading="loading"
          @click="confirmGroup">{{ $t('保存') }}</meg-button>
        <meg-button @click="dialogClose">{{ $t('取消') }}</meg-button>
      </span>
    </meg-dialog>
  </div>
</template>
<script>
// import _ from 'lodash';
import Rule from '../camera-manage.rule';
import CameraManageSrv from '../camera-manage.service';

export default {
  name: 'AddGroup',
  props: {
    isAdd: {
      type: Boolean,
      default: true
    },
    visible: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      loading: false,
      groupForm: { // 新建分组表单
        name: '',
        remark: '',
        cameraIds: []
      },
      cameraTree: [], // 新建分组用相机树
      treeProps: {
        label: 'name',
        children: 'items'
      },
      // rules: Rule, // 验证规则
      isAllCamera: false,
      groupRule: Rule.addGroup,
      iconName: {
        place: 'camera_unlabeled',
        dept: 'department',
        camera: 'camera_normal'
      }
    };
  },
  created() {
    const params = {
      excludeTypes: [5, 6, 7],
      searchType: 0
    };
    CameraManageSrv.getCameraTree(params).then((res) => {
      if (res.code === 0) {
        this.cameraTree = res.data;
        this.$nextTick(() => {
          if (this.groupForm.cameraIds) {
            this.$refs.cameraGroupTree.setCheckedKeys(this.groupForm.cameraIds);
          }
        });
      }
    });
  },
  methods: {
    // 确认
    confirmGroup() {
      this.$refs.addGroupForm.validate((valid) => {
        if (this.isAdd && valid) {
          this.addGroupConfirm();
        } else if (valid) {
          this.editGroupConfirm();
        }
      });
    },
    pretreatmentNodeDataFn(item) {
      item.noStatistics = item.flag !== 'camera';
    },
    addGroupConfirm() {
      this.loading = true;
      const params = { ...this.groupForm, searchType: 0 };
      params.cameraIds = this.$refs.cameraGroupTree.getCheckedKeys((item) => item.flag === 'camera');
      CameraManageSrv.createGroup(params).then((res) => {
        this.loading = false;
        if (res.code === 0) {
          this.$message.success('新建成功');
          this.$emit('update-Group-list');
          this.dialogClose();
        }
      });
    },
    //  确认编辑分组
    editGroupConfirm() {
      this.loading = true;
      const params = { ...this.groupForm, searchType: 0 };
      params.cameraIds = this.$refs.cameraGroupTree.getCheckedKeys((item) => item.flag === 'camera');
      CameraManageSrv.modifyGroup(params).then((res) => {
        this.loading = false;
        if (res.code === 0) {
          this.$message.success('编辑成功');
          this.$emit('update-Group-list');
          this.dialogClose();
        }
      });
    },
    dialogClose() {
      this.resetAddGroup();
      this.$emit('update:visible', false);
    },
    // 重置表单验证
    resetAddGroup() {
      this.groupForm = {
        name: '',
        remark: '',
        cameraIds: []
      };
      this.$refs.addGroupForm.resetFields();
      this.$refs.cameraGroupTree.setCheckedKeys([]);
    },
    setGroupForm(data) {
      this.groupForm = { ...data };
      if (data.cameraIds && this.cameraTree.length) {
        this.$refs.cameraGroupTree.setCheckedKeys(data.cameraIds);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.add-Group {
  .meg-form {
    // margin-top: 20px;
    height: 200px;
    line-height: 200px;
    width: 380px;
    // padding-left: 20px;
  }
  .group-body {
    width: 400px;
    height: 300px;
  }
  .select-camera {
    float: right;
    line-height: 13px;
    font-size: 12px;
  }
  .search-item-container {
    height: 70px;
  }
  .camera-select-container {
    min-height: 32px;
    position: relative;
    padding: 10px 30px 10px 10px;
    max-height: 180px;
    box-sizing: border-box;
  }
  .camera-select-placeholder {
    position: absolute;
    color: #a0a0a0;
    left: 15px;
    top: 12px;
    font-size: 12px;
    line-height: 12px;
  }
  .search-item-container p {
    line-height: 26px;
    font-size: 12px;
    color: #435068;
  }
  .camera-box {
    position: relative;
    border: 1px solid #d2d6de;
  }
  .meg-group {
    margin-left: 4px;
    margin-bottom: 4px;
  }

  .camera-select-menu {
    position: absolute;
    cursor: pointer;
    right: 5px;
    top: -2px;
    display: inline-block;
    width: 20px;
    height: 34px;
    line-height: 34px;
    z-index: 1000;
  }
}
.camera-right-container {
  border-radius: 10px;
  width: 274px;
  height: 524px;
  padding: 12px;
  // max-width: 300px;
}
</style>
<style>
.tree-select__popovers {
  height: 550px !important;
  padding: 0;
}
</style>
