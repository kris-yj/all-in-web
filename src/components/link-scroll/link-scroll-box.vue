<template>
  <div class="link-scroll-box">
    <slot></slot>
  </div>
</template>
<script>
// link-scroll-box类似于form组件，link-scroll-item类似于form组件中的item，放置锚点项, link-scroll-container为中间组件，放置菜单或内容
// 整体为发布订阅模式，box组件提供eventBus,link-scroll-container中的内容更新时，会向box发送对应更新缓存的请求
// 缓存主要有三类：
// 1. compAnchorMaps ：{body: map, menu: map} map是组件和锚点的映射 component-anchor
// 2. anchorCompMaps ：{body: map, menu: map} map是锚点和组件的映射 anchor-component
// 3. itemTree ：{body: {}, menu: {}} obj是菜单和主体内容的link-scroll-item树结构，树节点的结构为{ component: link-scroll-item, parent, children }
// 这种缓存结构，可以在确定锚点或点击的link-scroll-item组件时，先找到节点，再找到该锚点在其他组对应的组件
// 锚点的值根据itemTree确定，由于body和menu的components结构中可能会包含非link-scroll-item组件，若以components结构计算锚点，可能会导致body和menu的锚点值计算不一致
// itemTree的生成思路是，根据组件的components结构，过滤其中为link-scroll-item的项，对于其他组件包link-scroll-item组件的情况，此时将link-scroll-item组件对于的节点深度-1
import { debounce } from 'lodash';
import stateMixin from '@/mixins/state.mixin';
import LinkScrollItem from './link-scroll-item';
import {
  typeEnum, getName, evtName
} from './const';

