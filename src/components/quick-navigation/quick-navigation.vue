<template>
  <div
    class="quick-nav"
    v-click-outside="handleClickOutside">
    <!-- 头部 --->
    <div
      v-if="status === 0"
      class="header">
      <div class="header-content">
        <div class="title">
          <meg-icon name="quick-nav-my"></meg-icon>
          <span style="margin-left: 6px;">我的常用</span>
          <span>（{{ userDatasCount }}）</span>
        </div>
        <div
          class="action-btn edit-btn"
          @click="onEdit">
          <meg-icon name="edit_1"></meg-icon>
          <span>编辑</span>
        </div>
      </div>
    </div>
    <div
      v-if="status === 1"
      class="header user-edit">
      <div class="user-edit-actions">
        <div
          class="action-btn"
          @click="onEditCancel">
          取消
        </div>
        <div
          class="action-btn btn"
          @click="onEditSave">
          完成
        </div>
      </div>
      <div class="add-all-btn-wrapper">
        <div
          class="add-all-btn"
          @click="onAddModule">
          <meg-icon name="add"></meg-icon>
          <span style="margin-left: 6px;">添加常用功能和技战法</span>
        </div>
      </div>
    </div>
    <div
      v-if="status === 2"
      class="header header-space">
      <div class="title">
        添加常用功能和技战法
      </div>
      <div
        @click="onAddSave"
        class="add-save-action">
        <span class="text">已选择{{ addTotalCount }}个</span>
        <span class="action-btn btn">确定</span>
      </div>
    </div>
    <div
      v-if="status === 3"
      class="header header-space">
      <div
        class="title action-btn back"
        @click="onBack">
        <meg-icon
          name="arrow_left"
          class="back-icon"></meg-icon>
        <span>返回</span>
      </div>
    </div>
    <!-- 内容区 -->
    <div
      v-loading="isUserDatasLoading"
      class="quick-nav-content">
      <!-- 我的常用功能和技战法 --->
      <div
        class="user-modules-content"
        ref="userModulesContent"
        v-show="status === 0 || status === 1">
        <user-modules
          :is-edit="status === 1"
          @open-system-menu="openSystemMenu"
          @data-checked="dataChecked"
          @system-menu-swtich="systemMenuSwtich">
        </user-modules>
      </div>
      <!-- 系统目录 --->
      <div
        v-show="status === 3"
        class="auth-modules-content">
        <auth-modules
          :all-menus-and-judges-after="allMenusAndJudgesAfter"
          @system-menu-swtich="systemMenuSwtich"
          ref="authModulesContent">
        </auth-modules>
      </div>
      <!-- 常用功能和技战法编辑 -->
      <div
        v-show="status === 2"
        class="modules-edit-content">
        <modules-edit
          :all-menus-and-judges-after="allMenusAndJudgesAfter"
          ref="moduleEdit">
        </modules-edit>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import UserModules from './user-modules.vue';
import AuthModules from './auth-modules.vue';
import ModulesEdit from './modules-edit.vue';
import QuickNavigationSrv from './quick-navigation.service';

