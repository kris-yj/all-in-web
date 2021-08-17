<template>
  <div class="menu">
    <meg-side-menu :default-active="activeNav">
      <template v-for="parentNav in navs">
        <meg-side-submenu
          :key="parentNav.alias"
          :index="parentNav.alias"
          v-if="parentNav.resourceType === 'CATEGORY' && parentNav.childPermissions && parentNav.childPermissions.length > 0"
          v-show="!parentNav.hidden">
          <template slot="title">
            <meg-icon
              :name="getMenuIconName(parentNav)"
              slot="icon"></meg-icon>
            <span>{{ parentNav.name }}</span>
          </template>
          <template v-for="nav in parentNav.childPermissions">
            <meg-side-menu-item
              :key="nav.alias"
              :index="nav.alias"
              v-if="!nav.hidden"
              :route="`/${nav.alias}`">
              {{ nav.name }}
            </meg-side-menu-item>
          </template>
        </meg-side-submenu>
        <meg-side-menu-item
          :key="parentNav.alias"
          :index="parentNav.alias"
          :route="`/${parentNav.alias}`"
          v-else-if="parentNav.resourceType !== 'INNERLINK' && parentNav.resourceType !== 'LINK'">
          <meg-icon
            :name="getMenuIconName(parentNav)"
            slot="icon">
          </meg-icon>
          <span>{{ parentNav.name }}</span>
        </meg-side-menu-item>
        <li
          :key="parentNav.alias"
          v-else
          @click="toTab(parentNav.alias)"
          class="meg-menu-item">
          <span class="meg-menu-item__icon">
            <meg-icon :name="getMenuIconName(parentNav)"></meg-icon>
          </span>
          <span class="meg-menu-item__title"><span>{{ parentNav.name }}</span>
          </span>
        </li>
      </template>
    </meg-side-menu>
  </div>
</template>

<script>
import { openByNewTab } from '@/utils/utils';

export default {
  props: {
  },
  data() {
    return {
      activeNav: ''
    };
  },
  computed: {
    // 子菜单
    navs() {
      // const navs = this.$store.getters.menusList;
      const secondNavs = this.$store.getters.navsByFirst;
      consola.info('side menus: ', secondNavs);
      return secondNavs;
    },
  },
  watch: {
    $route() {
      this.setDefaultActive();
    }
  },
  created() {
    this.setDefaultActive();
  },
  methods: {
    toTab(path) {
      // window.open(`/${path}`);
      openByNewTab(`/${path}`);
    },
    setDefaultActive() {
      this.$nextTick(() => {
        const { name, meta } = this.$route;
        this.activeNav = (meta.moduleResource && meta.moduleResource.alias) || name;
        consola.info('set active side menu: ', this.activeNav);
      });
    },
    /**
     * 通过模块alias获取菜单iconName，为了兼容历史遗留icon问题
     * 通过菜单项的icon，如果设置了icon就取icon作为megvii-icon icon组件的的name
     * 如果没有icon或者icon为空，取alias_menu的形式作为icon组件的name
     */
    getMenuIconName(module) {
      const { alias, icon } = module;
      if (icon && icon !== '') {
        return icon;
      }
      return `${alias}_menu`;
    }
  }
};
</script>
<style lang="scss">
.menu {
  width: 100px;
  height: 100%;

  .meg-menu .meg-submenu.is-active .meg-submenu__title,
  .meg-menu .meg-menu-item.is-active {
    background-color: #21539b;
    color: #ffffff;
    font-weight: bold;

    .meg-icon {
      color: inherit;
    }
    .meg-menu-item__title {
      color: #ffffff !important;
      font-weight: bold;
    }
  }
  .meg-submenu__title:hover {
    background-color: rgba(33, 83, 155, 0.6);
    color: #daebfd;
  }
  .meg-side-menu .meg-submenu__title .meg-icon,
  .meg-side-menu .meg-menu-item .meg-icon {
    color: #daebfd;
  }
  .meg-menu-item:hover,
  .meg-menu-item:focus {
    background-color: rgba(33, 83, 155, 0.6);
    color: #daebfd;
  }
  .meg-submenu__title,
  .meg-menu-item {
    color: #e6f2ff;
    font-size: 13px;
    .meg-menu-item__title {
      font-size: 13px;
      color: #daebfd;
    }
    .meg-menu-item__icon{
      position: relative;
    }
  }
  .meg-submenu .meg-menu {
    background-color: #292e5a;
  }
  .sub-menu-dot{
    width: 10px;
    height: 10px;
    background-color: #f05353;
    position: absolute;
    top: -6px;
    right: -6px;
    border-radius: 5px;
    box-shadow: 1px 1px #0003;
  }
  .app-menu-item a{
    width: 100%;
    height: 100%;
    display: inline-block;
  }
}
.insight-submenu .meg-menu.meg-menu--popup .meg-menu-item {
  padding: 0 20px;
  text-align: left;
  margin: 0;
  &.is-active {
    background-color: #21539b;
    color: #ffffff;
    font-weight: bold;
    .meg-icon {
      color: inherit;
    }
    .meg-menu-item__title {
      color: #ffffff !important;
      font-weight: bold;
    }
  }
}
</style>
