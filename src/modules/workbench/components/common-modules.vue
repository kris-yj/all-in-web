<template>
  <div class="common-modules">
    <div class="title">
      常用功能
    </div>
    <ul class="modules-content">
      <li
        v-for="t in userCommonModules"
        :key="t.id"
        class="module-item"
        @click="onModuleClick(t)"
        v-event-tracking="'WorkBenchFunctionClickMenu'">
        <meg-icon
          class="icon"
          :name="getIconName(t)">
        </meg-icon>
        <span class="name">
          {{ t.name }}
        </span>
        <meg-tooltip content="删除">
          <meg-icon
            class="icon delete"
            name="delete_1"
            @click.stop="onCommonModuleDelete(t)">
          </meg-icon>
        </meg-tooltip>
      </li>
      <meg-popover
        placement="left"
        width="270"
        popper-class="common-modules-popover"
        @show="onPopoverShow">
        <meg-tree
          show-checkbox
          ref="modulesTree"
          search-placeholder="搜索常用功能"
          node-key="alias"
          class="modules-tree"
          :check-strictly="true"
          :default-expand-all="true"
          :data="allMenus"
          :props="modulesProps"
          @check-change="onModuleCheck">
        </meg-tree>
        <li
          class="module-item"
          slot="reference">
          <meg-icon
            class="icon"
            name="add">
          </meg-icon>
          <span class="name">
            添加常用
          </span>
        </li>
      </meg-popover>
    </ul>
  </div>
</template>

<script>
import map from 'lodash/map';
import { switchToModule, openByNewTab } from '@/utils/utils';

export default {
  props: {
    userCommonModules: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      modulesProps: {
        'label': 'name',
        'children': 'childPermissions'
      }
    };
  },
  computed: {
    allMenus() {
      const { menusList } = this.$store.getters;
      return menusList.filter((menu) => menu.alias !== 'judge');
    }
  },
  methods: {
    /**
     * 常用功能添加popover显示
     */
    onPopoverShow() {
      this.$refs.modulesTree.resize();
      this.$refs.modulesTree.setCheckedKeys(map(this.userCommonModules, 'alias'));
    },
    /**
     * 获取功能模块的icon，为了兼容没有icon字段的菜单项，icon名为 ${alias}_menu
     */
    getIconName(module) {
      const { alias, icon } = module;
      if (icon && icon !== '') {
        return icon;
      }
      return `${alias}_menu`;
    },
    /**
     * 常用功能删除点击事件
     */
    onCommonModuleDelete(module) {
      this.$emit('module-checked', module, false);
    },
    /**
     * 树节点的check事件
     */
    onModuleCheck(node, isChecked) {
      this.$emit('module-checked', node.data, isChecked);
    },
    /**
     * 模块点击跳转逻辑
     */
    onModuleClick(module) {
      const { alias, resourceType } = module;
      // 跳转到的模块信息，如果是时候研判下的模块跳转到对应的单页模式
      const moduleInfo = {
        isBlank: true,
        module: alias
      };

      if (resourceType === 'INNERLINK') {
        // window.open(`/${alias}`);
        openByNewTab(`/${alias}`);
      } else {
        const { childPermissions } = this.$store.getters.modulesByAlias('judge-after');
        const judgesAfterAlias = childPermissions.map((m) => m.alias);
        if (judgesAfterAlias.indexOf(alias) !== -1) {
          moduleInfo.pageType = 'single';
        }
        switchToModule(moduleInfo);
      }
    },
  }
};
</script>

<style lang="scss" scoped>
.common-modules {
  padding-top: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.title {
  height: 44px;
  display: flex;
  align-items: flex-end;
  font-weight: 500;
  padding-left: 33px;
  margin-bottom: 10px;
}
.modules-content {
  flex: 1;
  overflow-y: auto;
}
.module-item {
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: left;
  padding-left: 33px;
  cursor: pointer;
  position: relative;
  transition: all .2s ease;

  &:hover {
    background: #F2F4F8;
    .icon.delete {
      display: inline-block;
    }
  }
}
.icon {
  height: 17px;
  width: 17px;
  color: #21539B;

  &.delete {
    height: 14px;
    width: 14px;
    color: #869ABB;
    position: absolute;
    display: none;
    right: 13px;
  }
}
.name {
  font-size: 14px;
  margin-left: 10px;
}
</style>
<style>
.common-modules-popover {
  height: 478px;
  width: 270px;
}
.modules-tree .meg-base-tree__node .meg-base-tree__expand-icon + .meg-tree-checkbox {
  display: none;
}
</style>
