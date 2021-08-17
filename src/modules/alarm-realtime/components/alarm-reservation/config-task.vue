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
      {{ `${$t('配置布控任务')}${info.title}` }}
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
          :data="activeIndex === 1 ? info.cameraTree:info.albumTree"
          :show-checkbox="true"
          :props="treeProps"
          :show-camera-icon="true"
          :record-dynamic-select="true"
          @check-change="onCheckChange">
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
      }
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.$nextTick(() => {
      this.$refs.tree.setCheckedKeys(this.info.cameras.filter((item) => item.select === 1).map((item) => item.id));
    });
  },
  methods: {
    close() {
      this.$emit('close');
    },
    save() {
      const params = {
        strategyId: this.info.strategyId,
        cameras: this.info.cameras,
        albums: this.info.albums,
      };
      AlarmRealTimeSrv.updateCameraAlbum(params).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('保存成功'));
          this.$emit('close');
          this.$emit('update');
        }
      });
    },
    onCheckChange() {
      const key = this.activeIndex === 1 ? 'cameras' : 'albums';
      const arr = this.$refs.tree.getCheckedKeys();
      this.info[key].forEach((val) => {
        val.select = 0;
        if (arr.includes(val.id)) {
          val.select = 1;
        }
      });
    },
    onTabClick(ind) {
      this.activeIndex = ind;
      const arr = this.activeIndex === 1 ? this.info.cameras : this.info.albums;
      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys(arr.filter((item) => item.select === 1).map((item) => item.id));
      });
    },
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
    width: 560px;
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
    }
  }
}
</style>
