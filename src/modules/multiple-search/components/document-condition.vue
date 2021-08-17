<template>
  <meg-form
    ref="searchForm"
    :model="formData"
    :class="['document-condition__wrap', {'is-text-search': isTextSearch}]"
    label-position="top">
    <div class="condition__left">
      <meg-form-item
        label="出没时间"
        prop="activeTime">
        <meg-date-picker
          :prefix-icon-visible="false"
          :default-date="'pastWeek'"
          type="datetimerange"
          format="yyyy-MM-dd HH:mm"
          value-format="timestamp"
          v-model="formData.activeTime"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          range-separator="至"
          :picker-options="{shortcuts: ['today', 'pastThreeDays', 'pastWeek', 'pastMonth']}">
        </meg-date-picker>
      </meg-form-item>
      <meg-form-item
        label="出没地点">
        <common-camera-selector
          ref="cameraSelector"></common-camera-selector>
      </meg-form-item>
      <div v-show="isTextSearch && cropScene !== 2">
        <meg-form-item
          label="常访区域">
          <meg-treeselect
            ref="areaListTree"
            :props="{'label': 'name', 'children': 'items'}"
            :data="areaListArray"
            :show-checkbox="true"
            :brief-selected-info="true"
            :show-count="false">
          </meg-treeselect>
        </meg-form-item>
      </div>
    </div>
    <!-- 右侧选项， 此处的显藏逻辑写在了 /scss/common-css.scss 中 -->
    <div
      class="condition__right">
      <meg-form-item
        v-show="cropScene !== 2"
        label="战法标签">
        <meg-treeselect
          ref="tacticLabelTree"
          :props="{'label': 'name', 'children': 'tactics'}"
          :data="tacticLabelArray"
          :default-checked-keys="checkedTactics"
          :default-expand-all="false"
          :search-height="78"
          :show-checkbox="true"
          :show-count="false"
          :brief-selected-info="true"
          @check-change="tacticLabelCheckChange">
          <div slot="search">
            <meg-radio-group
              v-model="formData.tacticType"
              @change="tacticTypeChange"
              class="tactic-radio-group">
              <meg-radio-button
                :label="'sceneTacticItems'">
                {{ $t('场景类型') }}
              </meg-radio-button>
              <meg-radio-button
                :label="'personTacticItems'">
                {{ $t('人员类型') }}
              </meg-radio-button>
            </meg-radio-group>
            <meg-input
              prefix-icon="meg-icon-search_1"
              :placeholder="'检索战法标签'"
              v-model="tacticSearchText"></meg-input>
          </div>
        </meg-treeselect>
      </meg-form-item>
      <meg-form-item
        label="自定义标签">
        <meg-treeselect
          ref="customLabelTree"
          node-key="labelId"
          :props="{'label': 'labelName'}"
          :data="customLabelArray"
          :show-checkbox="true"
          :brief-selected-info="true"
          :show-count="false">
        </meg-treeselect>
      </meg-form-item>
    </div>
  </meg-form>
</template>

<script>
import CommonCameraSelector from '@/common-components/common-camera-selector';
import MultipleSearchSrv from '../multiple-search.service';

export default {
  components: {
    CommonCameraSelector,
  },
  props: {
    isTextSearch: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      formData: {
        activeTime: [],
        tacticType: 'sceneTacticItems',
      },
      // 标签检索文字
      tacticSearchText: '',
      // 常访区域数据
      areaListArray: [],
      // 战法标签map
      tacticLabelMap: {},
      // 自定义标签数据
      customLabelArray: [],
      // 缓存选中的战法标签
      checkedTactics: [],
    };
  },
  computed: {
    // 战法标签选项
    tacticLabelArray() {
      const tactic = this.tacticLabelMap[this.formData.tacticType];
      return (tactic && tactic.items) || [];
    },
    // 裁剪场景 0 全量  1 无慧寻 2 有全息档案
    cropScene() {
      return +this.$store.getters.systemByType('cropScene').value;
    }
  },
  watch: {
    tacticSearchText(newVal) {
      if (this.$refs.tacticLabelTree) this.$refs.tacticLabelTree.filter(newVal);
    }
  },
  mounted() {
    this.getLabelList();
    this.getAreaList();
    this.getTacticLabelList();
  },
  methods: {
    /**
     * 战法标签选择发生改变
     */
    tacticLabelCheckChange() {
      this.checkedTactics = this.$refs.tacticLabelTree.getSelectedKeys();
    },
    /**
     * 战法类型发生改变
     */
    tacticTypeChange() {
      this.tacticSearchText = '';
    },
    /**
     * 获取检索条件
     * @returns Object
     */
    getCondion() {
      // 出没地点
      const activeList = this.$refs.cameraSelector.getCheckedKeys();
      if (!this.isTextSearch) {
        return {
          activeList,
          ...this.formData,
        };
      }
      return {
        // 出没地点
        activeList,
        // 常访区域
        frequencyList: this.$refs.areaListTree.getSelectedKeys(),
        // 战法标签
        tacticLabelIds: this.$refs.tacticLabelTree.getSelectedKeys(),
        // 自定义标签
        customLabelIds: this.$refs.customLabelTree.getSelectedKeys(),
        ...this.formData,
      };
    },
    /**
     * 请求标签
     */
    getLabelList() {
      const params = {
        'condition': { 'disableSystemLabel': true },
        'order': [{
          'field': 'createtime',
          'dire': 'desc'
        }],
        'pageNo': 1,
        'pageSize': 10000,
      };
      MultipleSearchSrv.getLabelList(params).then((res) => {
        console.log(res);
        if (res.code === 0) {
          this.customLabelArray = res.data.records;
        }
      });
    },
    /**
     * 请求常访区域列表
     */
    getAreaList() {
      MultipleSearchSrv.getAreaList().then((res) => {
        console.log(res);
        if (res.code === 0) {
          const result = res.data.map((item) => {
            item.flag = 'dataBase';
            return item;
          });
          this.areaListArray = [
            {
              name: '全部',
              items: result,
              id: 'ALL'
            },
          ];
        }
      });
    },
    /**
     * 请求战法标签
     */
    getTacticLabelList() {
      MultipleSearchSrv.getTacticLabelList().then((res) => {
        if (res.code === 0) {
          this.tacticLabelMap = res.data;
        }
      });
    },
  }
};
</script>

<style lang="scss" scoped>
  @import '../scss/common-css.scss';
  .document-condition__wrap{
    @include wrap-style;
  }
  .tactic-radio-group{
    width: 100%;
    margin-bottom: 4px;
    .meg-radio-button{
      width: 50%;
    }
    ::v-deep .meg-radio-button__inner {
      width: 100%;
    }
  }

</style>
