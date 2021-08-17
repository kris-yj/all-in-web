<template>
  <article class="guide fill">
    <link-scroll-box class="guide-box fill">
      <section class="guide-menu-header fill">
        {{ $t('使用引导') }}
      </section>
      <section class="guide-menu fill">
        <link-scroll-container type="menu">
          <div
            class="menu-part"
            v-for="(item,index) in menuContent"
            :key="item.header||item"
            @click="changeActive(index)">
            <p
              :class="['menu-section-0', 'menu-item',{active: isActive(index)}]"
              v-tooltip="true">
              {{ item.header||item }}
            </p>
            <section
              v-if="item.content"
              class="menu-section-1">
              <component
                class="menu-item"
                v-for="ele in item.content"
                :is="isActive(index)?'link-scroll-item':'div'"
                :key="ele"
                v-tooltip="true">
                {{ ele }}
              </component>
            </section>
          </div>
        </link-scroll-container>
      </section>
      <section class="guide-main fill">
        <link-scroll-container ref="body">
          <!-- TODO: 这边最好写个render组件，根据内容模板进行渲染，后续优化 -->
          <!-- <guide-base :description="description"></guide-base> -->
          <guide-doc
            :active-section="activeSection"></guide-doc>
        </link-scroll-container>
      </section>
    </link-scroll-box>
  </article>
</template>

<script>
import stateMixin from '@/mixins/state.mixin';
import LinkScroll from '@/components/link-scroll';
import GuideDoc from '../components/guide-doc';
import { sectionEnum } from '../components/const';

const baseMenu = [{
  header: '常用工具',
  content: [
    '一: 配置常用功能',
    '二: 快速收藏线索'
  ]
},
{
  header: '基础配置',
  content: [
    '一: 配置相机',
    '二: 设置相机小时空'
  ]
},
{
  header: '事后检索',
  content: [
    '使用综合检索'
  ]
},
{
  header: '事中预警',
  content: [
    '查看实时报警'
  ]
}];
const totalMenu = [
  {
    header: '事前管控',
    content: [
      '一: 管控基础操作',
      '二: 挖掘可疑团伙',
      '三: 管控关注人员',
      '四: 管控重点区域',
      '五: 管控潜在风险网格'
    ]
  },
  {
    header: '档案挖掘',
    content: [
      '一: 可疑人员深挖扩线',
      '二: 易发案区域治安防控'
    ]
  }
];

export default {
  components: {
    ...LinkScroll,
    GuideDoc
  },
  mixins: [stateMixin],
  data() {
    return {
      activeItem: 0,
    };
  },
  state() {
    return {
    };
  },
  computed: {
    activeSection() {
      return sectionEnum[this.activeItem];
    },
    cropState() {
      return (+this.$store.getters.systemByType('dualPlatformType').value) === 1 && (+this.$store.getters.systemByType('cropScene').value) === 0;
    },
    menuContent() {
      return this.cropState ? baseMenu.concat(totalMenu) : baseMenu;
    }
  },
  mounted() {
    const { name } = this.$route.query;
    if (name in sectionEnum) {
      this.changeActive(sectionEnum[name]);
    }
  },
  methods: {
    isActive(index) {
      return this.activeItem === index;
    },
    changeActive(index) {
      // 由于引导页点击不同菜单模块时，body内容重新加载，因此滚动条手动滚至最初位置
      if (this.activeItem === index) return;
      this.$refs.body.$el.scrollTo(0, 0);
      this.activeItem = index;
    }
  }
};
</script>

<style lang="scss" scoped>
.fill {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
}
.guide-box {
  display: grid;
  grid-template-areas:
    "menu-header main"
    "menu        main";
  grid-template-rows: 60px 1fr;
  grid-template-columns: 20% 80%;
  grid-gap: 2px 5px;
  background-color: #dce1e5;
  & > * {
    background-color: #fff;
  }
  &::v-deep {
    @for $i from 1 through 4 {
      .menu-section-#{$i} {
        padding-left: 1em * $i;
      }
    }
  }
}
.guide-menu-header {
  display: flex;
  box-sizing: border-box;
  align-items: center;
  padding-left: 20px;
  font-size: 16px;
}
.guide-menu {
  box-sizing: border-box;
  padding: 20px 0 20px 10px;
  grid-area: menu;
  .menu-item {
    box-sizing: border-box;
    padding: 0 10px;
    &::v-deep {
      &.active {
        color: #21539b;
        background-color: transparent;
      }
    }
    &:hover {
      background-color: #ebf5ff;
    }
  }
  .menu-section-0 {
    height: 40px;
    line-height: 40px;
  }
  .menu-section-1 {
    .menu-item {
      height: 40px;
      // &::before {
      //   content: "";
      //   display: inline-block;
      //   border: 3px solid;
      //   border-radius: 50%;
      //   vertical-align: middle;
      // }
      &::after {
        content: "";
        display: inline-block;
        width: 0;
        height: 100%;
        font-size: 0;
        vertical-align: middle;
      }
    }
  }
}
.guide-main {
  grid-area: main;
  .link-scroll-container {
    box-sizing: border-box;
    padding: 20px;
  }
  // body部分样式
  &::v-deep {
    .content-title {
      line-height: 60px;
      font-weight: 600;
    }
    .control-line {
      height: 50px;
      line-height: 50px;
      font-size: 16px;
      font-weight: 500;
    }
    .meg-img-container {
      min-width: 600px;
      min-height: 360px;
    }
    .desc-item {
      line-height: 1.5;
      margin-bottom: 10px;
    }
  }
}
</style>
