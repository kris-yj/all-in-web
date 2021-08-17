<template>
  <div class="modules-edit-wrapper">
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
    <div class="content">
      <!-- 常用功能-->
      <div
        v-if="!isSearchMode"
        class="module-content">
        <div
          v-for="firstMenu in allMenusAndJudgesAfter.menus"
          :key="firstMenu.id">
          <div class="sub-title">
            {{ firstMenu.name }}({{ firstMenu.childPermissions.length }})
          </div>
          <ul
            v-if="firstMenu.childPermissions.length === 0"
            class="menu-list">
            <li
              :class="['menu-item', isSelected(firstMenu.alias, 'module')? 'selected' : '']"
              @click="onItemClick(firstMenu, 'module', !isSelected(firstMenu.alias, 'module'))">
              <p class="name">
                {{ firstMenu.name }}
              </p>
              <!-- <meg-checkbox class="item-checkbox"></meg-checkbox> -->
              <div class="item-checkbox"></div>
            </li>
          </ul>
          <ul
            v-else
            class="menu-list">
            <li
              :class="['menu-item', isSelected(secondMenu.alias, 'module')? 'selected' : '']"
              v-for="secondMenu in firstMenu.childPermissions"
              :key="secondMenu.id"
              @click="onItemClick(secondMenu, 'module', !isSelected(secondMenu.alias, 'module'))">
              <p class="name">
                {{ secondMenu.name }}
              </p>
              <div class="item-checkbox"></div>
            </li>
          </ul>
        </div>
      </div>
      <!-- 技战法-->
      <div
        v-if="!isSearchMode"
        class="techniques-content">
        <div class="sub-title">
          事后研判({{ allMenusAndJudgesAfter.allJudgesAfter.length }})
        </div>
        <ul
          class="menu-list">
          <li
            class="menu-item"
            :class="['menu-item', isSelected(j.technicalAlias, 'technique')? 'selected' : '']"
            v-for="j in allMenusAndJudgesAfter.allJudgesAfter"
            :key="j.id"
            @click="onItemClick(j, 'technical', !isSelected(j.technicalAlias, 'technique'))">
            <!-- <div class="bg-block"></div> -->
            <p class="name">
              {{ j.technicalName }}
            </p>
            <div class="item-checkbox"></div>
          </li>
        </ul>
      </div>
      <div
        v-if="isSearchMode"
        class="module-content search-content">
        <ul
          class="menu-list">
          <li
            :class="['menu-item', isSelected(matchedModule.alias? matchedModule.alias : matchedModule.technicalAlias, matchedModule.alias? 'module' : 'technique')? 'selected' : '']"
            v-for="matchedModule in searchMatchedModules"
            :key="matchedModule.id"
            @click="onItemClick(matchedModule, matchedModule.alias? 'module' : 'technique', !isSelected(matchedModule.alias? matchedModule.alias : matchedModule.technicalAlias, matchedModule.alias? 'module' : 'technique'))">
            <p class="name">
              {{ matchedModule.name? matchedModule.name : matchedModule.technicalName }}
            </p>
            <div class="item-checkbox"></div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

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
    allUserDatas() {
      const datas = {
        userModules: [],
        userTechniques: []
      };
      datas.userModules = this.$store.state.quickNavigation.userModules;
      datas.userTechniques = this.$store.state.quickNavigation.userTechniques;

      return datas;
    },
    isSearchMode() {
      return this.searchMode;
    }
  },
  methods: {
    isSelected(alias, type) {
      const key = type === 'module' ? 'alias' : 'technicalAlias';
      const arr = type === 'module' ? this.allUserDatas.userModules : this.allUserDatas.userTechniques;

      const data = _.find(arr, (m) => m[key] === alias);

      if (data) return true;
      return false;
    },
    onItemClick(data, type, isChecked) {
      const key = type === 'module' ? 'alias' : 'technicalAlias';
      const arr = type === 'module' ? this.$store.state.quickNavigation.userModules
        : this.$store.state.quickNavigation.userTechniques;
      if (isChecked) {
        arr.push(data);
      } else {
        arr.splice(_.findIndex(arr, (m) => m[key] === data[key]), 1);
      }
    },
    onSearchChange(value) {
      const matchModules = [];

      if (value.trim() === '') {
        this.searchMatchedModules = [];
        return;
      }

      const { menus, allJudgesAfter } = this.allMenusAndJudgesAfter;

      menus.forEach((firstMenu) => {
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

      allJudgesAfter.forEach((JudgeAfter) => {
        if (JudgeAfter.technicalName.indexOf(value) !== -1) {
          matchModules.push(JudgeAfter);
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
.modules-edit-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  // padding: 10px 10px 10px 30px;
  overflow: hidden;
  box-sizing: border-box;

  .search-area {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 15px 30px 10px 30px;
    flex-shrink: 0;

    .search-input {
      // margin-top: 3px;
      // margin-bottom: 8px;
      width: 380px;

      ::v-deep.meg-input__inner {
        // background: rgba(255,255,255,0.06);
        // border: 1px solid rgba(255,255,255,0.24);
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
      // transition: border-color .2s cubic-bezier(.645,.045,.355,1);
      width: 100%;
      color: #869ABB;
      background-image: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, #FFFFFF 100%);
      border: 1px solid #D2D6DE;
      cursor: pointer;
    }

    .search-mode-cancel {
      cursor: pointer;
    }
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: 5px 10px 5px 30px;
  }

  .module-content {
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-color: rgb(255, 255, 255, 0.1);
    padding-bottom: 20px;

    &.search-content {
      border: none;
    }
  }
  .techniques-content {
    // margin-top: 30px;
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
      margin: 0 8px 10px 0;
      border: 1px solid #D2D6DE;
      border-radius: 4px;
      cursor: pointer;

      .name {
        font-size: 14px;
        color: #435068;;
        text-align: center;
      }

      .item-checkbox {
        position: absolute;
        right: 1px;
        top: 1px;
        width: 12px;
        height: 12px;
        background: rgba(255,255,255,0.20);
        border: 1px solid #D2D6DE;
        display: inline-block;
        border-radius: 2px;
        box-sizing: border-box;
        transition: all .1s ease;

        &:after {
          box-sizing: content-box;
          content: "";
          border: 2px solid #333333;
          border-left: 0;
          border-top: 0;
          height: 5px;
          left: 3px;
          position: absolute;
          top: 0;
          transform: rotate(45deg) scaleY(0);
          width: 3px;
          transition: all .1s ease;
          transform-origin: center;
        }
      }

      &.selected {
        border: 1px solid #21539b;

        .name {
          color: #21539b;
        }

        .item-checkbox {
          border-color: transparent;
          background: #21539B;
        }

        .item-checkbox:after {
          transform: rotate(45deg) scaleY(1);
          border-color: #ffffff;
        }
      }

      &:hover {
        border-color: #21539B;
        .name {
          color: #21539B;
        }
        transition: all .1s ease;

        .item-checkbox {
          border-color: #21539B;
        }
      }
    }
  }
}
</style>