const { genMenu, menuItemClick, addContainer } = evtName;
const scrollDebounceTime = 300;
export default {
  name: 'LinkScrollBox',
  provide() {
    return {
      scrollBox: this,
    };
  },
  mixins: [stateMixin],
  props: {
    // 锚点菜单项可视区域小于menuMinShowHeight时，触发菜单滚动条的滚动
    menuMinShowHeight: {
      type: Number,
      default: 20
    },
    // 触发菜单滚动后，锚点项距离滚动容器顶部的距离
    menuTopPadding: {
      type: Number,
      default: 200
    },
    // 滚动body部分时，当锚点项不可见程度达到scrollBodyRate时切换锚点（锚点项滚到80%区域看不见时，锚点变为下一项）
    scrollBodyRate: {
      type: Number,
      default: 0.8
    },
  },
  data() {
    return {
      anchorId: '' // 锚点id.如相对于itemTree获取的路径是[0,1,2,1],锚点为0-1-2-1，连接符为参数connector
    };
  },
  state() {
    const scrollCB = debounce(this.scrollBodyCB, scrollDebounceTime);
    return {
      connector: '-',
      compAnchorMaps: {},
      anchorCompMaps: {},
      itemTree: {},
      funcObj: {
        [typeEnum.menu]: this.scrollMenuToAnchor,
        [typeEnum.body]: this.scrollBodyToAnchor
      },
      scrollCB,
    };
  },
  watch: {
    // 锚点变化时，手动修改组件的active状态
    // 想不到其他的办法，link-scroll-item为插槽，由用户去用，没法确定在哪一层，也没法控制哪些参数要传，只能手动改变组件的状态
    anchorId(val) {
      if (!val) return;
      // 先清空所有avtive,再设置锚点组件的active状态
      Object.keys(this.anchorCompMaps).forEach((key) => {
        const compAnchorMap = this.compAnchorMaps[key];
        [...compAnchorMap.keys()].forEach((comp) => {
          comp.isActive = false;
          if (compAnchorMap.get(comp) === val) comp.isActive = true;
        });
      });
    }
  },
  created() {
    this.$on(addContainer, this.setRelation);
    this.$on(menuItemClick, this.menuItemClick);
  },
  methods: {
    /** ===========================================相关信息收集部分================================================= */
    /**
     * @description 触发addContainer时，进行信息收集，事件绑定等操作
     * @param {String} type link-scroll-container类型，如body,menu等
     * @param {Object} comp 触发事件时将link-scroll-container组件抛过来
     */
    setRelation(type, comp) {
      this.$off(type);
      this.$on(type, this.funcObj[type]);
      this.collectInfo(type, comp);
      if (type === typeEnum.body) {
        this.$emit(genMenu, this.itemTree.body); // 无论是否需要自动生成菜单，此处先触发生成菜单事件并抛出相关数据
        comp.$el.removeEventListener('scroll', this.scrollCB); // 保持事件唯一，为保证可拓展性，不使用DOM 0级事件
        comp.$el.addEventListener('scroll', this.scrollCB, { passive: true });
      }
      this.setDefaultAnchor(type);
    },

    /**
     * @description 收集双向联动滚动条所需的数据
     * @param {String} groupName link-scroll-container类型，如body,menu等
     * @param {Object} comp link-scroll-container对应的组件
     */
    collectInfo(groupName, comp) {
      this.compAnchorMaps[groupName] = new Map();
      this.anchorCompMaps[groupName] = new Map();
      this.itemTree[groupName] = this.genPureTree(comp);
      // this.anchorCompMaps[groupName] = this.getTreeLeaf(this.itemTree[groupName]);
      const compToAnchor = this.compAnchorMaps[groupName];
      const anchorToComp = this.anchorCompMaps[groupName];
      const root = this.itemTree[groupName];
      const checkArr = [...root.children];
      // 后序遍历
      while (checkArr.length) {
        const item = checkArr.shift();
        const idArr = this.getItemPath(item, root);
        const id = idArr.join(this.connector);
        compToAnchor.set(item.component, id);
        // compToAnchor.set(id, item.component);
        anchorToComp.set(id, item.component);
        checkArr.unshift(...item.children);
      }
    },

    /** ===========================================菜单栏部分================================================= */
    /**
     * @description 点击菜单时触发的函数
     * @param {Object} comp 点击的link-scroll-item项
     */
    menuItemClick(comp) {
      // 先查询comp对应的key，根据key在itemTree中找到对应的item节点，再找到item节点的第一个子节点，讲子节点对应的key作为id
      // 场景：点击目录1-1，若其下面有1-1-1-1目录，则锚点跳转到1-1-1-1
      const compAnchorMap = this.compAnchorMaps[typeEnum.menu];
      const anchor = compAnchorMap.get(comp);
      const nodeItem = this.getItemByAnchor(anchor, typeEnum.menu);
      const firstChildItem = this.getFirstItem(nodeItem);
      this.anchorId = compAnchorMap.get(firstChildItem.component);
      this.$emit(typeEnum.body);
    },
    scrollMenuToAnchor() {
      const menuEle = this.itemTree[typeEnum.menu].component.$el;
      const menuEleTop = menuEle.getBoundingClientRect().top;
      const menuClientHeight = menuEle.clientHeight;
      const anchorComp = this.anchorCompMaps[typeEnum.menu].get(this.anchorId);
      if (!anchorComp || !anchorComp.$el) return; // menu内容为空时
      const anchorEle = anchorComp.$el;
      const anchorEleTop = anchorEle.getBoundingClientRect().top;
      const topOff = anchorEleTop - menuEleTop;
      // 战法组滚动时，菜单锚点项只有太靠上或太靠下这类在不可见状态的时候才会滚动
      if (topOff > 0 && topOff < menuClientHeight - this.menuMinShowHeight) {
        return;
      }
      const toTop = topOff - this.menuTopPadding;
      menuEle.scrollBy({ top: toTop, behavior: 'smooth' });
    },
    /** ===========================================内容主题部分================================================= */
    scrollBodyToAnchor() {
      // 由于layout组件左侧菜单栏高度高于100%，利用element.scrollIntoView滚动时，若参数配置{block:'start'}，会让
      // layout左侧菜单栏一起滚动，因此使用groupsEle.scrollBy进行滚动
      const groupsEle = this.itemTree[typeEnum.body].component.$el;
      const anchorItem = this.anchorCompMaps[typeEnum.body].get(this.anchorId);
      if (!anchorItem) return;
      const AnchorEle = anchorItem.$el;
      const toTop = AnchorEle.getBoundingClientRect().top - groupsEle.getBoundingClientRect().top;
      groupsEle.scrollBy({ top: toTop, behavior: 'smooth' });
    },
    scrollBodyCB() {
      const bodyCompAnchorMap = this.compAnchorMaps[typeEnum.body];
      const bodyAnchorCompMap = this.anchorCompMaps[typeEnum.body];
      const scrollContent = this.itemTree[typeEnum.body].component.$el;
      // 滚动条在最上面无疑问锚点是第一个，但是滚动条在最下面，checkAnchor判定的锚点不一定是最后一个(最后几项高度较低时的情况)
      // 因此先判断是否滚到底了，若滚到底则判断当前项是否满足锚点规则，满足则不再次去触发同步给左侧联动的菜单锚点
      if (scrollContent.scrollTop + scrollContent.clientHeight >= scrollContent.scrollHeight) {
        const anchorItem = bodyAnchorCompMap.get(this.anchorId);
        const isAnchor = this.checkBodyAnchor(anchorItem);
        if (isAnchor) return;
      }
      const anchorItem = this.findBodyAnchorComp();
      this.anchorId = bodyCompAnchorMap.get(anchorItem);
      this.$emit(typeEnum.menu);
    },
    findBodyAnchorComp() {
      let checkArr = this.itemTree[typeEnum.body].children;
      let anchorItem = null;
      while (checkArr && checkArr.length) {
        const findItem = checkArr.find((item) => this.checkBodyAnchor(item.component));
        if (!findItem) return anchorItem;
        if (findItem.children) {
          checkArr = findItem.children;
        }
        anchorItem = findItem;
      }
      return anchorItem.component;
    },
    checkBodyAnchor(comp) {
      const container = this.itemTree[typeEnum.body].component.$el;
      const item = comp.$el;
      const { top } = item.getBoundingClientRect();
      const isAnchor = this.scrollBodyRate * item.clientHeight + top - container.offsetTop > 0;
      return isAnchor;
    },
    /** ===========================================通用工具方法================================================= */
    /**
     * @description 一般首次加载时，锚点默认设置为第一个link-scroll-item后代中满足锚点条件的节点
     * @param {String} type link-scroll-container类型，如body,menu等
     */
    setDefaultAnchor(type) {
      const isAllRender = Object.values(typeEnum)
        .reduce((condi, key) => this.compAnchorMaps[key] && this.compAnchorMaps[key].size > 0 && condi, true);
      if (!isAllRender) return;
      const firstItem = this.getFirstItem(this.itemTree[type]);
      if (firstItem) {
        const anchorId = this.compAnchorMaps[type].get(firstItem.component);
        if (anchorId) {
          // 强制出发anchorId的watch
          this.anchorId = null;
          this.$nextTick(() => {
            this.anchorId = anchorId;
            this.$emit(type);
          });
        }
      }
    },
    /**
     * @description 遍历组件，将其后代组件中的link-scroll-item项提取并生成新的树，此处由于获取itemTree中项的方法
     * @param {Object} comp 组件元素
     */
    genPureTree(comp) {
      const createNode = (item, parent = null, children = []) => ({ component: item, parent, children });
      const root = createNode(comp);
      const checkArr = comp.$children.map((item) => createNode(item, root));
      // 采用层次遍历
      while (checkArr.length) {
        const checkItem = checkArr.shift();
        const checkComp = checkItem.component;
        let extraNodeArr = [];
        if (this.checkIsItem(checkComp)) {
          checkItem.parent.children.push(checkItem);
          extraNodeArr = checkComp.$children.map((item) => createNode(item, checkItem));
        } else {
          // 如果检查节点不是link-scroll-item, 其子节点层级提高一级
          extraNodeArr = checkComp.$children.map((item) => createNode(item, checkItem.parent));
        }
        checkArr.unshift(...extraNodeArr);
      }
      return root;
    },
    getItemPath(item, root) {
      const pathArr = [];
      let checkItem = item;
      while (checkItem && checkItem !== root) {
        const index = checkItem.parent.children.indexOf(checkItem);
        pathArr.unshift(index);
        checkItem = checkItem.parent;
      }
      return pathArr;
    },
    checkIsItem(item) {
      const itemName = LinkScrollItem.name;
      return getName(item) === itemName;
    },
    getFirstItem(root) {
      if (!root) return null;
      let checkItem = root;
      while (checkItem.children && checkItem.children.length) {
        [checkItem] = checkItem.children;
      }
      return checkItem;
    },
    getItemByAnchor(anchor, groupName) {
      if (!anchor) return null;
      const path = anchor.split(this.connector);
      return path.reduce((obj, key) => obj.children[key], this.itemTree[groupName]);
    }
  }
};
</script>
<style lang="scss" scoped>
</style>
