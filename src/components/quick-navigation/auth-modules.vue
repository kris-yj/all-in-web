<template>
  <div class="auth-modules-wrapper">
    <div class="title">
      <meg-icon name="more_menu"></meg-icon>
      <span>系统目录</span>
      <span>({{ allSystemMenusCount }})</span>
    </div>
    <div class="search-area">
      <meg-input
        placeholder="搜索功能名称"
        class="search-input"
        v-model="searchText"
        clearable
        @input="onSearchChange"
        @clear="onSearchClear"
        v-show="searchMode"
        ref="searchInput">
        <meg-icon
          name="meg-icon-search"
          slot="prefix"
          class="meg-input__icon"
          color="#ffffff #869abb">
        </meg-icon>
      </meg-input>
      <div
        class="search-mode-cancel"
        v-show="searchMode"
        @click="onSearchModeCancel">
        取消
      </div>
      <div
        class="search-input-btn"
        @click="onSearchMode"
        v-show="!searchMode">
        <meg-icon
          name="meg-icon-search"
          slot="prefix"
          class="meg-input__icon"
          color="#ffffff #869abb">
        </meg-icon>
        搜索功能名称
      </div>
    </div>
    <div
      class="modules-content"
      v-if="!isSearchMode">
      <div
        v-for="firstMenu in allMenus"
        :key="firstMenu.id">
        <div class="sub-title">
          {{ firstMenu.name }}({{ firstMenu.childPermissions.length === 0?
            firstMenu.childPermissions.length + 1 : firstMenu.childPermissions.length }})
        </div>
        <ul
          v-if="firstMenu.childPermissions.length === 0"
          class="menu-list">
          <li
            class="menu-item"
            @click="onSystemMenuSwtich(firstMenu)">
            <div class="bg-block"></div>
            <p class="name">
              {{ firstMenu.name }}
            </p>
          </li>
        </ul>
        <ul
          v-else
          class="menu-list">
          <li
            class="menu-item"
            v-for="secondMenu in firstMenu.childPermissions"
            :key="secondMenu.id"
            @click="onSystemMenuSwtich(secondMenu)">
            <div class="bg-block"></div>
            <p class="name">
              {{ secondMenu.name }}
            </p>
          </li>
        </ul>
      </div>
    </div>
    <div
      class="modules-content search-content"
      v-else>
      <ul
        class="menu-list">
        <li
          class="menu-item"
          v-for="matchedModule in searchMatchedModules"
          :key="matchedModule.id"
          @click="onSystemMenuSwtich(matchedModule)">
          <!-- <div class="bg-block"></div> -->
          <p class="name">
            {{ matchedModule.name }}
          </p>
        </li>
      </ul>
      <!-- <div
        v-else
        class="search-empty">
        无关联项
      </div> -->
    </div>
  </div>
</template>

<script>
import { switchToModule } from '@/utils/utils';

export default {
  props: {
    allMenusAndJudgesAfter: {
      type: Object,
      default: () => ({
        menus: [],
        allJudgesAfter: []
      })
    }
  },
  data() {
    return {
      searchText: '',
      searchMatchedModules: [],
      searchMode: false
    };
  },
  computed: {
    allMenus() {
      return this.allMenusAndJudgesAfter.menus;
    },
    isSearchMode() {
      return this.searchMode;
    },
    allSystemMenusCount() {
      let count = 0;
      this.allMenus.forEach((nav) => {
        const { childPermissions } = nav;
        if (childPermissions.length === 0) {
          count += 1;
        } else {
          count += childPermissions.length;
        }
      });
      return count;
    }
  },
  methods: {
    onSystemMenuSwtich(menu) {
      const moduleInfo = {
        module: menu.alias
      };
      switchToModule(moduleInfo);
      this.$emit('system-menu-swtich');
    },
    onSearchChange(value) {
      const matchModules = [];

      if (value.trim() === '') {
        this.searchMatchedModules = [];
        return;
      }

      this.allMenus.forEach((firstMenu) => {
        if (firstMenu.childPermissions.length === 0) {
          if (firstMenu.name.indexOf(value) !== -1) {
            matchModules.push(firstMenu);
          }
        } else {
          const { childPermissions } = firstMenu;
          childPermissions.forEach((secondMenu) => {
            if (secondMenu.name.indexOf(value) !== -1) {
              matchModules.push(secondMenu);
            }
          });
        }
      });
      this.searchMatchedModules = matchModules;
    },
    onSearchClear() {
      this.searchMatchedModules = [];
      this.$nextTick(() => {
        this.$refs.searchInput.focus();
      });
    },
    onSearchMode() {
      this.searchMode = true;
      this.$nextTick(() => {
        this.$refs.searchInput.focus();
      });
    },
    onSearchModeCancel() {
      this.searchMode = false;
      this.searchText = '';
      this.searchMatchedModules = [];
    },
    reset() {
      this.searchText = '';
      this.searchMatchedModules = [];
    }
  }
};
</script>

<style lang="scss" scoped>
.auth-modules-wrapper {
  height: 100%;
  padding-top: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .title {
    padding-left: 30px;
    height: 50px;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    flex-shrink: 0;

    span {
      margin-left: 6px;
    }
  }

  .modules-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 2px 0 30px;

    &.search-content {
      padding-top: 20px;
    }
  }

  .search-empty {
    opacity: 0.4;
    font-size: 14px;
    // color: #FFFFFF;
    text-align: center;
  }

  .search-area {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding-right: 15px;
    padding-left: 30px;

    .search-input {
      margin-top: 7px;
      margin-bottom: 7px;
      width: 380px;
      // margin-right: 10px;

      ::v-deep.meg-input__inner {
        // color: #ffffff;
        // background: rgba(255,255,255,0.06);
        // border: 1px solid rgba(255,255,255,0.24);
      }

      ::v-deep.meg-input__icon {
        // color: #ffffff;
      }
    }

    .search-input-btn {
      border-radius: 2px;
      border: 1px solid #d2d6de;
      box-sizing: border-box;
      display: inline-block;
      font-size: inherit;
      height: 34px;
      line-height: 34px;
      outline: none;
      padding: 0 12px;
      transition: border-color .2s cubic-bezier(.645,.045,.355,1);
      width: 100%;
      color: #869ABB;
      // background: hsla(0,0%,100%,.06);
      border: 1px solid #D2D6DE;
      cursor: pointer;
    }

    .search-mode-cancel {
      cursor: pointer;
    }
  }

  .sub-title {
    font-size: 14px;
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 14px;
  }

  .menu-list {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;

    .menu-item {
      width: 100px;
      height: 44px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 10px 10px 0;
      cursor: pointer;
      border-radius: 4px;
      border: 1px solid #D2D6DE;

      // .bg-block {
      //   position: absolute;
      //   top: 0px;
      //   height: 100%;
      //   width: 100%;
      //   opacity: 0.1;
      //   background-image: linear-gradient(180deg, rgba(255,255,255,0.28) 0%, #FFFFFF 100%);
      //   border-radius: 4px;
      // }

      .name {
        font-size: 14px;
        // color: #F4F6F9;
        text-align: center;
      }

      &:hover {
        border: 1px solid #21539B;
        .name {
          color: #21539B;
        }
      }
    }
  }
}
</style>
