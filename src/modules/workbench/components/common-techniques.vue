<template>
  <div class="common-techniques">
    <div class="title">
      常用技战法（{{ techniques.length }}）
    </div>
    <ul class="content">
      <li
        v-for="(t, index) in techniques"
        :key="t.id"
        class="technique-item"
        @click="onTechniqueClick(t)"
        v-event-tracking="'WorkBenchOftenClickMenu'">
        <div
          class="block"
          :style="getBlockStyle(index)">
          <meg-icon
            class="icon"
            :name="getIconName(t)">
          </meg-icon>
        </div>
        <div class="name">
          {{ t.technicalName }}
        </div>
        <meg-tooltip
          content="删除">
          <meg-icon
            class="icon delete"
            name="delete_1"
            @click.stop="onTechniqueDelete(t)">
          </meg-icon>
        </meg-tooltip>
      </li>
      <meg-popover
        placement="right"
        width="270"
        popper-class="common-techniques-popover"
        @show="onPopoverShow">
        <meg-tree
          show-checkbox
          ref="judgesAfterTree"
          search-placeholder="搜索技战法名称"
          :default-expand-all="true"
          :data="allJudgesAfter"
          :props="judgesAfterProps"
          @check-change="onJudgesAfterCheck">
        </meg-tree>
        <li
          class="technique-item"
          slot="reference">
          <div class="block add">
            <meg-icon
              class="icon add"
              name="icon_plus">
            </meg-icon>
          </div>
          <div class="name">
            添加常用
          </div>
        </li>
      </meg-popover>
    </ul>
  </div>
</template>
<script>
import map from 'lodash/map';
import { utils, switchToModule } from '@/utils/utils';

export default {
  props: {
    techniques: {
      type: Array,
      default: () => []
    },
    allJudgesAfter: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      judgesAfterProps: {
        'label': 'technicalName'
      }
    };
  },
  methods: {
    /**
     * 获取功能模块的icon，为了兼容没有icon字段的菜单项，icon名为 ${alias}_menu
     */
    getIconName(technique) {
      const { technicalAlias, technicalIcon } = technique;
      if (technicalIcon && technicalIcon !== '') {
        return technicalIcon;
      }
      return `${technicalAlias}_menu`;
    },
    /**
     * 色块规则
     */
    getBlockStyle(index) {
      return {
        background: utils.pickColorForJudge(index)
      };
    },
    /**
     * 技战法删除事件
     */
    onTechniqueDelete(technique) {
      this.$emit('technique-checked', technique, false);
    },
    /**
     * 技战法点击跳转逻辑
     */
    onTechniqueClick(technique) {
      const {
        id, technicalAlias, technicalType, technicalProperties, technicalName, technicalIcon
      } = technique;
      // 跳转到的模块信息，固定配置：新开页面和单页模式
      const moduleInfo = {
        isBlank: true,
        pageType: 'single'
      };

      if (technicalType === 0) {
        // technicalType=0表示是菜单模块，跳转到对应的菜单模块
        moduleInfo.module = technicalAlias;
      } else {
        // technicalType=1表示是自定义技战法，跳转主题检索模块
        // query Id是技战法Id
        moduleInfo.module = 'subject-search';
        moduleInfo.query = {
          technicalId: id,
          technicalProperties,
          technicalName,
          technicalIcon
        };
      }

      switchToModule(moduleInfo);
    },
    /**
     * 树显示后设置选中
     */
    onPopoverShow() {
      this.$refs.judgesAfterTree.resize();
      this.$refs.judgesAfterTree.setCheckedKeys(map(this.techniques, 'id'));

      // 点击添加常用技战法数据埋点
      this.eventTracking('WorkBenchAdd');
    },
    /**
     * 点击添加或删除事件
     */
    onJudgesAfterCheck(node, isChecked) {
      this.$emit('technique-checked', node.data, isChecked);
    }
  },
};
</script>
<style lang="scss" scoped>
.common-techniques {
  margin-top: 42px;

  .title {
    font-size: 16px;
    font-weight: 700;
    padding-left: 21px;
    margin-bottom: 10px;
  }
  .content {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;

    .technique-item {
      width: 98px;
      height: 120px;
    }
  }
}
.technique-item {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all .2s ease;

  &:hover {
    background: #F2F4F8;
    .icon.delete {
      display: inline-block;
    }
  }

  .icon {
    width: 24px;
    height: 24px;
    color: #ffffff;

    &.add {
      color: #21539B;
    }

    &.delete {
      height: 14px;
      width: 14px;
      color: #869ABB;
      position: absolute;
      display: none;
      right: 3px;
      top: 3px;
    }
  }
  .block {
    width: 56px;
    height: 56px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;

    &.add {
      background: #FFFFFF;
      border: 1px solid rgba(210,214,222,0.50);
      border-radius: 8px;
    }
  }
  .name {
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
<style>
.common-techniques-popover {
  height: 418px;
  width: 270px;
}
</style>
