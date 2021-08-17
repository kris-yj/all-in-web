<template>
  <div class="user-datas-wrapper">
    <div class="user-datas-content">
      <!-- 常用功能-->
      <div class="modules">
        <div class="title">
          常用功能({{ userModules.length }})
        </div>
        <draggable
          class="content"
          v-model="userModules"
          draggable=".draggable-item"
          handle=".draggable-handle">
          <div
            v-for="m in userModules"
            :key="m.id"
            :class="[isEdit? 'draggable-item' : '', 'item', 'draggable-handle']"
            @click="onModuleItemClick(m, 'module')">
            <!-- <div class="bg-block"></div> -->
            <div class="item-content">
              <div class="icon">
                <meg-icon
                  class="icon"
                  :name="getIconName(m, 'module')">
                </meg-icon>
              </div>
              <p class="name">
                {{ m.name }}
              </p>
            </div>
            <div
              class="del-btn"
              v-if="isEdit"
              @click="onDelete(m, 'module')">
              <div class="del-btn-content">
                -
              </div>
            </div>
          </div>
        </draggable>
      </div>
      <!-- 常用技战法-->
      <div class="techniques">
        <div class="title">
          常用技战法({{ userTechniques.length }})
        </div>
        <draggable
          class="content"
          v-model="userTechniques"
          draggable=".draggable-item"
          handle=".draggable-handle">
          <div
            v-for="t in userTechniques"
            :key="t.id"
            :class="[isEdit? 'draggable-item' : '', 'item', 'draggable-handle']"
            @click="onModuleItemClick(t, 'technique')">
            <div class="bg-block"></div>
            <div class="item-content">
              <div class="icon">
                <meg-icon
                  class="icon"
                  :name="getIconName(t, 'technique')">
                </meg-icon>
              </div>
              <p class="name">
                {{ t.technicalName }}
              </p>
            </div>
            <div
              class="del-btn"
              v-if="isEdit"
              @click="onDelete(t, 'technique')">
              <div>-</div>
            </div>
          </div>
        </draggable>
      </div>
    </div>
    <div
      class="system-module-btn"
      v-show="!isEdit"
      @click="onOpenSystemMenu">
      <meg-icon name="more_menu"></meg-icon>
      <div>
        <p>系统目录</p>
      </div>
    </div>
  </div>
</template>

<script>
import Draggable from 'vuedraggable';
import { switchToModule } from '@/utils/utils';

export default {
  components: {
    Draggable
  },
  props: {
    // userModulesAndTechniques: {
    //   type: Object,
    //   default: () => ({
    //     userModules: [],
    //     userTechniques: []
    //   })
    // },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    userModules: {
      get() {
        return this.$store.state.quickNavigation.userModules || [];
      },
      set(value) {
        this.$store.state.quickNavigation.userModules = value;
      }
    },
    userTechniques: {
      get() {
        return this.$store.state.quickNavigation.userTechniques || [];
      },
      set(value) {
        this.$store.state.quickNavigation.userTechniques = value;
      }
    }
  },
  methods: {
    onOpenSystemMenu() {
      this.$emit('open-system-menu');
    },
    onDelete(data, type) {
      this.$emit('data-checked', data, type, false);
    },
    onModuleItemClick(data, type) {
      if (this.isEdit) return;
      this.$emit('system-menu-swtich');

      setTimeout(() => {
        this.swtichToModule(data, type);
      }, 100);
      // this.$nextTick(function () {
      //   this.swtichToModule(data, type);
      // });
    },
    swtichToModule(data, type) {
      this.$emit('system-menu-swtich');

      if (type === 'module') {
        const { alias } = data;
        const moduleInfo = {
          isBlank: true,
          module: alias
        };
        switchToModule(moduleInfo);
      }

      if (type === 'technique') {
        const {
          id, technicalAlias, technicalType, technicalProperties, technicalName, technicalIcon
        } = data;

        // 跳转到的模块信息，固定配置：新开页面和单页模式
        const moduleInfo2 = {
          isBlank: true,
          pageType: 'single'
        };
        if (technicalType === 0) {
          // technicalType=0表示是菜单模块，跳转到对应的菜单模块
          moduleInfo2.module = technicalAlias;
        } else {
          // technicalType=1表示是自定义技战法，跳转主题检索模块
          // query Id是技战法Id
          moduleInfo2.module = 'subject-search';
          moduleInfo2.query = {
            technicalId: id,
            technicalProperties,
            technicalName,
            technicalIcon
          };
        }

        switchToModule(moduleInfo2);
      }
      // if (type === 'technique') {
      //   const {
      //     id, technicalAlias, technicalType, technicalProperties, technicalName, technicalIcon
      //   } = data;
      //   // 跳转到的模块信息，固定配置：新开页面和单页模式
      //   const moduleInfo2 = {
      //     isBlank: true,
      //     pageType: 'single'
      //   };
      //   if (technicalType === 0) {
      //     // technicalType=0表示是菜单模块，跳转到对应的菜单模块
      //     moduleInfo2.module = technicalAlias;
      //     // technicalType=1表示是自定义技战法，跳转主题检索模块
      //     // query Id是技战法Id
      //     moduleInfo2.module = 'subject-search';
      //     moduleInfo2.query = {
      //       technicalId: id,
      //       technicalProperties,
      //       technicalName,
      //       technicalIcon
      //     };

      //     switchToModule(moduleInfo2);
      //   }
      // }
    },
    /**
     * 获取功能模块的icon，为了兼容没有icon字段的菜单项，icon名为 ${alias}_menu
     */
    getIconName(module, type) {
      let iconName = '';

      if (type === 'module') {
        const { alias, icon } = module;
        if (icon && icon !== '') {
          iconName = icon;
        } else {
          iconName = `${alias}_menu`;
        }
      }
      if (type === 'technique') {
        const { technicalAlias, technicalIcon } = module;
        if (technicalIcon && technicalIcon !== '') {
          iconName = technicalIcon;
        } else {
          iconName = `${technicalAlias}_menu`;
        }
      }
      return iconName;
    },
  }
};
</script>

