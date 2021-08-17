<template>
  <page-layout>
    <template v-slot:headerTitle>
      <h3 class="title">
        事件档案详情
      </h3>
    </template>
    <template v-slot:headerContent>
      <nav class="export-modal-nav">
        <li
          class="nav-item"
          v-for="(nav, index) in headNav"
          :key="nav.name"
          @click="handleClickNav(nav)">
          <a
            :class="{'nav-active': activeIndex === index, 'nav-list': true}">{{ nav.label }}</a>
        </li>
      </nav>
    </template>
    <div class="events-detail-container">
      <router-view></router-view>
    </div>
  </page-layout>
</template>

<script>
import { switchToModule } from '@/utils/utils.js';

export default {
  components: {
  },
  data() {
    return {
      activeIndex: 0,
      headNav: [
        {
          label: '关联身份',
          name: 'relatedIdentity',
        },
        {
          label: '线索库',
          name: 'clueLibrary',
        },
        {
          label: '落脚点分析',
          name: 'addressAnalysis',
        },
        {
          label: '轨迹分析',
          name: 'trackAnalysis',
        },
        {
          label: '活动规律',
          name: 'activityRegular',
        },
        {
          label: '研判过程',
          name: 'judgeProcess'
        }
      ]
    };
  },
  watch: {
    $route(route) {
      this.navInit(route);
    },
  },
  created() {
    this.navInit(this.$route);
  },
  methods: {
    navInit(route) {
      const { name } = route;
      const idx = this.headNav.findIndex((item) => item.name === name);
      this.activeIndex = idx;
    },
    handleClickNav(nav) {
      switchToModule({
        module: nav.name,
        query: {
          eventId: this.$route.query.eventId,
        },
        pageType: 'single',
      });
    }
  }
};
</script>

<style lang="scss" scoped>
  li {
    list-style: none;
  }
  .title {
    font-size: 20px;
    color: #FFFFFF;
  }
  .events-detail-container{
    width: 100%;
    height: 100%;
  }
  .export-modal-nav{
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 56px;
    .nav-item {
      width: 80px;
      height: 56px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 42px;
      &:last-child{
        margin-right: 0;
      }
      .nav-list {
        width: 80px;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 56px;
        font-size: 16px;
        color: #DAEBFD;
        cursor: pointer;
        font-weight: 600;
        &.nav-active{
          width: 80px;
          height: 56px;
          color: #fff;
          font-weight: 600;
          position: relative;
          &:after{
            content: '';
            width: 80px;
            height: 4px;
            background: #fff;
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            animation: click-fade-in 0.2s ease-in-out;
          }
        }
        @keyframes click-fade-in {
          0%{
            opacity: 0.5;
            width: 0;
          }
          100%{
            opacity: 1;
            width: 100%;
          }
        }
      }
    }
  }
</style>
