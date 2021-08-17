<template>
  <div class="device-tree">
    <div class="title">
      {{ $t('选择同步的相机') }}
    </div>
    <meg-tree
      ref="tree"
      node-key="gbDeviceId"
      check-on-click-node
      standard-tree-data
      default-expand-all
      :data="treeData"
      :show-checkbox="true"
      :props="{children: 'sub',label: 'name'}">
      <span
        class="custom-tree-node"
        slot-scope="{ node, data }">
        <meg-icon
          v-if="data.type !==0"
          name="camera_normal"
          width="24"
          height="12"
          color="#46a653">
        </meg-icon>
        <span
          v-tooltip="true"
          class="item-name">
          {{ node.label }}
        </span>
      </span>
    </meg-tree>
  </div>
</template>

<script>
export default {
  components: {

  },
  props: {
    treeData: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {

    };
  },
  computed: {

  },
  watch: {

  },
  mounted() {

  },
  destroyed() {

  },
  methods: {
    getCheckedCamera() {
      return this.$refs.tree.getCheckedNodes((val) => val.type === 1).map((val) => ({
        name: val.name,
        latitude: val.latitude,
        longitude: val.longitude,
        gbDeviceId: val.gbDeviceId,
        platformId: val.platformId
      }));
    }
  },
};
</script>

<style lang='scss' scoped>
.device-tree {
  box-sizing: border-box;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  .title {
    font-size: 12px;
    color: #435068;
    height: 24px;
    line-height: 24px;
    background: #F7F8F9;
    padding-left: 6px;
  }
  .meg-tree {
    flex: 1;
  }
}
</style>