export default {
  components: {
    UserModules,
    AuthModules,
    ModulesEdit
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // userModulesAndTechniques: {
      //   userModules: [],
      //   userTechniques: []
      // },
      allMenusAndJudgesAfter: {
        menus: [],
        allJudgesAfter: [],
      },
      isUserDatasLoading: true,
      status: 0, // 快捷导航状态：0（常用功能和技战法列表），1（常用功能和技战法编辑），2（添加常用功能和技战法），3（系统目录）
    };
  },
  computed: {
    userDatasCount() {
      const { userModules, userTechniques } = this.$store.state.quickNavigation;
      if (userModules || userTechniques) {
        return userModules.length + userTechniques.length;
      }
      return 0;
    },
    addTotalCount() {
      const { userModules, userTechniques } = this.$store.state.quickNavigation;
      return userModules.length + userTechniques.length;
    }
  },
  watch: {
    'isShow': {
      handler(isShow) {
        if (isShow) {
          this.init();
        }
      },
      immediate: true
    }
  },
  methods: {
    init() {
      this.getUserModulesAndTechniques();
      this.getAllMenusAndJudgesAfter();
    },
    /**
     * 获取用户相关的常用功能（常用功能和常用技战法）
     */
    async getUserModulesAndTechniques() {
      this.isUserDatasLoading = true;

      const allUserDatas = {
        userModules: [],
        userTechniques: []
      };

      if (this.$store.state.quickNavigation.userModules !== null) {
        allUserDatas.userModules = this.$store.state.quickNavigation.userModules;
        allUserDatas.userTechniques = this.$store.state.quickNavigation.userTechniques;
        // this.userModulesAndTechniques = allUserDatas;
        this.isUserDatasLoading = false;
        return;
      }

      const [userModules, userTechniques] = await Promise.all([QuickNavigationSrv.getUserCommonModules(), QuickNavigationSrv.getUserCommonTechniques()]);

      if (userModules.code === 0) {
        allUserDatas.userModules = userModules.data.records;
        this.$store.state.quickNavigation.userModules = userModules.data.records;
        this.$store.state.quickNavigation.userModulesOrigin = _.cloneDeep(userModules.data.records);
      }
      if (userTechniques.code === 0) {
        allUserDatas.userTechniques = userTechniques.data.records;
        this.$store.state.quickNavigation.userTechniques = userTechniques.data.records;
        this.$store.state.quickNavigation.userTechniquesOrigin = _.cloneDeep(userTechniques.data.records);
      }
      // this.userModulesAndTechniques = allUserDatas;
      this.isUserDatasLoading = false;
    },
    async getAllMenusAndJudgesAfter() {
      const allMenusAndJudgesAfter = {};
      const { menusList } = this.$store.getters;
      allMenusAndJudgesAfter.menus = menusList;

      if (this.$store.getters.modulesByAlias('judge-after')) {
        const params = {
          parentMenuId: this.$store.getters.modulesByAlias('judge-after').id
        };
        const { code, data } = await QuickNavigationSrv.getAllJudgesAfter(params);
        if (code === 0) {
          allMenusAndJudgesAfter.allJudgesAfter = data.records;
        }
      } else {
        allMenusAndJudgesAfter.allJudgesAfter = [];
      }

      this.allMenusAndJudgesAfter = allMenusAndJudgesAfter;
    },
    dataChecked(data, type, isChecked) {
      if (type === 'module') {
        this.moduleChecked(data, isChecked);
      }
      if (type === 'technique') {
        this.techniqueChecked(data, isChecked);
      }
    },
    moduleChecked(data, isChecked) {
      const { userModules } = this.$store.state.quickNavigation;
      if (isChecked) {
        userModules.push(data);
      } else {
        const index = _.findIndex(userModules, (m) => m.alias === data.alias);
        userModules.splice(index, 1);
      }
    },
    techniqueChecked(data, isChecked) {
      const { userTechniques } = this.$store.state.quickNavigation;
      if (isChecked) {
        userTechniques.push(data);
      } else {
        const index = _.findIndex(userTechniques, (m) => m.technicalAlias === data.technicalAlias);
        userTechniques.splice(index, 1);
      }
    },
    systemMenuSwtich() {
      this.$emit('quick-navigation-close');
    },
    openSystemMenu() {
      this.status = 3;
    },
    onBack() {
      this.status = 0;
      this.$refs.authModulesContent.reset();
    },
    onEdit() {
      this.status = 1;
    },
    setStatus(newStatus) {
      this.status = newStatus;
      if (newStatus === 0) {
        this.$refs.userModulesContent.scrollTo(0, 0);
        this.$refs.authModulesContent.$el.scrollTo(0, 0);
        this.$refs.authModulesContent.reset();
      }
      this.status = newStatus;
    },
    onEditCancel() {
      this.status = 0;

      const allUserDatas = {
        userModules: [],
        userTechniques: []
      };

      allUserDatas.userModules = this.$store.state.quickNavigation.userModulesOrigin;
      allUserDatas.userTechniques = this.$store.state.quickNavigation.userTechniquesOrigin;
      // this.userModulesAndTechniques = allUserDatas;
      this.$store.state.quickNavigation.userModules = allUserDatas.userModules;
      this.$store.state.quickNavigation.userTechniques = allUserDatas.userTechniques;
      this.$store.state.quickNavigation.userModulesOrigin = _.cloneDeep(allUserDatas.userModules);
      this.$store.state.quickNavigation.userTechniquesOrigin = _.cloneDeep(allUserDatas.userTechniques);
    },
    async onEditSave() {
      const technical = {
        function: [],
        commonlyTechnical: []
      };
      const { userModules, userTechniques } = this.$store.state.quickNavigation;

      userModules.forEach((m) => {
        technical.function.push({
          menuId: m.id
        });
      });

      userTechniques.forEach((t) => {
        technical.commonlyTechnical.push({
          technicalId: t.id,
          technicalType: t.technicalType
        });
      });

      await QuickNavigationSrv.batchSave(technical);

      this.status = 0;

      this.$store.state.quickNavigation.userModulesOrigin = _.cloneDeep(this.$store.state.quickNavigation.userModules);
      this.$store.state.quickNavigation.userTechniquesOrigin = _.cloneDeep(this.$store.state.quickNavigation.userTechniques);
    },
    onAddModule() {
      this.status = 2;
    },
    onAddSave() {
      this.status = 1;
      this.$refs.moduleEdit.reset();
    },
    handleClickOutside() {
      this.$emit('quick-nav-clickoutside');
    }
  }
};
</script>

