<template>
  <div class="recommend-techniques">
    <div class="title">
      系统推荐技战法（{{ techniques.length }}）
    </div>
    <ul class="content">
      <li
        v-for="(t, index) in techniques"
        :key="t.id"
        class="technique-item"
        @click="onTechniqueClick(t)"
        v-event-tracking="'WorkBenchRecommendClickMenu'">
        <div class="block">
          <meg-icon
            class="icon"
            :name="getIconName(t)"
            :style="getIconStyle(index)">
          </meg-icon>
        </div>
        <div class="name">
          {{ t.technicalName }}
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import { utils, switchToModule } from '@/utils/utils';

export default {
  props: {
    techniques: {
      type: Array,
      default: () => []
    }
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
    getIconStyle(index) {
      const color = utils.pickColorForJudge(index);
      return {
        color,
      };
    },
    /**
     * 技战法点击跳转逻辑
     */
    onTechniqueClick(technique) {
      const { id, technicalAlias, technicalType } = technique;
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
        moduleInfo.module = 'theme-search';
        moduleInfo.query = {
          technicalId: id
        };
      }

      switchToModule(moduleInfo);
    },
  }
};
</script>
<style lang="scss" scoped>
.recommend-techniques {
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
  transition: all .2s ease;

  &:hover {
    background: #F2F4F8;
  }
  .icon {
    width: 24px;
    height: 24px;
    color: red;
  }
  .block {
    width: 56px;
    height: 56px;
    border-radius: 6px;
    background: #ffffff;
    border: 1px solid rgba(210,214,222,0.50);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
  }
  .name {
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
