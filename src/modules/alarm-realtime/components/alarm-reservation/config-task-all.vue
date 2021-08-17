<template>
  <meg-dialog
    :visible="true"
    @close="close"
    class="config-task"
    :append-to-body="true"
    width="640px">
    <div
      v-tooltip="true"
      class="title"
      slot="title">
      {{ `${$t('配置相机底库')}` }}
      <span class="tips">
        {{ $t('修改设备和底库后将同步到相应布控任务') }}
      </span>
    </div>
    <div class="content">
      <div class="tab-box">
        <span
          @click="onTabClick(1)"
          :class="{'active':activeIndex===1}">{{ $t('已关联相机') }}</span>
        <span
          @click="onTabClick(2)"
          :class="{'active':activeIndex===2}">{{ $t('已关联底库') }}</span>
      </div>
      <div class="tree-box">
        <meg-tree
          ref="tree"
          :data="treeData"
          :show-checkbox="true"
          :props="treeProps"
          :check-strictly="true"
          :show-camera-icon="true"
          @check-change="onCheckChange">
          <template v-slot="{node}">
            <div
              class="item-box"
              v-tooltip="true">
              <span>{{ node.name }}</span>
              <span>{{ `${node.flag !== 'root' ? $t('已订阅'): ''}(${node.strategySelectNum}/${node.strategyAllNum})` }}</span>
            </div>
          </template>
        </meg-tree>
      </div>
    </div>
    <template v-slot:footer>
      <meg-button
        type="primary"
        :loading="isSaving"
        @click="save">
        {{ $t('确定') }}
      </meg-button>
      <meg-button
        :disabled="isSaving"
        @click="close">
        {{ $t('取消') }}
      </meg-button>
    </template>
  </meg-dialog>
</template>

<script>
import AlarmRealTimeSrv from '../../alarm-realtime.service.js';

export default {
  name: 'ConfigTask',
  components: {},
  props: {
    info: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      isSaving: false,
      activeIndex: 1,
      treeProps: {
        children: 'items',
        label: 'name',
      },
      isIndeterminate: true,
      checkAll: false,
      innerInfo: {},
    };
  },
  computed: {
    activeKey() {
      return this.activeIndex === 1 ? 'cameras' : 'albums';
    },
    treeData() {
      return this.activeIndex === 1 ? this.innerInfo.cameraTree : this.innerInfo.albumTree;
    }
  },
  watch: {},
  created() {
    this.innerInfo = { ...this.info };
  },
  mounted() {
    this.onTabClick(1);
  },
  methods: {
    close() {
      this.$emit('close');
    },
    save() {
      const { cameras, albums } = this.innerInfo;
      AlarmRealTimeSrv.updateCameraAlbum({ cameras, albums }).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('保存成功'));
          this.$emit('close');
          this.$emit('update');
        }
      });
    },
    handleInfo() {
      let selected = 0;
      let all = 0;
      let select = 0;
      let half = 0;
      this.innerInfo[this.activeKey].forEach((val) => {
        selected = val.strategySelectNum + selected;
        all = val.strategyAllNum + all;
        if (val.select === 1) {
          select = 1 + select;
        } else if (val.select === 2) {
          half = 1 + half;
        }
      });
      if (half !== 0 || (select !== this.innerInfo[this.activeKey].length && select !== 0)) {
        this.$refs.tree.setNodeAttributeByKey('root', 'indeterminate', true);
      } else if (select === 0 && half === 0) {
        this.$refs.tree.setNodeAttributeByKey('root', 'indeterminate', false);
        this.$refs.tree.setNodeAttributeByKey('root', 'checked', false);
      } else {
        this.$refs.tree.setNodeAttributeByKey('root', 'indeterminate', false);
        this.$refs.tree.setNodeAttributeByKey('root', 'checked', true);
      }
      this.$refs.tree.setNodeAttributeByKey('root', 'strategySelectNum', selected);
      this.$refs.tree.setNodeAttributeByKey('root', 'strategyAllNum', all);
    },
    onTabClick(ind) {
      this.activeIndex = ind;
      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys(this.innerInfo[this.activeKey].filter((item) => item.select === 1).map((item) => item.id));
        const half = this.innerInfo[this.activeKey].filter((item) => item.select === 2).map((item) => item.id);
        half.forEach((val) => {
          this.$refs.tree.setNodeAttributeByKey(val, 'indeterminate', true);
        });
        this.handleInfo();
      });
    },
    handleCheckAllChange(check) {
      this.innerInfo[this.activeKey].forEach((val) => {
        val.select = check ? 1 : 0;
        val.strategySelectNum = check ? val.strategyAllNum : 0;
        this.$refs.tree.setNodeAttributeByKey(val.id, 'indeterminate', false);
        this.$refs.tree.setNodeAttributeByKey(val.id, 'checked', check);
        this.$refs.tree.setNodeAttributeByKey(val.id, 'strategySelectNum', val.strategySelectNum);
      });
      this.$nextTick(() => {
        this.handleInfo();
      });
    },
    singleChange(data) {
      const arr = [...this.innerInfo[this.activeKey]];
      // let select = 0;
      arr.forEach((val) => {
        if (val.id === data.id) {
          val.select = data.checked ? 1 : 0;
          val.strategySelectNum = data.checked ? val.strategyAllNum : 0;
        }
        // if (val.select === 1) {
        //   select = 1 + select;
        // }
      });
      // if (select !== arr.length) {
      //   this.$refs.tree.setNodeAttributeByKey('root', 'indeterminate', true);
      // } else {
      //   this.$refs.tree.setNodeAttributeByKey('root', 'indeterminate', false);
      // }
      this.$refs.tree.setNodeAttributeByKey(data.id, 'indeterminate', false);
      this.$refs.tree.setNodeAttributeByKey(data.id, 'strategySelectNum', data.checked ? data.strategyAllNum : 0);
      this.innerInfo[this.activeKey] = arr;

      this.handleInfo();
    },
    onCheckChange(data) {
      if (data.flag === 'root') {
        this.handleCheckAllChange(data.checked);
      } else {
        this.singleChange(data);
      }
    }
  },
};
</script>
<style lang="scss" scoped>
.config-task {
  .title {
    padding-top: 20px;
    font-size: 16px;
    color: #435068;
    font-weight: 700;
    .tips{
      font-size: 12px;
color: rgba(67,80,104,0.50);
    }
  }
  .content {
    padding: 0 40px;
    .tab-box {
      padding-left: 4px;
      display: flex;
      span {
        display: inline-block;
        height: 38px;
        line-height: 38px;
        box-sizing: border-box;
        font-size: 16px;
        width: 50%;
        margin-top: -12px;
        cursor: pointer;
        color: #435068;
        text-align: center;
        font-weight: bold;
        &:hover {
          color: #21539b;
        }
        &.active {
          border-bottom: 4px solid #21539b;
          color: #21539b;
        }
      }
    }
    .tree-box {
      margin-top: 16px;
      .item-box {
        width:100%;
        display:flex;
        justify-content:space-between;
      }
    }
  }
}
</style>