<style lang="scss" scoped>
.user-datas-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;

  .user-datas-content {
    flex: 1;
    // height: calc(100% - 56px);
    overflow-y: auto;
    padding: 0 2px 0 30px;
    box-sizing: border-box;
  }

  .title {
    font-size: 14px;
    font-weight: bold;
  }

  .modules {
    padding-top: 20px;
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-color: rgb(255, 255, 255, 0.1);
  }

  .techniques {
    padding-top: 20px;
  }

  .content {
    display: flex;
    flex-wrap: wrap;
    margin-top: 15px;
    margin-bottom: 20px;
  }

  .content .item {
    height: 100px;
    width: 100px;
    margin-right: 10px;
    position: relative;
    margin-top: 10px;
    border: 1px solid #d2d6de;
    cursor: pointer;
    border-radius: 4px;

    // .bg-block {
    //   position: absolute;
    //   top: 0px;
    //   border-radius: 4px;
    //   height: 100%;
    //   width: 100%;
    //   opacity: 0.1;
    //   // background-image: linear-gradient(180deg, rgba(255,255,255,0.28) 0%, #FFFFFF 100%);
    // }

    &:hover {
      background: #2da4ff;
      color: #ffffff;
      ::v-deep.meg-icon {
        color: #ffffff;
      }
    }

    .item-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 24px;
    }
    .icon {
      height: 32px;
      width: 32px;
    }
    .name {
      font-size: 14px;
      text-align: center;
      margin-top: 7px;
    }

    .del-btn {
      position: absolute;
      background: #21539b;
      width: 12px;
      height: 12px;
      line-height: 12px;
      text-align: center;
      right: 0px;
      top: 0px;
      font-weight: bold;
      color: #ffffff;
      border-radius: 3px;
      cursor: pointer;

      .del-btn-content {
        margin-top: -1px;
      }
    }

    &.draggable-item {
      cursor: move;
    }

    &.sortable-chosen,
    &.sortable-drag {
      border: 1px solid #2da4ff;
      border-radius: 4px;

      .del-btn {
        background: #ffffff;
        color: #736bed;
      }
    }

    &.sortable-ghost {
      background: rgba(115, 107, 237, 0.2);
      border: 1px dashed #736bed;
      border-radius: 4px;

      // .bg-block {
      //   background: rgba(20,18,67,0.28);
      // }

      .item-content {
        display: none;
      }
      .del-btn {
        display: none;
      }
    }
  }

  .system-module-btn {
    height: 56px;
    display: flex;
    font-size: 16px;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
    border-top: 1px solid rgba(0, 0, 0, 0.1);

    p {
      margin-left: 6px;
      font-size: 16px;
      font-weight: 500;
    }
  }
}
</style>