<style lang="scss" scoped>
.quick-nav {
  display: flex;
  flex-direction: column;
  height: 100%;

  .header {
    display: flex;
    height: 56px;
    align-items: center;
    justify-content: space-between;
    background-color: #3D4777;

    &.header-space {
      padding: 0 30px;
    }

    .header-content {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 30px;
    }

    .add-save-action {
      .text {
        opacity: 0.8;
        font-size: 14px;
        margin-right: 10px;
      }
    }

    &.user-edit {
      flex-direction: column;
      border: none;
      height: 112px;
      margin-bottom: 10px;

      .user-edit-actions {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 56px;
        padding: 0 30px;
        box-sizing: border-box;
        flex-shrink: 0;
      }
      .add-all-btn-wrapper {
        width: 100%;
        box-sizing: border-box;
        background: #ffffff;
        padding-top: 20px;
      }
      .add-all-btn {
        width: 430px;
        height: 34px;
        line-height: 34px;
        text-align: center;
        // border: 1px solid rgba(255,255,255,0.24);
        // border-radius: 4px;
        // background: rgba(255,255,255,0.10);
        border: 1px solid #D2D6DE;
        border-radius: 4px;
        font-size: 14px;
        color: #869ABB;
        font-weight: 400;
        cursor: pointer;
        margin: 0 auto;
      }
    }

    .title {
      font-size: 16px;
      font-weight: bold;
      // margin-left: 32px;
    }

    .action-btn {
      display: inline-block;
      font-size: 14px;
      // margin-right: 30px;
      cursor: pointer;

      &.edit-btn {
        display: flex;

        span {
          margin-left: 8px;
        }
      }

      &.back {
        display: flex;
        align-items: center;
      }

      .back-icon {
        height: 10px;
        margin-right: 5px;
      }

      &.btn {
        width: 68px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        border: 1px solid rgb(255, 255, 255, 0.24);
        border-radius: 2px;
      }
    }
  }
  .quick-nav-content {
    flex: 1;
    color: #435068;

    ::v-deep.meg-loading-mask {
      background: none;
    }

    .user-modules-content,
    .auth-modules-content,
    .modules-edit-content {
      height: 100%;
    }

    ::v-deep.meg-icon {
      color: #0091FF;
    }
  }
  .back-btn {
    cursor: pointer;
  }
}
</style>
