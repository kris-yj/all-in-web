<template>
  <meg-dialog
    width="814px"
    class="batch-update"
    append-to-body
    :visible="visible"
    :title="$t('批量字段变更')"
    @close="closeDialog">
    <div class="batch-update-content">
      <div class="update-keys">
        <div>
          <meg-checkbox v-model="monitoringTypeSelected">
            卡口类型
          </meg-checkbox>
          <meg-checkbox v-model="managementIdSelected">
            应用管理部门
          </meg-checkbox>
          <meg-checkbox v-model="labelSelected">
            设备标签
          </meg-checkbox>
          <meg-checkbox v-model="shareModelSelected">
            相机权限
          </meg-checkbox>
          <meg-checkbox v-model="unitSelected">
            重点单位
          </meg-checkbox>
          <meg-checkbox v-model="placeSelected">
            归属区域
          </meg-checkbox>
          <meg-checkbox v-model="tagSelected">
            所属分组
          </meg-checkbox>
        </div>
        <div>
          <meg-checkbox v-model="statusSyncIntervalSelected">
            状态更新时间
          </meg-checkbox>
          <meg-checkbox v-model="storageSchemeSelected">
            存储方案
          </meg-checkbox>
          <meg-checkbox v-model="lowQualitySelected">
            低质量
          </meg-checkbox>
          <meg-checkbox v-model="pulledSelected">
            激活状态
          </meg-checkbox>
          <meg-checkbox
            v-if="$store.getters.systemByType('alarmShortVideo').value !== '0'"
            v-model="alarmShortVideoSelected">
            报警小视频
          </meg-checkbox>
        </div>
      </div>
      <div class="update-values">
        <meg-form
          ref="form"
          label-width="110px"
          label-position="right"
          :model="formData">
          <meg-form-item
            v-if="monitoringTypeSelected"
            class="force-width"
            :label="$t('卡口类型')"
            prop="modifyMonitoringType">
            <meg-select
              scrolling-closable
              v-model="formData.modifyMonitoringType">
              <meg-option
                v-for="item in monitoringTypeOption"
                :key="item.code"
                :label="item.value"
                :value="item.code">
              </meg-option>
            </meg-select>
          </meg-form-item>
          <meg-form-item
            v-if="managementIdSelected"
            class="force-width"
            :label="$t('应用管理部门')"
            :prop="'modifyManagementId'">
            <meg-treeselect
              ref="deptTree"
              node-key="id"
              single-check
              highlight-current
              standard-tree-data
              default-expand-all
              :show-count="false"
              :data="orgTreeData"
              :props="deptTreeProps"
              @single-check-change="deptCheckChange">
              <div
                style="width: 100%"
                v-tooltip="true"
                slot-scope="{ data }">
                {{ data.orgName }}
              </div>
            </meg-treeselect>
          </meg-form-item>
          <meg-form-item
            v-if="labelSelected"
            class="force-width"
            :label="$t('设备标签')">
            <meg-treeselect
              ref="labelTree"
              show-checkbox
              check-strictly
              show-all-checked
              standard-tree-data
              check-on-click-node
              record-dynamic-select
              :data="labelList"
              :show-count="false"
              :expand-on-click-node="false"
              :all-selected-text="$t('全部标签')"
              :placeholder-text="$t('请选择标签')"
              :props="defaultTreeProps">
              <template v-slot:selected="{ items }">
                <div>
                  <meg-tag
                    v-tooltip="true"
                    v-for="(item, index) in handleSelectLabel(items)"
                    :key="index"
                    :closable="true"
                    @click.native.stop
                    @close="deleteSelect(item)">
                    {{ item.normalName }}
                  </meg-tag>
                </div>
              </template>
            </meg-treeselect>
          </meg-form-item>
          <meg-form-item
            v-if="shareModelSelected"
            :label="$t('相机权限')"
            prop="shareModel">
            <meg-radio-group v-model="formData.shareModel">
              <meg-radio
                v-for="shareModel in cameraShareModel"
                :label="shareModel.code"
                :key="shareModel.code">
                {{ shareModel.value }}
              </meg-radio>
            </meg-radio-group>
          </meg-form-item>
          <meg-form-item
            class="force-width"
            v-if="formData.shareModel !== '0' && shareModelSelected"
            :label="$t('共享人员')"
            prop="shareList">
            <meg-treeselect
              ref="userTree"
              node-key="id"
              show-checkbox
              check-strictly
              show-all-checked
              standard-tree-data
              check-on-click-node
              :show-count="false"
              :data="userTreeData"
              :props="deptTreeProps"
              :expand-on-click-node="false"
              :placeholder-text="$t('点击选择部门或人员')">
              <template slot-scope="{ data }">
                <div
                  class="label-item"
                  v-tooltip="true">
                  {{ data.orgName }}
                </div>
              </template>
            </meg-treeselect>
          </meg-form-item>
          <meg-form-item
            v-if="unitSelected"
            class="force-width"
            :label="$t('重点单位')"
            prop="modifyUnitIds">
            <meg-treeselect
              ref="unitTree"
              show-checkbox
              standard-tree-data
              check-on-click-node
              :data="keyUnitList"
              :show-count="false"
              :props="defaultTreeProps"
              :expand-on-click-node="false"
              :placeholder-text="$t('请选择重点单位')">
              <div
                style="width: 100%"
                v-tooltip="true"
                slot-scope="{ data }">
                {{ data.name || data.orgName }}
              </div>
            </meg-treeselect>
          </meg-form-item>
          <meg-form-item
            :label="$t('归属区域')"
            v-if="placeSelected"
            class="force-width">
            <meg-treeselect
              ref="placeTree"
              show-checkbox
              standard-tree-data
              check-on-click-node
              :data="placeList"
              :show-count="false"
              :props="defaultTreeProps"
              :expand-on-click-node="false"
              :placeholder-text="$t('请选择归属区域')">
              <div
                style="width: 100%"
                v-tooltip="true"
                slot-scope="{ data }">
                {{ data.name }}
              </div>
            </meg-treeselect>
          </meg-form-item>
          <meg-form-item
            v-if="tagSelected"
            class="force-width"
            :label="$t('所属分组')"
            prop="modifyTagIds">
            <meg-treeselect
              ref="searchGroupTree"
              show-checkbox
              standard-tree-data
              check-on-click-node
              :show-count="false"
              :data="groupTreeData"
              :props="defaultTreeProps"
              :expand-on-click-node="false"
              :placeholder-text="$t('请选择分组')">
              <div
                style="width: 100%"
                v-tooltip="true"
                slot-scope="{ data }">
                {{ data.name }}
              </div>
            </meg-treeselect>
          </meg-form-item>
          <meg-form-item
            v-if="statusSyncIntervalSelected"
            class="force-width"
            :label="$t('状态刷新')"
            prop="statusSyncInterval">
            <meg-select
              class="meg-select"
              v-model="formData.statusSyncInterval"
              :placeholder="$t('请选择')">
              <meg-option
                v-for="item in statusSyncIntervalData"
                :key="item.value"
                :label="item.label"
                :value="item.value"></meg-option>
            </meg-select>
          </meg-form-item>
          <meg-form-item
            v-if="storageSchemeSelected"
            class="force-width"
            :label="$t('存储方案')"
            prop="storageScheme">
            <meg-select
              v-model="formData.storageScheme"
              :placeholder="$t('请选择')">
              <meg-option
                v-for="item in storageSchemeOption"
                :key="item.key"
                :label="item.label"
                :value="item.key"></meg-option>
            </meg-select>
          </meg-form-item>
          <meg-form-item
            v-if="lowQualitySelected"
            :label="$t('低质量')"
            prop="lowQuality">
            <meg-switch
              active-color="#21539B"
              v-model="formData.lowQuality">
            </meg-switch>
          </meg-form-item>
          <meg-form-item
            v-if="pulledSelected"
            :label="$t('激活状态')"
            prop="pulled">
            <meg-switch
              active-color="#21539B"
              v-model="formData.pulled">
            </meg-switch>
          </meg-form-item>
          <meg-form-item
            v-if="$store.getters.systemByType('alarmShortVideo').value !== '0' && alarmShortVideoSelected"
            prop="alarmShortVideo"
            :label="$t('报警短视频')">
            <meg-switch
              active-color="#21539B"
              v-model="formData.alarmShortVideo">
            </meg-switch>
          </meg-form-item>
          <meg-form-item
            v-if="formData.alarmShortVideo"
            class="force-width"
            :label="$t('小视频存储类型')">
            <meg-select
              scrolling-closable
              v-model="formData.recordType"
              :disabled="(!formData.alarmShortVideo && $store.getters.systemByType('alarmShortVideo').value === '0') || !($store.getters.systemByType('alarmShortVideo').value !== '0')"
              @change="onRecordTypeChange">
              <meg-option
                v-for="item in recordTypeOption"
                :key="item.code"
                :label="item.value"
                :value="item.code">
              </meg-option>
            </meg-select>
          </meg-form-item>
          <meg-form-item
            class="force-width"
            :label="$t('小视频时间(秒)')"
            v-if="formData.recordType !== 3 && formData.alarmShortVideo"
            prop="period">
            <meg-input
              v-model.trim="formData.period"
              :disabled="(!formData.alarmShortVideo && $store.getters.systemByType('alarmShortVideo').value === '0') || formData.recordType === 3 || !( $store.getters.systemByType('alarmShortVideo').value !== '0')"
              :placeholder="$t('请输入{entity}个字符', { entity: 20 })"></meg-input>
          </meg-form-item>
        </meg-form>
      </div>
    </div>
    <span
      slot="footer">
      <meg-button
        type="primary"
        @click="save">{{ $t('保存') }}</meg-button>
      <meg-button @click="closeDialog">{{ $t('取消') }}</meg-button>
    </span>
  </meg-dialog>
