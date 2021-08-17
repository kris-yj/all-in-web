<template>
  <ul class="header-menu">
    <li
      v-for="firstNav in firstNavs"
      :key="firstNav.alias"
      :class="[
        'header-menu-item',
        currentFirstNav === firstNav.alias ? 'active' : ''
      ]"
      @click="onFirstNavClick(firstNav)">
      <span
        class="text-wrapper">
        {{ `${firstNav.name}` }}
        <span
          v-if="isAlarmDotShow(firstNav)"
          class="alarm-dot"></span>
      </span>
    </li>
    <meg-popover
      v-if="moreFirstNavs.length > 1"
      popper-class="more-nav-popover"
      placement="bottom"
      width="100"
      trigger="hover"
      v-model="moreVisible">
      <ul class="more-nav-wrap">
        <li
          v-for="moreNav in moreFirstNavs"
          :key="moreNav.alias"
          class="more-nav-item"
          @click="onFirstNavClick(moreNav)">
          <span>
            {{ moreNav.name }}
          </span>
        </li>
      </ul>
      <li
        class="header-menu-more"
        :class="{
          'active': isMoreActive
        }"
        slot="reference">
        <meg-icon
          name="more_menu"
          class="more-icon">
        </meg-icon>
        <span class="more-title">{{ moreNavTitle }}</span>
      </li>
    </meg-popover>
  </ul>
</template>

<script>
import _ from 'lodash';
import { openByNewTab } from '@/utils/utils';

export default {
  props: {
    alarmCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      moreVisible: false,
    };
  },
  computed: {
    // 当前模块所属的一级导航
    currentFirstNav() {
      return this.$store.state.currentFirstNav;
    },
    // 全部的一级导航
    firstNavs() {
      const { fistNavs } = this.$store.getters;
      if (fistNavs.length > 7) {
        return fistNavs.slice(0, 6);
      }
      return fistNavs;
    },
    // 大于7个一级导航时，第六个开始列在更多里
    moreFirstNavs() {
      const { fistNavs } = this.$store.getters;
      if (fistNavs.length > 7) {
        return fistNavs.slice(6);
      }
      return [];
    },
    // 更多一级中显示的模块名
    moreNavTitle() {
      if (this.moreFirstNavs.length > 0) {
        const moreMenu = _.find(this.moreFirstNavs, (menu) => menu.alias === this.currentFirstNav);
        if (moreMenu) {
          return moreMenu.name;
        }
      }
      return this.$t('更多');
    },
    // 更多的激活样式
    isMoreActive() {
      if (this.moreFirstNavs.length > 0) {
        const moreMenu = _.find(this.moreFirstNavs, (menu) => menu.alias === this.currentFirstNav);
        if (moreMenu) {
          return true;
        }
      }
      return false;
    },
  },
  methods: {
    /**
     * 头部一级导航点击，通过判断resourceType不同的点击行为
     */
    onFirstNavClick(firstNav) {
      const { alias, resourceType } = firstNav;
      if (resourceType === 'INNERLINK' || resourceType === 'LINK') {
        // window.open(`/${alias}`);
        openByNewTab(`/${alias}`);
      } else {
        this.$router.push(`/${alias}`);
      }
    },
    isAlarmDotShow(nav) {
      const { menus } = this.$store.state;
      const alarmRealtimeModule = this.$store.getters.modulesByAlias('alarm-realtime');
      // 不存在实时报警功能，报警小红点不显示
      if (!alarmRealtimeModule) {
        return false;
      }

      const alarmRealtimeFirstNav = _.find(menus.childPermissions, (menu) => menu.id === alarmRealtimeModule.parentId);

      if (alarmRealtimeFirstNav.alias === nav.alias && this.alarmCount > 0) {
        return true;
      }
      return false;
    }
  },
};
</script>

<style lang="scss" scoped>
  .header-menu {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    height: 100%;
    flex: 1;
    color: #e6f2ff;
  }
  .header-menu-more {
    outline: none;
    .more-title {
      margin-left: 8px;
    }
  }
  .header-menu .header-menu-item,
  .header-menu-more {
    width: 88px;
    margin: 0 5px;
    height: 36px;
    line-height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
    position: relative;
  }
  .header-menu-more {
    width: 100px;
  }
  .header-menu .active {
    background-color: #555F89 !important;
    color: #ffffff;
    font-weight: bold;
    border-radius: 1px;
  }
  .header-menu .header-menu-item:hover {
    background-color: rgba(218, 235, 253, 0.2);
    border-radius: 1px;
  }
  .header-menu .meg-menu {
    background-color: #21539b;
  }
  .header-menu ul {
    overflow: hidden;
    list-style-type: none;
  }
  .header-menu ul li {
    line-height: 60px;
    height: 60px;
    float: left;
    width: 100px;
    text-align: center;
  }
  .text-wrapper {
    position: relative;
    .alarm-dot {
      width: 10px;
      height: 10px;
      background-color: #f05353;
      position: absolute;
      top: 2px;
      right: -6px;
      border-radius: 5px;
      box-shadow: 1px 1px #0003;
    }
  }
</style>

<style lang="scss">
  .more-nav-popover {
    min-width: 0 !important;
    padding: 0 !important;
    background-color: #272854 !important;
    color: #daebfd !important;
    font-size: 14px;

    .more-nav-wrap .more-nav-item {
      height: 43px;
      line-height: 43px;
      text-align: center;
    }
    .more-icon {
      vertical-align: text-bottom;
    }
    .header-menu-more:hover {
      background-color: rgba(194, 238, 255, 0.2);
    }
    .more-nav-item {
      cursor: pointer;
    }
    .more-nav-item > a {
      display: block;
      width: 100%;
      height: 100%;
      color: #daebfd !important;
      text-decoration: none;
    }
    .more-nav-item:hover {
      background-color: #21539b;
    }
    .popper__arrow:after {
      border-bottom-color: #272854 !important;
    }
  }
</style>
