<template>
  <common-form-container
    class="search-form"
    @reset="reset"
    :content-style="{ 'padding': '20px 25px 25px 25px' }"
    :header-text="$t('历史报警')"
    @search="search">
    <template v-slot:title>
      <meg-dropdown
        placement="bottom"
        @command="changeDropdown"
        trigger="hover">
        <span class="meg-dropdown-link">
          {{ activeDrop.name }}
          <meg-icon
            name="caret_down"
            class="meg-dropdown-link-icon"></meg-icon>
        </span>
        <meg-dropdown-menu
          slot="dropdown">
          <meg-dropdown-item
            v-for="item in dropdownList"
            :key="item.type"
            :command="item">
            {{ item.name }}
          </meg-dropdown-item>
        </meg-dropdown-menu>
      </meg-dropdown>
    </template>
    <camera-form
      ref="camera"
      v-if="activeDrop.type === 1"
      :album-tree-data="albumTreeData"
      :task-list="taskList"
      :jump-camera-ids="jumpCameraIds"
      :default-data="defaultData"
      :deploy-type-list="deployTypeList"></camera-form>
    <video-form
      ref="video"
      v-if="activeDrop.type === 2"
      :album-tree-data="fileHistoryAlbumTreeData"></video-form>
    <file-form
      ref="file"
      :task-list-getter="taskListGetter"
      v-if="activeDrop.type ===3"
      :file-list-getter="fileListGetter"
      :album-tree-data="fileHistoryAlbumTreeData"></file-form>
  </common-form-container>
</template>

<script>
import CommonFormContainer from '@/common-components/common-form-container';
import CameraForm from './search/camera';
import FileForm from './search/file';
import VideoForm from './search/video';

const refMap = {
  1: 'camera',
  2: 'video',
  3: 'file'
};

export default {
  name: 'SearchForm',
  components: {
    CommonFormContainer, CameraForm, FileForm, VideoForm
  },
  props: {
    deployTypeList: {
      type: Array,
      default: () => []
    },
    taskList: {
      type: Array,
      default: () => []
    },
    jumpCameraIds: {
      type: Array,
      default: () => []
    },
    albumTreeData: {
      type: Array,
      default: () => []
    },
    fileHistoryAlbumTreeData: {
      type: Array,
      default: () => []
    },
    taskListGetter: {
      type: Function,
      default: undefined
    },
    fileListGetter: {
      type: Function,
      default: undefined
    },
    defaultData: {
      type: Object,
      default: () => {}
    },
  },
  data() {
    return {
      activeDrop: {
        // type: 1,
        // name: this.$t('按相机检索'),
      },

      dropdownList: [
        {
          type: 1,
          name: this.$t('按相机检索'),
        },
        {
          type: 2,
          name: this.$t('按录像检索')
        },
        {
          type: 3,
          name: this.$t('按文件检索')
        }
      ],
      dropMap: {
        'camera': {
          type: 1,
          name: this.$t('按相机检索'),
        },
        'file': {
          type: 3,
          name: this.$t('按文件检索')
        },
        'video': {
          type: 2,
          name: this.$t('按录像检索')
        }
      }
    };
  },
  computed: {},
  watch: {
    activeDrop(val) {
      this.$emit('tab-change', val.type);
    }
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * @description 搜索
     */
    search() {
      this.$nextTick(() => {
        const params = this.$refs[refMap[this.activeDrop.type]].getCondition();
        this.$emit('search', { ...params, source: 'LOCAL' });
      });
    },
    /**
     * @description 重置
     */
    reset() {
      this.$refs[refMap[this.activeDrop.type]].reset();
      this.$emit('reset');
    },

    /**
     * @description 检索类型变更
     * @param {object} val
     */
    changeDropdown(val) {
      this.activeDrop = val;
      this.search();
    },
    /**
     * @description 设置当前搜索维度
     * @param {any}
     * @returns
     */
    setActiveDrop(obj) {
      this.activeDrop = this.dropMap[obj.type];
    },
    /**
     * @description 设置默认检索条件,主要是外部跳转到这里产生得功能
     * @param {object} obj
     */
    setDefaultCondition(obj) {
      this.$nextTick(() => {
        this.$refs[obj.type].setCondition(obj);
      });
    },
  }
};
</script>
<style lang="scss" scoped>
.search-form {
  .meg-dropdown-link {
      cursor: pointer;
      display: flex;
      align-items: center;
      color: #21539b!important;
      .meg-dropdown-link-icon {
        margin-left:5px;
        font-size: 12px;
        transform: rotate(0deg);
      }
    }
}
</style>
