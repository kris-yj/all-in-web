<template>
  <div class="button-group">
    <div>
      <span
        v-if="!isSelect"
        class="search-result">
        {{ $t('检索结果：共{count}条',{count:total}) }}
      </span>
      <span
        v-else
        class="search-result">
        <meg-checkbox v-model="scopedCheckedAll">
          {{ $t('跨页全选') }}
        </meg-checkbox>
        {{ $t('已选{count}项',{count:checkedLength}) }}
      </span>
    </div>
    <div
      class="buttons"
      v-if="!isSelect">
      <meg-button
        type="primary"
        v-if="cameraAuth.addAuth"
        @click="addCamera">
        {{ $t('手动添加') }}
      </meg-button>
      <meg-dropdown
        trigger="click"
        v-if="cameraAuth.addAuth"
        @command="BatchAddition"
        placement="bottom">
        <meg-button
          type="primary">
          {{ $t('批量添加') }}
        </meg-button>
        <meg-dropdown-menu
          slot="dropdown">
          <meg-dropdown-item
            class="dropdown-item"
            command="excel">
            {{ $t('EXCEL批量上传') }}
          </meg-dropdown-item>
          <meg-dropdown-item
            class="dropdown-item"
            command="guobiao">
            {{ $t('国标平台拉取') }}
          </meg-dropdown-item>
          <meg-dropdown-item
            class="dropdown-item"
            command="shituku">
            {{ $t('视图库平台拉取') }}
          </meg-dropdown-item>
        </meg-dropdown-menu>
      </meg-dropdown>
      <meg-button
        @click="addGroup"
        v-if="cameraAuth.groupAuth">
        {{ $t('新建自定义分组') }}
      </meg-button>
      <meg-button @click="batchEdit">
        {{ $t('EXCEL批量编辑') }}
      </meg-button>
    </div>
    <div
      class="buttons"
      v-else>
      <meg-button
        v-if="cameraAuth.pullAuth()"
        @click="batchPulledChange(true)">
        {{ $t('批量激活') }}
      </meg-button>
      <meg-button
        v-if="cameraAuth.pullAuth()"
        @click="batchPulledChange(false)">
        {{ $t('批量停用') }}
      </meg-button>
      <meg-button
        v-if="cameraAuth.deleteAuth()"
        @click="batchDelete">
        {{ $t('批量删除') }}
      </meg-button>
      <meg-button @click="batchUpdate">
        {{ $t('批量变更字段') }}
      </meg-button>
      <export-setting-button
        v-if="cameraAuth.exportAuth"
        type="default"
        button-text="导出"
        dropdown-text="导出设置"
        @click-export="exportResult"
        @click-setting="exportSetting">
      </export-setting-button>
      <meg-button
        @click="clearSelectList">
        {{ $t('退出选择') }}
      </meg-button>
    </div>
  </div>
</template>

<script>
import { ExportSettingButton, ExportSettingManager } from '@/common-components/common-export-setting';

export default {
  components: {
    ExportSettingButton
  },
  props: {
    checkedLength: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    },
    isSelect: {
      type: Boolean,
      default: false
    },
    cameraAuth: {
      type: Object,
      default: () => {}
    },
  },
  data() {
    return {
      scopedCheckedAll: false,
      exportManager: null
    };
  },
  computed: {

  },
  watch: {
    scopedCheckedAll(val) {
      this.$emit('checkedAll-change', val);
    }
  },
  mounted() {
    this.exportManager = new ExportSettingManager(this.$store, 'camera-manage', 'kunlun_camera_export_column');
  },
  destroyed() {

  },
  methods: {
    BatchAddition(type) {
      if (type === 'guobiao') {
        this.$emit('show-gb');
      } else if (type === 'shituku') {
        this.$emit('show-stk');
      } else if (type === 'excel') {
        this.$emit('batch-upload');
      }
    },
    // 导出
    exportResult() {
      const items = this.exportManager.getExportSetting();
      this.$emit('export', items);
    },
    // 导出设置
    async exportSetting() {
      await this.exportManager.setExportSetting();
    },
    addGroup() {
      this.$emit('add-group');
    },
    batchPulledChange(pulled) {
      this.$emit('batch-pulled-change', pulled);
    },
    addCamera() {
      this.$emit('add-camera');
    },
    batchEdit() {
      this.$emit('batch-edit');
    },
    batchDelete() {
      this.$emit('batch-delete');
    },
    batchUpdate() {
      this.$emit('batch-update');
    },
    clearSelectList() {
      this.$emit('checkedAll-change', false);
      this.scopedCheckedAll = false;
    }
  },
};
</script>

<style lang='scss' scoped>
.button-group {
  height: 54px;
  line-height: 54px;
  display: flex;
  justify-content: space-between;
  .search-result {
    color: #435068;
  }
  .buttons {
    margin-right: 14px;
    .meg-dropdown {
      margin: 0 10px
    }
    .meg-export-button {
      margin: 0 10px;
    }
  }
}
.dropdown-item {
  text-align: center;
}
</style>