</template>

<script>
import CameraManageSrv from '../camera-manage.service';

export default {
  components: {

  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    orgTreeData: {
      type: Array,
      default: () => [],
    },
    labelList: {
      type: Array,
      default: () => [],
    },
    userTreeData: {
      type: Array,
      default: () => [],
    },
    keyUnitList: {
      type: Array,
      default: () => [],
    },
    placeList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      monitoringTypeSelected: false,
      managementIdSelected: false,
      labelSelected: false,
      shareModelSelected: false,
      unitSelected: false,
      placeSelected: false,
      tagSelected: false,
      statusSyncIntervalSelected: false,
      storageSchemeSelected: false,
      lowQualitySelected: false,
      pulledSelected: false,
      alarmShortVideoSelected: false,
      monitoringTypeOption: this.$store.getters.dataMapByType('bayonet_type'),
      cameraShareModel: this.$store.getters.dataMapByType('camera_auth'),
      recordTypeOption: this.$store.getters.dataMapByType('record_type').map((val) => { val.code = Number(val.code); return val; }),
      storageSchemeOption: [
        {
          key: 1,
          label: this.$t('方案一'),
        },
        {
          key: 2,
          label: this.$t('方案二'),
        },
      ],
      groupTreeData: [],
      deptTreeProps: {
        children: 'subOrgs',
        label: 'orgName',
      },
      defaultTreeProps: {
        label: 'name',
        children: 'items',
      },
      formData: {
        modifyMonitoringType: '1',
        modifyManagementId: '',
        shareModel: '0',
        statusSyncInterval: 10,
        storageScheme: 1,
        lowQuality: false,
        pulled: false,
        alarmShortVideo: false,
        recordType: 1,
        period: 35,
      },
      // 相机状态刷新间隔（分钟）
      statusSyncIntervalData: [
        {
          value: 1,
          label: '1分钟',
        },
        {
          value: 2,
          label: '2分钟',
        },
        {
          value: 5,
          label: '5分钟',
        },
        {
          value: 10,
          label: '10分钟',
        },
        {
          value: 30,
          label: '30分钟',
        },
        {
          value: 60,
          label: '60分钟',
        },
      ],
    };
  },
  computed: {

  },
  watch: {

  },
  created() {
    this.getGroupsList();
  },
  destroyed() {

  },
  methods: {
    // 查询相机分组
    getGroupsList() {
      CameraManageSrv.getGroupsList({ withCameras: false, searchType: 0 }).then(
        (res) => {
          if (res.code === 0) {
            this.groupTreeData = res.data;
          }
        }
      );
    },
    closeDialog() {
      this.$emit('update:visible', false);
    },
    deptCheckChange(node, checked) {
      this.formData.modifyManagementId = checked ? node.id : '';
    },
    // 处理自定义标签显示
    handleSelectLabel(items) {
      const arr = [];
      items.forEach((val) => {
        let str = '';
        if (val.idPath.length) {
          val.idPath.forEach((item) => {
            str += `${this.$refs.labelTree.getNode(item).name}/`;
          });
        }
        arr.push({
          ...val,
          normalName: `${str}${val.name}`,
        });
      });
      return arr;
    },
    // 当小视频类型变化时，切换默认值
    onRecordTypeChange() {
      if (this.formData.recordType === 3) {
        this.formData.period = '';
      } else if (this.formData.recordType === 2) {
        this.formData.period = 1800;
      } else if (this.formData.recordType === 1) {
        this.formData.period = 35;
      }
    },
    // 取消选中
    deleteSelect(item) {
      this.$refs.labelTree.setChecked(item.id, false);
    },
    getParams() {
      const params = {};
      if (this.monitoringTypeSelected) {
        params.monitoringTypeSelected = this.monitoringTypeSelected;
        params.modifyMonitoringType = this.formData.modifyMonitoringType;
      }
      if (this.managementIdSelected) {
        params.managementIdSelected = this.managementIdSelected;
        params.modifyManagementId = this.formData.modifyManagementId;
      }
      if (this.labelSelected) {
        params.labelSelected = this.labelSelected;
        params.modifyLabels = this.$refs.labelTree.getCheckedKeys();
      }
      if (this.shareModelSelected) {
        params.shareModelSelected = this.shareModelSelected;
        params.shareModel = this.formData.shareModel;
        if (this.$refs.userTree) {
          const nodes = this.$refs.userTree.getCheckedNodes();
          params.shareList = nodes.map((item) => ({
            shareType: item.isUser ? 1 : 0,
            shareObject: item.id
          }));
        }
      }
      if (this.unitSelected) {
        params.unitSelected = this.unitSelected;
        params.modifyUnitIds = this.$refs.unitTree.getCheckedKeys();
      }
      if (this.placeSelected) {
        params.placeSelected = this.placeSelected;
        params.modifyPlaceIds = this.$refs.placeTree.getCheckedKeys();
      }
      if (this.tagSelected) {
        params.tagSelected = this.tagSelected;
        params.modifyTagIds = this.$refs.searchGroupTree.getCheckedKeys();
      }
      if (this.statusSyncIntervalSelected) {
        params.statusSyncIntervalSelected = this.statusSyncIntervalSelected;
        params.statusSyncInterval = this.formData.statusSyncInterval;
      }
      if (this.storageSchemeSelected) {
        params.storageSchemeSelected = this.storageSchemeSelected;
        params.storageScheme = this.formData.storageScheme;
      }
      if (this.lowQualitySelected) {
        params.lowQualitySelected = this.lowQualitySelected;
        params.lowQuality = this.formData.lowQuality;
      }
      if (this.pulledSelected) {
        params.pulledSelected = this.pulledSelected;
        params.pulled = this.formData.pulled;
      }
      if (this.alarmShortVideoSelected) {
        params.alarmShortVideoSelected = this.alarmShortVideoSelected;
        params.alarmShortVideo = this.formData.alarmShortVideo;
      }
      if (this.formData.alarmShortVideo) {
        params.recordType = this.formData.recordType;
        params.period = this.formData.period;
      }
      return params;
    },
    // 保存
    save() {
      const params = this.getParams();
      this.$emit('batch-update-save', params);
    }
  },
};
</script>

<style lang='scss' scoped>
.batch-update {
  ::v-deep .meg-dialog__body {
    padding: 0;
  }
  .batch-update-content {
    display: flex;
    height: 358px;
    .update-keys {
      width: 300px;
      padding-left: 29px;
      border-right: solid 1px #EFEFEF;
      display: flex;
      .meg-checkbox {
        display: block;
        font-size: 14px;
        color: #435068;
        margin-top: 30px;
      }
    }
    .update-values {
      flex: 1;
      padding-left: 29px;
      padding-top: 20px;
      overflow-y: scroll;
      .meg-select {
        width: 270px;
      }
      .force-width {
        ::v-deep .meg-form-item__content {
          width: 270px;
        }
      }
    }
  }
}
</style>
